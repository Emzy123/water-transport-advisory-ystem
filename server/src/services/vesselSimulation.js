const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const config = require('../config');
const vesselHub = require('../ws/vesselHub');

const CORRIDOR = { minLat: 5.5, maxLat: 11.0, minLng: 4.5, maxLng: 8.5 };

let timer = null;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeHeading(heading) {
  return Math.round(((heading % 360) + 360) % 360);
}

/**
 * Advance a vessel along its heading. Speed is in knots; intervalMs controls step size.
 */
function advanceVessel(vessel, intervalMs) {
  const speed = vessel.speed ?? 0;
  if (speed < 0.5) return null;

  const step = speed * 0.000004 * (intervalMs / 1000);
  const headingRad = (vessel.heading * Math.PI) / 180;
  const dLat = step * Math.cos(headingRad);
  const dLng = step * Math.sin(headingRad);

  let latitude = clamp(vessel.latitude + dLat, CORRIDOR.minLat, CORRIDOR.maxLat);
  let longitude = clamp(vessel.longitude + dLng, CORRIDOR.minLng, CORRIDOR.maxLng);

  let heading = vessel.heading;
  if (Math.random() > 0.92) {
    heading = normalizeHeading(heading + (Math.random() - 0.5) * 30);
  }

  if (
    Math.abs(latitude - vessel.latitude) < 0.000001 &&
    Math.abs(longitude - vessel.longitude) < 0.000001
  ) {
    return null;
  }

  return {
    id: vessel.id,
    latitude: Number(latitude.toFixed(6)),
    longitude: Number(longitude.toFixed(6)),
    speed: vessel.speed,
    heading,
  };
}

async function tick() {
  try {
    const vessels = await prisma.vessel.findMany();
    const updates = [];

    for (const vessel of vessels) {
      const next = advanceVessel(vessel, config.vesselSimulationIntervalMs);
      if (!next) continue;

      const updated = await prisma.vessel.update({
        where: { id: vessel.id },
        data: {
          latitude: next.latitude,
          longitude: next.longitude,
          heading: next.heading,
        },
        select: {
          id: true,
          latitude: true,
          longitude: true,
          speed: true,
          heading: true,
          lastUpdated: true,
        },
      });

      updates.push(updated);
    }

    if (updates.length) {
      vesselHub.broadcastPositionUpdates(updates);
    }
  } catch (err) {
    logger.error({ err }, 'Vessel simulation tick failed');
  }
}

function start() {
  if (timer) return;
  timer = setInterval(tick, config.vesselSimulationIntervalMs);
  logger.info(
    { intervalMs: config.vesselSimulationIntervalMs },
    'Vessel position simulation started'
  );
}

function stop() {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
  logger.info('Vessel position simulation stopped');
}

module.exports = { start, stop, tick, advanceVessel };
