const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const pinoHttp = require('pino-http');
const config = require('./config');
const prisma = require('./utils/prisma');
const logger = require('./utils/logger');
const requestId = require('./middleware/requestId.middleware');
const { globalLimiter } = require('./middleware/rateLimit.middleware');
const errorHandler = require('./middleware/error.middleware');
const notFound = require('./middleware/notFound.middleware');
const v1Routes = require('./routes/v1');
const vesselHub = require('./ws/vesselHub');

const { metricsMiddleware } = require('./middleware/metrics.middleware');

const app = express();

app.set('trust proxy', 1);

app.use(requestId);
app.use(metricsMiddleware);
app.use(
  pinoHttp({
    logger,
    customProps: (req) => ({ requestId: req.id }),
    autoLogging: { ignore: (req) => req.url === '/api/health' || req.url === '/api/v1/health' },
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(globalLimiter);

async function healthHandler(req, res) {
  const health = {
    status: 'ok',
    service: config.appName,
    version: config.apiVersion,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: { database: 'ok' },
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    health.status = 'degraded';
    health.checks.database = 'error';
    return res.status(503).json(health);
  }

  health.checks.websocket = vesselHub.getStats();

  res.json(health);
}

app.get('/api/health', healthHandler);
app.get('/api/v1/health', healthHandler);

app.get('/api/v1', (req, res) => {
  res.json({
    name: config.appName,
    version: config.apiVersion,
    documentation: '/api/v1/docs',
  });
});

app.get('/api/v1/docs', (req, res) => {
  res.json(require('./docs/openapi.json'));
});

// Versioned API (enterprise standard)
app.use('/api/v1', v1Routes);

// Backward-compatible aliases — all original FR endpoints preserved
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/vessels', require('./routes/vessel.routes'));
app.use('/api/weather', require('./routes/weather.routes'));
app.use('/api/warnings', require('./routes/warning.routes'));
app.use('/api/ports', require('./routes/port.routes'));
app.use('/api/schedules', require('./routes/schedule.routes'));
app.use('/api/routes', require('./routes/route.routes'));
app.use('/api/alerts', require('./routes/alert.routes'));
app.use('/api/incidents', require('./routes/incident.routes'));
app.use('/api/audit', require('./routes/audit.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
