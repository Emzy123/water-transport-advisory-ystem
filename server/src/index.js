require('dotenv').config();
const http = require('http');
const app = require('./app');
const config = require('./config');
const prisma = require('./utils/prisma');
const logger = require('./utils/logger');
const vesselHub = require('./ws/vesselHub');
const vesselSimulation = require('./services/vesselSimulation');
const geoService = require('./utils/geoService');

function bootstrap() {
  const server = http.createServer(app);
  vesselHub.init(server);
  geoService.ensurePostgisSchema().catch(() => {});
  return server;
}

function startServer(server) {
  return new Promise((resolve) => {
    server.listen(config.port, () => {
      logger.info({ port: config.port, env: config.nodeEnv }, 'WTAP API server started');
      if (config.vesselSimulationEnabled) {
        vesselSimulation.start();
      }
      resolve(server);
    });
  });
}

async function shutdown(server, signal) {
  logger.info({ signal }, 'Shutting down gracefully');
  vesselSimulation.stop();
  vesselHub.close();
  return new Promise((resolve) => {
    const forceTimer = setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);

    server.close(async () => {
      clearTimeout(forceTimer);
      await prisma.$disconnect();
      logger.info('Server closed');
      resolve();
    });
  });
}

if (require.main === module) {
  const server = bootstrap();
  startServer(server);

  process.on('SIGTERM', () => shutdown(server, 'SIGTERM').then(() => process.exit(0)));
  process.on('SIGINT', () => shutdown(server, 'SIGINT').then(() => process.exit(0)));

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled rejection');
  });

  process.on('uncaughtException', (err) => {
    logger.error({ err }, 'Uncaught exception');
    shutdown(server, 'uncaughtException').then(() => process.exit(1));
  });
}

module.exports = { app, bootstrap, startServer, shutdown, vesselSimulation };
