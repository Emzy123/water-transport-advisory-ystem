const { WebSocketServer } = require('ws');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

const WS_PATH = '/ws/vessels';

let wss = null;
const clients = new Set();

async function fetchVessels() {
  return prisma.vessel.findMany({
    include: {
      operator: { select: { id: true, fullName: true, email: true } },
    },
    orderBy: { vesselName: 'asc' },
  });
}

function send(ws, message) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function broadcast(message) {
  const payload = JSON.stringify(message);
  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) ws.send(payload);
  }
}

function broadcastPositionUpdates(updates) {
  if (!updates.length) return;
  broadcast({
    type: 'positions_batch',
    data: updates,
    timestamp: new Date().toISOString(),
  });
}

function init(server) {
  wss = new WebSocketServer({ server, path: WS_PATH });

  wss.on('connection', async (ws) => {
    clients.add(ws);
    logger.debug({ clients: clients.size }, 'Vessel WebSocket client connected');

    try {
      const vessels = await fetchVessels();
      send(ws, { type: 'snapshot', data: vessels, timestamp: new Date().toISOString() });
    } catch (err) {
      logger.error({ err }, 'Failed to send vessel snapshot');
      send(ws, { type: 'error', message: 'Unable to load vessel snapshot' });
    }

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'ping') {
          send(ws, { type: 'pong', timestamp: new Date().toISOString() });
        }
      } catch {
        /* ignore malformed client messages */
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      logger.debug({ clients: clients.size }, 'Vessel WebSocket client disconnected');
    });

    ws.on('error', (err) => {
      logger.warn({ err }, 'Vessel WebSocket client error');
      clients.delete(ws);
    });
  });

  logger.info({ path: WS_PATH }, 'Vessel WebSocket hub ready');
}

function close() {
  for (const ws of clients) {
    ws.close(1001, 'Server shutting down');
  }
  clients.clear();
  if (wss) {
    wss.close();
    wss = null;
  }
}

function getStats() {
  return { path: WS_PATH, clients: clients.size };
}

module.exports = {
  init,
  close,
  broadcast,
  broadcastPositionUpdates,
  getStats,
  WS_PATH,
};
