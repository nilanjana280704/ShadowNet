/**
 * CommunicationService — the public facade and single entry point for the app
 * (Redux/UI). It owns one CommunicationManager and exposes a small, stable API
 * plus event subscription. UI never imports transports, managers, or the engine
 * internals — only this service.
 */
import { CommEvent } from './core/constants';
import CommunicationManager from './manager/CommunicationManager';

class CommunicationService {
  constructor() {
    this.manager = new CommunicationManager();
  }

  /** Subscribe to a CommEvent. Returns an unsubscribe function. */
  on(event, handler) {
    return this.manager.on(event, handler);
  }

  off(event, handler) {
    this.manager.off(event, handler);
  }

  initialize() {
    return this.manager.initialize();
  }

  /** Set the real authenticated identity to announce to peers on connect. */
  setLocalIdentity(identity) {
    this.manager.setLocalIdentity(identity);
  }

  startDiscovery() {
    this.manager.startDiscovery();
  }

  stopDiscovery() {
    this.manager.stopDiscovery();
  }

  connect(deviceId) {
    return this.manager.connect(deviceId);
  }

  disconnect(deviceId) {
    return this.manager.disconnect(deviceId);
  }

  send(to, text, options) {
    return this.manager.send(to, text, options);
  }

  broadcast(text, options) {
    return this.manager.broadcast(text, options);
  }

  getSnapshot() {
    return this.manager.getSnapshot();
  }

  getNetworkState() {
    return this.manager.getNetworkState();
  }

  dispose() {
    return this.manager.dispose();
  }
}

// App-wide singleton.
export const communicationService = new CommunicationService();
export { CommEvent };
export default communicationService;
