/**
 * MessageQueueService — orchestrates outgoing delivery end to end:
 *   queue → encrypt → route → ensure connection → send → deliver/ack,
 * with failures moved to the retry queue under RetryService's backoff policy.
 * Emits MESSAGE_QUEUED / MESSAGE_UPDATED / MESSAGE_RECEIVED so Redux/UI mirror
 * state without knowing any transport details.
 *
 * Collaborators are injected (dependency inversion): it depends on abstractions
 * (routing, connection, transport, encryption), never on concrete transports.
 */
import EventEmitter from '../core/EventEmitter';
import { CommEvent, ConnectionState, MessageState } from '../core/constants';
import { buildPacket, serialize } from '../protocol/packet';
import { createMessage, patchMessage } from './Message';

export default class MessageQueueService extends EventEmitter {
  constructor(deps) {
    super();
    this.queue = deps.queue;
    this.encryption = deps.encryption;
    this.routing = deps.routing;
    this.connectionManager = deps.connectionManager;
    this.transportManager = deps.transportManager;
    this.retry = deps.retry;
    this.getDevice = deps.getDevice;
    this.getDevices = deps.getDevices;
    this._draining = false;
    this._retryTimers = new Set();
  }

  _update(message, patch) {
    const next = patchMessage(message, patch);
    this.queue.markSent(next);
    this.emit(CommEvent.MESSAGE_UPDATED, next);
    return next;
  }

  send(to, text, options = {}) {
    const message = createMessage({ to, text, ...options });
    this.queue.enqueueOutgoing(message);
    this.queue.markSent(message);
    this.emit(CommEvent.MESSAGE_QUEUED, message);
    this._drain();
    return message;
  }

  broadcast(text, options = {}) {
    return this.getDevices().map((device) => this.send(device.id, text, options));
  }

  /**
   * Rehydrate persisted queues after a restart. Restores (de-duplicated by id):
   * the retry queue (re-armed to run immediately), the outgoing queue, and any
   * message that was awaiting acknowledgement or interrupted mid-flight (re-
   * queued so it resends). Delivery is not started here — the caller invokes
   * resume() once, and it resumes again automatically when the network returns.
   */
  restore(persisted = {}) {
    const seen = new Set();

    (persisted.pendingRetries || []).forEach((message) => {
      if (!message?.id || seen.has(message.id)) return;
      seen.add(message.id);
      this.queue.markSent(message);
      this.queue.scheduleRetry(message, Date.now());
    });

    (persisted.queued || []).forEach((message) => {
      if (!message?.id || seen.has(message.id)) return;
      seen.add(message.id);
      this.queue.enqueueOutgoing(message);
      this.queue.markSent(message);
      this.emit(CommEvent.MESSAGE_QUEUED, message);
    });

    (persisted.history || []).forEach((message) => {
      if (!message?.id) return;
      this.queue.markSent(message); // keep delivery history for status lookups
      if (seen.has(message.id) || !this._awaitingAck(message.state)) return;
      seen.add(message.id);
      const requeued = patchMessage(message, { state: MessageState.QUEUED, error: null });
      this.queue.enqueueOutgoing(requeued);
      this.queue.markSent(requeued);
      this.emit(CommEvent.MESSAGE_UPDATED, requeued);
    });
  }

  /**
   * Resume pending transmissions: pull any due retries into the outgoing queue
   * and drain. Safe to call repeatedly — draining is idempotent while active.
   */
  resume() {
    this.queue.takeDueRetries().forEach((message) => this.queue.enqueueOutgoing(message));
    this._drain();
  }

  /** A message that was sent/in-flight but never acknowledged — safe to resend. */
  _awaitingAck(state) {
    return (
      state === MessageState.SENT ||
      state === MessageState.DELIVERED ||
      state === MessageState.SENDING ||
      state === MessageState.ROUTING ||
      state === MessageState.ENCRYPTING ||
      state === MessageState.RETRYING
    );
  }

  /** Simulate an inbound message arriving from the network. */
  receive({ from, text }) {
    const message = patchMessage(createMessage({ to: 'self', from, text }), {
      state: MessageState.RECEIVED,
    });
    this.queue.addIncoming(message);
    this.emit(CommEvent.MESSAGE_RECEIVED, message);
    return message;
  }

