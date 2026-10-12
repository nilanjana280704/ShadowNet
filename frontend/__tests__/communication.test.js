/**
 * Communication engine unit checks — exercise the layered architecture with the
 * mock simulator using fake timers (no real radios, no real delays).
 */
import { TransportFactory } from '../src/communication/transport/TransportFactory';
import { assertTransport } from '../src/communication/transport/ITransport';
import RoutingEngine from '../src/communication/routing/RoutingEngine';
import EncryptionService from '../src/communication/security/EncryptionService';
import RetryService from '../src/communication/message/RetryService';
import MessageQueue from '../src/communication/message/MessageQueue';
import MessageQueueService from '../src/communication/message/MessageQueueService';
import { createMessage } from '../src/communication/message/Message';
import CommunicationManager from '../src/communication/manager/CommunicationManager';
import { TransportType, TransportEvent, MessageState } from '../src/communication/core/constants';
import { COMM_CONFIG } from '../src/config';

test('TransportFactory builds transports satisfying the ITransport contract', () => {
  const wifi = TransportFactory.create(TransportType.WIFI_DIRECT, {});
  expect(() => assertTransport(wifi)).not.toThrow();
  expect(wifi.getStatus().type).toBe(TransportType.WIFI_DIRECT);
});

test('RoutingEngine prefers Wi-Fi Direct over BLE and LoRa at equal signal', () => {
  const engine = new RoutingEngine();
  const route = engine.selectRoute({
    id: 'd1',
    signal: 0.8,
    transports: [TransportType.LORA, TransportType.BLE, TransportType.WIFI_DIRECT],
  });
  expect(route.transport).toBe(TransportType.WIFI_DIRECT);
  expect(route.confidence).toBeGreaterThan(0);
});

test('EncryptionService placeholder round-trips a message', () => {
  const enc = new EncryptionService();
  const { cipher, encrypted } = enc.encrypt('SOS: need help at grid 42R');
  expect(encrypted).toBe(true);
  expect(cipher).not.toContain('SOS');
  expect(enc.decrypt(cipher)).toBe('SOS: need help at grid 42R');
});

test('CommunicationManager gives ConnectionManager a real-world Wi-Fi Direct connect timeout, not a short default', () => {
  const manager = new CommunicationManager();
  // Must come from COMM_CONFIG (not a hardcoded literal here) and must be able
  // to outlast the native Wi-Fi Direct connect timeout (30s in
  // ShadowNetCommModule.kt) so JS doesn't give up before native even can.
  expect(manager.connectionManager.timeoutMs).toBe(COMM_CONFIG.connectTimeoutMs);
  expect(manager.connectionManager.timeoutMs).toBeGreaterThanOrEqual(30000);
});

function buildMessageQueueService(overrides = {}) {
  const queue = new MessageQueue();
  const device = { id: 'peer-1', transports: [TransportType.WIFI_DIRECT] };
  const route = { transport: TransportType.WIFI_DIRECT, hops: ['peer-1'], confidence: 0.9 };
  const service = new MessageQueueService({
    queue,
    encryption: new EncryptionService(),
    routing: { selectRoute: () => route },
    connectionManager: { getConnection: () => null, isConnected: () => true, connect: jest.fn() },
    transportManager: { send: jest.fn().mockResolvedValue({ confidence: 0.95, latencyMs: 40 }) },
    retry: new RetryService(),
    getDevice: () => device,
    getDevices: () => [device],
    ...overrides,
  });
  return { service, queue, device };
}

test('a successfully sent message reaches DELIVERED but is not fabricated into ACKNOWLEDGED', async () => {
  const { service } = buildMessageQueueService();
  const message = createMessage({ to: 'peer-1', text: 'hello' });
  await service._process(message);
  expect(service.queue.sent.get(message.id).state).toBe(MessageState.DELIVERED);
});

test('acknowledge() advances a DELIVERED message to ACKNOWLEDGED on a real delivery confirmation', async () => {
  const { service } = buildMessageQueueService();
  const message = createMessage({ to: 'peer-1', text: 'hello' });
  await service._process(message);
  service.acknowledge(message.id);
  expect(service.queue.sent.get(message.id).state).toBe(MessageState.ACKNOWLEDGED);
});

test('acknowledge() is a safe no-op for an unknown, missing, or already-terminal packet id', async () => {
  const { service } = buildMessageQueueService();
  expect(() => service.acknowledge('unknown-id')).not.toThrow();
  expect(() => service.acknowledge(undefined)).not.toThrow();

  const failedMessage = createMessage({ to: 'peer-1', text: 'will fail' });
  service.queue.markSent({ ...failedMessage, state: MessageState.FAILED });
  service.acknowledge(failedMessage.id);
  expect(service.queue.sent.get(failedMessage.id).state).toBe(MessageState.FAILED);
});

test('CommunicationManager routes the mock transport per-packet ack into MessageQueueService.acknowledge', () => {
  const manager = new CommunicationManager();
  const spy = jest.spyOn(manager.messages, 'acknowledge');
  manager.transportManager.emit(TransportEvent.MESSAGE, {
    kind: 'ack',
    packetId: 'pk-mock-1',
    deviceId: 'd1',
    transport: TransportType.WIFI_DIRECT,
  });
  expect(spy).toHaveBeenCalledWith('pk-mock-1');
});

test('CommunicationManager routes a native real delivery-confirmation event into MessageQueueService.acknowledge', () => {
  const manager = new CommunicationManager();
  const spy = jest.spyOn(manager.messages, 'acknowledge');
  manager.transportManager.emit(TransportEvent.MESSAGE_ACKNOWLEDGED, {
    packetId: 'pk-native-1',
    deviceId: 'd2',
    transport: TransportType.WIFI_DIRECT,
  });
  expect(spy).toHaveBeenCalledWith('pk-native-1');
});
