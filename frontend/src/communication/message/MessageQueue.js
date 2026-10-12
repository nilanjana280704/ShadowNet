/**
 * MessageQueue — the three queues: outgoing (priority-ordered), incoming, and
 * retry (keyed by id with a nextAttemptAt). Pure data structure; the
 * MessageQueueService owns the processing logic.
 */
export default class MessageQueue {
  constructor() {
    this.outgoing = [];
    this.incoming = [];
    this.retry = new Map();
    this.sent = new Map(); // id -> message, for status lookups
  }

  enqueueOutgoing(message) {
    this.outgoing.push(message);
    // Highest priority first; ties break by age (FIFO).
    this.outgoing.sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt);
  }

  dequeueOutgoing() {
    return this.outgoing.shift();
  }

  addIncoming(message) {
    this.incoming.push(message);
  }

  scheduleRetry(message, nextAttemptAt) {
    this.retry.set(message.id, { message, nextAttemptAt });
  }

  takeDueRetries(now = Date.now()) {
    const due = [];
    this.retry.forEach((entry, id) => {
      if (entry.nextAttemptAt <= now) {
        due.push(entry.message);
        this.retry.delete(id);
      }
    });
    return due;
  }

  markSent(message) {
    this.sent.set(message.id, message);
  }

  snapshot() {
    return {
      outgoing: [...this.outgoing],
      incoming: [...this.incoming],
      retry: Array.from(this.retry.values()).map((e) => e.message),
      sent: Array.from(this.sent.values()),
    };
  }
}
