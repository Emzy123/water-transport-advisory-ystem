/**
 * Geospatial helpers for navigational warning zones.
 * Uses PostGIS when available; falls back to Turf.js for local dev without PostGIS.
 */
const booleanPointInPolygon = require('@turf/boolean-point-in-polygon').default;
const { point } = require('@turf/helpers');
const prisma = require('./prisma');
const logger = require('./logger');

let postgisAvailable = null;

const CORRIDOR_ZONES = {
  baro_reach: {
    label: 'Baro Reach, Niger State',
    geoJson: {
      type: 'Polygon',
      coordinates: [
        [
          [6.62, 10.32],
          [6.82, 10.32],
          [6.82, 10.58],
          [6.62, 10.58],
          [6.62, 10.32],
        ],
      ],
    },
  },
  lokoja_confluence: {
    label: 'Lokoja Confluence Zone',
    geoJson: {
      type: 'Polygon',
      coordinates: [
        [
          [6.68, 7.72],
          [6.82, 7.72],
          [6.82, 7.88],
          [6.68, 7.88],
          [6.68, 7.72],
        ],
      ],
    },
  },
  onitsha_approach: {
    label: 'Onitsha Approach, Anambra State',
    geoJson: {
      type: 'Polygon',
      coordinates: [
        [
          [6.68, 6.02],
          [6.9, 6.02],
          [6.9, 6.28],
          [6.68, 6.28],
          [6.68, 6.02],
        ],
      ],
    },
  },
};

async function isPostgisAvailable() {
  if (postgisAvailable !== null) return postgisAvailable;
  try {
    await prisma.$queryRaw`SELECT PostGIS_Version()`;
    postgisAvailable = true;
    logger.info('PostGIS detected — using native spatial queries');
  } catch {
    postgisAvailable = false;
    logger.info('PostGIS unavailable — using Turf.js spatial fallback');
  }
  return postgisAvailable;
}

function validateGeoJson(geoJson) {
  if (!geoJson || typeof geoJson !== 'object') {
    throw new Error('zoneGeoJson must be a GeoJSON geometry object');
  }
  if (!['Polygon', 'MultiPolygon'].includes(geoJson.type)) {
    throw new Error('zoneGeoJson must be a Polygon or MultiPolygon');
  }
  if (!Array.isArray(geoJson.coordinates)) {
    throw new Error('zoneGeoJson coordinates are invalid');
  }
  return geoJson;
}

function pointInGeoJson(lat, lng, geoJson) {
  return booleanPointInPolygon(point([lng, lat]), geoJson);
}

async function syncWarningGeometry(warningId, zoneGeoJson) {
  if (!(await isPostgisAvailable())) return;

  if (!zoneGeoJson) {
    await prisma.$executeRaw`
      UPDATE "NavWarning" SET "zoneGeometry" = NULL WHERE id = ${warningId}
    `;
    return;
  }

  const geoStr = JSON.stringify(zoneGeoJson);
  await prisma.$executeRaw`
    UPDATE "NavWarning"
    SET "zoneGeometry" = ST_SetSRID(ST_GeomFromGeoJSON(${geoStr}::json), 4326)
    WHERE id = ${warningId}
  `;
}

async function findWarningsAtPoint(lat, lng, status = 'ACTIVE') {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error('Invalid latitude or longitude');
  }

  if (await isPostgisAvailable()) {
    try {
      return await prisma.$queryRaw`
        SELECT w.id, w.title, w.description, w.severity, w."affectedZone",
               w."zoneGeoJson", w.status, w."publishedAt", w."expectedClearance",
               u."fullName" AS "publisherName"
        FROM "NavWarning" w
        JOIN "User" u ON u.id = w."publishedBy"
        WHERE w.status = ${status}::"WarningStatus"
          AND w."zoneGeometry" IS NOT NULL
          AND ST_Contains(
            w."zoneGeometry",
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
          )
        ORDER BY w.severity DESC, w."publishedAt" DESC
      `;
    } catch (err) {
      logger.warn({ err }, 'PostGIS query failed, falling back to Turf.js');
      postgisAvailable = false;
    }
  }

  const warnings = await prisma.navWarning.findMany({
    where: { status, zoneGeoJson: { not: null } },
    include: { publisher: { select: { fullName: true } } },
    orderBy: [{ severity: 'desc' }, { publishedAt: 'desc' }],
  });

  return warnings
    .filter((w) => pointInGeoJson(latitude, longitude, w.zoneGeoJson))
    .map((w) => ({
      ...w,
      publisherName: w.publisher?.fullName,
    }));
}

async function findActiveZones() {
  return prisma.navWarning.findMany({
    where: { status: 'ACTIVE', zoneGeoJson: { not: null } },
    select: {
      id: true,
      title: true,
      severity: true,
      affectedZone: true,
      zoneGeoJson: true,
      status: true,
      publishedAt: true,
    },
    orderBy: [{ severity: 'desc' }, { publishedAt: 'desc' }],
  });
}

async function ensurePostgisSchema() {
  if (!(await isPostgisAvailable())) return false;

  try {
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS postgis`;
    await prisma.$executeRaw`
      ALTER TABLE "NavWarning"
      ADD COLUMN IF NOT EXISTS "zoneGeometry" geometry(Geometry, 4326)
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "NavWarning_zoneGeometry_idx"
      ON "NavWarning" USING GIST ("zoneGeometry")
    `;
    await prisma.$executeRaw`
      UPDATE "NavWarning"
      SET "zoneGeometry" = ST_SetSRID(ST_GeomFromGeoJSON("zoneGeoJson"::text), 4326)
      WHERE "zoneGeoJson" IS NOT NULL
        AND ("zoneGeometry" IS NULL OR ST_IsEmpty("zoneGeometry"))
    `;
    return true;
  } catch (err) {
    logger.warn({ err }, 'PostGIS schema setup skipped');
    postgisAvailable = false;
    return false;
  }
}

module.exports = {
  CORRIDOR_ZONES,
  validateGeoJson,
  pointInGeoJson,
  syncWarningGeometry,
  findWarningsAtPoint,
  findActiveZones,
  ensurePostgisSchema,
  isPostgisAvailable,
};
