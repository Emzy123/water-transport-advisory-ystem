const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  validateGeoJson,
  pointInGeoJson,
  CORRIDOR_ZONES,
} = require('../src/utils/geoService');

test('validateGeoJson accepts corridor polygons', () => {
  const geo = CORRIDOR_ZONES.lokoja_confluence.geoJson;
  assert.deepEqual(validateGeoJson(geo), geo);
});

test('validateGeoJson rejects invalid geometry types', () => {
  assert.throws(() => validateGeoJson({ type: 'Point', coordinates: [6.73, 7.8] }), /Polygon/);
});

test('pointInGeoJson detects point inside Lokoja zone', () => {
  assert.equal(pointInGeoJson(7.79, 6.73, CORRIDOR_ZONES.lokoja_confluence.geoJson), true);
});

test('pointInGeoJson detects point outside hazard zones', () => {
  assert.equal(pointInGeoJson(5.0, 4.0, CORRIDOR_ZONES.lokoja_confluence.geoJson), false);
});