  async _drain() {
    if (this._draining) return;
    this._draining = true;
    try {
      let message = this.queue.dequeueOutgoing();
      while (message) {
        await this._process(message);
        message = this.queue.dequeueOutgoing();
      }
    } finally {
      this._draining = false;
    }
  }

  async _process(input) {
    let message = input;
    const device = this.getDevice(message.to);
    if (!device) {
      this._update(message, { state: MessageState.FAILED, error: 'device-unreachable' });
      return;
    }

    if (message.encrypted) {
      message = this._update(message, { state: MessageState.ENCRYPTING });
      const { cipher } = this.encryption.encrypt(message.text);
      message = this._update(message, { cipher });
    }

    message = this._update(message, { state: MessageState.ROUTING });
    const route = this.routing.selectRoute(device, {
      preferred: this.connectionManager.getConnection(device.id)?.transport,
    });
    if (!route) {
      this._update(message, { state: MessageState.FAILED, error: 'no-route' });
      return;
    }
    message = this._update(message, { route, transport: route.transport, hops: route.hops.length });

    if (!this.connectionManager.isConnected(device.id)) {
      const conn = await this.connectionManager.connect(device, route.transport);
      if (conn.state !== ConnectionState.CONNECTED) {
        this._retryOrFail(message, 'connect-failed');
        return;
      }
    }

    message = this._update(message, { state: MessageState.SENDING, attempts: message.attempts + 1 });
    try {
      // Build the real ShadowNet wire packet. Over a native transport this is
      // the exact JSON the peer device receives and parses; the mock transport
      // ignores the bytes and just reports delivery metrics.
      const wire = serialize(
        buildPacket({
          id: message.id,
          type: message.packetType || 'chat',
          from: 'self',
          to: device.id,
          payload: { text: message.text },
        })
      );
      const result = await this.transportManager.send(route.transport, device.id, wire);
      message = this._update(message, { state: MessageState.SENT });
      // DELIVERED means the local transport reported a successful write (bytes
      // left this device) — it is not proof the peer received anything. The
      // message only advances to ACKNOWLEDGED if/when acknowledge() is called
      // with a real delivery confirmation (see below).
      this._update(message, {
        state: MessageState.DELIVERED,
        confidence: result.confidence,
        latencyMs: result.latencyMs,
      });
    } catch {
      this._retryOrFail(message, 'send-failed');
    }
  }

  /**
   * Mark a message ACKNOWLEDGED — but only in response to a real delivery
   * confirmation correlated by packet id (== message.id, since the wire packet
   * is built with `id: message.id`). Sources: the native Wi-Fi Direct
   * transport's genuine peer-ack frame (TransportEvent.MESSAGE_ACKNOWLEDGED),
   * or the mock simulator's per-packet delivery echo (MockTransport's
   * `kind: 'ack'` MESSAGE event) — both real signals from their respective
   * worlds, never fabricated here. No-ops for an unknown or already-terminal
   * message (e.g. FAILED, or already ACKNOWLEDGED).
   */
  acknowledge(packetId) {
    if (!packetId) return;
    const message = this.queue.sent.get(packetId);
    if (!message || message.state === MessageState.ACKNOWLEDGED || message.state === MessageState.FAILED) return;
    this._update(message, { state: MessageState.ACKNOWLEDGED });
  }

  _retryOrFail(message, error) {
    if (this.retry.shouldRetry(message.attempts)) {
      const delay = this.retry.nextDelay(message.attempts);
      const retrying = this._update(message, { state: MessageState.RETRYING, error });
      this.queue.scheduleRetry(retrying, Date.now() + delay);
      const timer = setTimeout(() => {
        this._retryTimers.delete(timer);
        this.queue.takeDueRetries().forEach((m) => this.queue.enqueueOutgoing(m));
        this._drain();
      }, delay);
      this._retryTimers.add(timer);
    } else {
      this._update(message, { state: MessageState.FAILED, error });
    }
  }

  dispose() {
    this._retryTimers.forEach((timer) => clearTimeout(timer));
    this._retryTimers.clear();
    this.removeAllListeners();
  }
}
