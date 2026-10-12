/**
 * ChatService — orchestrates outgoing messages' local lifecycle. It emits
 * events (message:added / message:updated / queue:changed) that the chat
 * Redux bridge mirrors into state, exactly like the communication engine's
 * services.
 *
 * Delivery honesty: when a message is actually going to a real discovered
 * device (`simulate: false`), this only ever emits the local SENDING state —
 * every state after that (relaying/delivered/failed) comes from the real
 * engine's own message events, wired in chatBridge.js via ENGINE_TO_DELIVERY.
 * Simulated progression (relaying → delivered → read on a timer) is used ONLY
 * for conversations with no real transport target at all (demo/group chats —
 * there is no real multi-party group delivery mechanism in this engine), so
 * the UI isn't left looking permanently stuck for a feature that was never
 * built. It never claims delivery for a real 1:1 device conversation.
 */
import EventEmitter from '../../../communication/core/EventEmitter';
import { DeliveryState } from '../constants';
import QueueService from './QueueService';

class ChatService extends EventEmitter {
  constructor() {
    super();
    this.queue = new QueueService();
    this._timers = new Set();
  }

  _t(fn, ms) {
    const timer = setTimeout(() => {
      this._timers.delete(timer);
      fn();
    }, ms);
    this._timers.add(timer);
    return timer;
  }

  _update(message, delivery, patch = {}) {
    this.emit('message:updated', {
      id: message.id,
      conversationId: message.conversationId,
      delivery,
      updatedAt: Date.now(),
      ...patch,
    });
  }

  _emitQueue() {
    this.emit('queue:changed', this.queue.snapshot());
  }

  _run(message, proximity) {
    const transport = proximity === 'nearby' ? 'wifi-direct' : 'ble';
    this._update(message, DeliveryState.SENDING, { transport });
    // A real device target: stop here. Real transitions come from the engine.
    if (message.simulate === false) return;
    const base = proximity === 'nearby' ? 250 : 800;
    this._t(() => this._update(message, DeliveryState.RELAYING, { transport }), base);
    this._t(() => this._update(message, DeliveryState.DELIVERED, { transport }), base + 900);
    this._t(() => this._update(message, DeliveryState.READ, { transport }), base + 2400);
  }

  /**
   * Send a freshly created message. Queues it if the network is offline.
   * @param {boolean} [simulate=true] false when this message is actually
   *   going to a real discovered device — see class doc above.
   */
  send(message, { online = true, proximity = 'relayed', simulate = true } = {}) {
    message.simulate = simulate;
    this.emit('message:added', message);
    if (!online || proximity === 'offline') {
      this.queue.enqueue(message);
      this._update(message, DeliveryState.QUEUED);
      this._emitQueue();
    } else {
      this._run(message, proximity);
    }
    return message;
  }

  retry(message, { proximity = 'relayed', simulate } = {}) {
    if (simulate !== undefined) message.simulate = simulate;
    this.queue.remove(message.id);
    this._emitQueue();
    this._update(message, DeliveryState.RETRYING);
    this._t(() => this._run(message, proximity), 400);
  }

  /** Flush queued messages when connectivity returns. */
  flush({ proximity = 'relayed' } = {}) {
    const messages = this.queue.drain();
    this._emitQueue();
    messages.forEach((m) => this._run(m, proximity));
  }

  dispose() {
    this._timers.forEach(clearTimeout);
    this._timers.clear();
  }
}

export const chatService = new ChatService();
export default chatService;
