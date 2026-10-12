/**
 * QueueService — tracks messages waiting for delivery while offline or between
 * retries, with a naive delivery estimate. The engine's own message queue does
 * the real work when wired in; this mirrors it for the chat UI.
 */
export default class QueueService {
  constructor({ perMessageSeconds = 15 } = {}) {
    this.perMessageSeconds = perMessageSeconds;
    this.queued = new Map();
  }

  enqueue(message) {
    this.queued.set(message.id, message);
  }

  remove(id) {
    this.queued.delete(id);
  }

  drain() {
    const messages = Array.from(this.queued.values());
    this.queued.clear();
    return messages;
  }

  count() {
    return this.queued.size;
  }

  ids() {
    return Array.from(this.queued.keys());
  }

  /** Rough "time to clear the queue" estimate for the offline banner. */
  estimate() {
    if (this.queued.size === 0) return null;
    const seconds = this.queued.size * this.perMessageSeconds;
    return seconds < 60 ? `~${seconds}s` : `~${Math.ceil(seconds / 60)} min`;
  }

  snapshot() {
    return { count: this.count(), ids: this.ids(), estimate: this.estimate() };
  }
}
