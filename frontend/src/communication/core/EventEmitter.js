/**
 * EventEmitter — a tiny, dependency-free pub/sub used across the communication
 * engine so layers stay decoupled (dependency inversion): lower layers emit
 * events; higher layers subscribe. No direct calls upward.
 */
export default class EventEmitter {
  constructor() {
    this._listeners = new Map();
  }

  /** Subscribe. Returns an unsubscribe function. */
  on(event, handler) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  once(event, handler) {
    const wrapped = (...args) => {
      this.off(event, wrapped);
      handler(...args);
    };
    return this.on(event, wrapped);
  }

  off(event, handler) {
    this._listeners.get(event)?.delete(handler);
  }

  emit(event, payload) {
    this._listeners.get(event)?.forEach((handler) => {
      try {
        handler(payload);
      } catch {
        // A listener error must not break the emitter or other listeners.
      }
    });
  }

  removeAllListeners() {
    this._listeners.clear();
  }
}
