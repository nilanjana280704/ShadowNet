/**
 * BaseTransport — abstract base implementing the parts every transport shares
 * (identity, state machine, event emission) and declaring the operations
 * subclasses must implement. A real native transport extends this directly; the
 * mock transports extend MockTransport (which extends this).
 */
import EventEmitter from '../core/EventEmitter';
import { TRANSPORT_META, TransportEvent, TransportState } from '../core/constants';

export default class BaseTransport extends EventEmitter {
  constructor(type) {
    super();
    this.type = type;
    this.meta = TRANSPORT_META[type];
    this.state = TransportState.UNINITIALIZED;
  }

  getStatus() {
    return {
      type: this.type,
      state: this.state,
      label: this.meta.label,
      priority: this.meta.priority,
    };
  }

  setState(state) {
    if (this.state === state) return;
    this.state = state;
    this.emit(TransportEvent.STATE_CHANGED, this.getStatus());
  }

  // --- Contract: subclasses MUST override the following. ---
  initialize() {
    throw new Error(`initialize() not implemented for ${this.type}`);
  }

  startDiscovery() {
    throw new Error(`startDiscovery() not implemented for ${this.type}`);
  }

  stopDiscovery() {
    throw new Error(`stopDiscovery() not implemented for ${this.type}`);
  }

  connect() {
    throw new Error(`connect() not implemented for ${this.type}`);
  }

  disconnect() {
    throw new Error(`disconnect() not implemented for ${this.type}`);
  }

  send() {
    throw new Error(`send() not implemented for ${this.type}`);
  }
}
