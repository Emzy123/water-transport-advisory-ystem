require('dotenv').config();

const required = ['DATABASE_URL', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

if (process.env.JWT_SECRET.length < 32) {
  console.warn('WARNING: JWT_SECRET should be at least 32 characters for production');
}

module.exports = {
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  apiVersion: 'v1',
  appName: 'Water Transport Advisory Portal',
  vesselSimulationEnabled: process.env.VESSEL_SIMULATION !== 'false',
  vesselSimulationIntervalMs: parseInt(process.env.VESSEL_SIMULATION_INTERVAL_MS || '5000', 10),
};
