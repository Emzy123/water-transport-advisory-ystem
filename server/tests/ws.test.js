const { test } = require('node:test');
const assert = require('node:assert/strict');
const WebSocket = require('ws');
const { advanceVessel } = require('../src/services/vesselSimulation');

test('advanceVessel moves a vessel along its heading', () => {
  const vessel = { id: 1, latitude: 7.8, longitude: 6.73, speed: 10, heading: 90 };
  const next = advanceVessel(vessel, 5000);
  assert.ok(next);
  assert.notEqual(next.longitude, vessel.longitude);
  assert.equal(next.id, 1);
});

test('advanceVessel returns null for stationary vessels', () => {
  const vessel = { id: 1, latitude: 7.8, longitude: 6.73, speed: 0, heading: 0 };
  assert.equal(advanceVessel(vessel, 5000), null);
});

test('WebSocket /ws/vessels sends snapshot on connect', async () => {
  const vesselHub = require('../src/ws/vesselHub');
  const { bootstrap, shutdown } = require('../src/index');

  const server = bootstrap();
  await new Promise((resolve) => server.listen(0, resolve));

  const { port } = server.address();
  const ws = new WebSocket(`ws://127.0.0.1:${port}/ws/vessels`);

  const message = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('WebSocket timeout')), 5000);
    ws.on('message', (raw) => {
      clearTimeout(timeout);
      resolve(JSON.parse(raw.toString()));
    });
    ws.on('error', reject);
  });

  assert.equal(message.type, 'snapshot');
  assert.ok(Array.isArray(message.data));
  assert.ok(message.data.length > 0);
  assert.ok(message.timestamp);

  ws.close();
  await shutdown(server, 'test');
});
