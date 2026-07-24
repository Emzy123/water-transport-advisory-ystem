const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

const API = '/api/v1';

test('GET /api/v1/health returns ok with database check', async () => {
  const res = await request(app).get(`${API}/health`);
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.equal(res.body.version, 'v1');
  assert.equal(res.body.checks.database, 'ok');
});

test('GET /api/v1 returns API metadata', async () => {
  const res = await request(app).get(`${API}`);
  assert.equal(res.status, 200);
  assert.ok(res.body.name);
  assert.equal(res.body.version, 'v1');
});

test('POST /auth/login with invalid credentials returns 401', async () => {
  const res = await request(app)
    .post(`${API}/auth/login`)
    .send({ email: 'invalid@test.com', password: 'wrong' });
  assert.equal(res.status, 401);
  assert.equal(res.body.code, 'INVALID_CREDENTIALS');
});

test('POST /auth/login with valid demo user returns tokens', async () => {
  const res = await request(app)
    .post(`${API}/auth/login`)
    .send({ email: 'admin@portal.ng', password: 'Password@1' });
  assert.equal(res.status, 200);
  assert.ok(res.body.token);
  assert.ok(res.body.refreshToken);
  assert.equal(res.body.role, 'REGULATORY_OFFICIAL');
});

test('GET /vessels is public', async () => {
  const res = await request(app).get(`${API}/vessels`);
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length > 0);
});

test('GET /audit without token returns 401', async () => {
  const res = await request(app).get(`${API}/audit`);
  assert.equal(res.status, 401);
});

test('GET /audit with regulatory token returns logs', async () => {
  const login = await request(app)
    .post(`${API}/auth/login`)
    .send({ email: 'admin@portal.ng', password: 'Password@1' });

  const res = await request(app)
    .get(`${API}/audit`)
    .set('Authorization', `Bearer ${login.body.token}`);
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.logs));
});

test('POST /auth/register forces PUBLIC role', async () => {
  const email = `test_${Date.now()}@portal.ng`;
  const res = await request(app)
    .post(`${API}/auth/register`)
    .send({ fullName: 'Test User', email, password: 'Password@1' });
  assert.equal(res.status, 201);

  const login = await request(app)
    .post(`${API}/auth/login`)
    .send({ email, password: 'Password@1' });
  assert.equal(login.body.role, 'PUBLIC');
});

test('Unknown route returns 404 with code', async () => {
  const res = await request(app).get(`${API}/nonexistent`);
  assert.equal(res.status, 404);
  assert.equal(res.body.code, 'NOT_FOUND');
});

test('GET /warnings/zones returns active geospatial zones', async () => {
  const res = await request(app).get(`${API}/warnings/zones`);
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
});

test('GET /warnings/at returns warnings for point in Lokoja zone', async () => {
  const res = await request(app).get(`${API}/warnings/at?lat=7.79&lng=6.73`);
  assert.equal(res.status, 200);
  assert.equal(typeof res.body.count, 'number');
  assert.ok(Array.isArray(res.body.warnings));
});

test('GET /warnings/at requires lat and lng', async () => {
  const res = await request(app).get(`${API}/warnings/at`);
  assert.equal(res.status, 400);
});

test('GET /dashboard/stats without token returns 401', async () => {
  const res = await request(app).get(`${API}/dashboard/stats`);
  assert.equal(res.status, 401);
});

test('GET /dashboard/stats as Regulatory Official returns official stats', async () => {
  const login = await request(app)
    .post(`${API}/auth/login`)
    .send({ email: 'admin@portal.ng', password: 'Password@1' });

  const res = await request(app)
    .get(`${API}/dashboard/stats`)
    .set('Authorization', `Bearer ${login.body.token}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.role, 'REGULATORY_OFFICIAL');
  assert.equal(typeof res.body.stats.activeWarnings, 'number');
  assert.equal(typeof res.body.stats.pendingIncidents, 'number');
  assert.equal(typeof res.body.stats.totalVessels, 'number');
  assert.equal(typeof res.body.stats.activeAlerts, 'number');
});

test('GET /dashboard/stats as Port Manager returns port stats', async () => {
  const login = await request(app)
    .post(`${API}/auth/login`)
    .send({ email: 'pm@portal.ng', password: 'Password@1' });

  const res = await request(app)
    .get(`${API}/dashboard/stats`)
    .set('Authorization', `Bearer ${login.body.token}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.role, 'PORT_MANAGER');
  assert.equal(typeof res.body.stats.managedPortsCount, 'number');
  assert.equal(typeof res.body.stats.totalBerths, 'number');
  assert.equal(typeof res.body.stats.availableBerths, 'number');
  assert.equal(typeof res.body.stats.occupiedBerths, 'number');
  assert.equal(typeof res.body.stats.maintenanceBerths, 'number');
  assert.equal(typeof res.body.stats.activeSchedules, 'number');
});

test('GET /dashboard/stats as Vessel Operator returns operator stats', async () => {
  const login = await request(app)
    .post(`${API}/auth/login`)
    .send({ email: 'capt@portal.ng', password: 'Password@1' });

  const res = await request(app)
    .get(`${API}/dashboard/stats`)
    .set('Authorization', `Bearer ${login.body.token}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.role, 'VESSEL_OPERATOR');
  assert.equal(typeof res.body.stats.operatedVessels, 'number');
  assert.equal(typeof res.body.stats.submittedIncidents, 'number');
  assert.equal(typeof res.body.stats.activeWarnings, 'number');
  assert.equal(typeof res.body.stats.activeAlerts, 'number');
});

test('Refresh token reuse triggers family revocation of all user tokens', async () => {
  // 1. First session login
  const loginA = await request(app)
    .post(`${API}/auth/login`)
    .send({ email: 'pm@portal.ng', password: 'Password@1' });
  const refreshTokenA = loginA.body.refreshToken;

  // 2. Second session login
  const loginB = await request(app)
    .post(`${API}/auth/login`)
    .send({ email: 'pm@portal.ng', password: 'Password@1' });
  const refreshTokenB = loginB.body.refreshToken;

  assert.ok(refreshTokenA);
  assert.ok(refreshTokenB);
  assert.notEqual(refreshTokenA, refreshTokenB);

  // 3. First refresh using refreshTokenA (Valid)
  const refresh1 = await request(app)
    .post(`${API}/auth/refresh`)
    .send({ refreshToken: refreshTokenA });
  assert.equal(refresh1.status, 200);
  assert.ok(refresh1.body.token);

  // 4. Reuse refreshTokenA (Invalid/Replay attack)
  const refresh2 = await request(app)
    .post(`${API}/auth/refresh`)
    .send({ refreshToken: refreshTokenA });
  assert.equal(refresh2.status, 401);

  // 5. Verify that refreshTokenB is now also revoked due to family revocation
  const refresh3 = await request(app)
    .post(`${API}/auth/refresh`)
    .send({ refreshToken: refreshTokenB });
  assert.equal(refresh3.status, 401);
});

test('BOLA: Route advisory creation returns 403 for unauthorized vessel operators', async () => {
  // Login as Port Manager (who has no owned/operated vessels)
  const login = await request(app)
    .post(`${API}/auth/login`)
    .send({ email: 'pm@portal.ng', password: 'Password@1' });

  // Attempt to request route advisory for vessel ID 1
  const res = await request(app)
    .post(`${API}/routes`)
    .set('Authorization', `Bearer ${login.body.token}`)
    .send({
      departure: 'Lokoja',
      destination: 'Onitsha',
      vesselId: 1,
    });

  assert.equal(res.status, 403);
  assert.match(res.body.error, /You do not operate this vessel/);
});

test('BOLA: Incident report submission returns 403 for unauthorized vessel operators', async () => {
  // Login as Port Manager (who has no owned/operated vessels)
  const login = await request(app)
    .post(`${API}/auth/login`)
    .send({ email: 'pm@portal.ng', password: 'Password@1' });

  // Attempt to submit incident report for vessel ID 1
  const res = await request(app)
    .post(`${API}/incidents`)
    .set('Authorization', `Bearer ${login.body.token}`)
    .send({
      incidentType: 'Engine Failure',
      description: 'Test incident description',
      vesselId: 1,
    });

  assert.equal(res.status, 403);
  assert.match(res.body.error, /You do not operate this vessel/);
});

test('Weather: Strict NaN parsing does not fallback on coordinates (0.0, 0.0)', async () => {
  const res = await request(app)
    .get(`${API}/weather?lat=0&lon=0`);
  
  assert.equal(res.status, 200);
  assert.ok(res.body.wind !== undefined);
  assert.ok(res.body.rain !== undefined);
});

test('GET /api/v1/metrics returns Prometheus exposition text format', async () => {
  const res = await request(app).get(`${API}/metrics`);
  assert.equal(res.status, 200);
  assert.match(res.text, /http_requests_total/);
  assert.match(res.text, /websocket_connections_active/);
});

test('GET /api/v1/audit/export returns CSV content', async () => {
  const login = await request(app)
    .post(`${API}/auth/login`)
    .send({ email: 'admin@portal.ng', password: 'Password@1' });

  const res = await request(app)
    .get(`${API}/audit/export`)
    .set('Authorization', `Bearer ${login.body.token}`);

  assert.equal(res.status, 200);
  assert.equal(res.headers['content-type'], 'text/csv; charset=utf-8');
  assert.match(res.text, /ID,Action,Details/);
});

test('POST /api/v1/alerts creates alert and dispatches multi-channel notification', async () => {
  const login = await request(app)
    .post(`${API}/auth/login`)
    .send({ email: 'admin@portal.ng', password: 'Password@1' });

  const res = await request(app)
    .post(`${API}/alerts`)
    .set('Authorization', `Bearer ${login.body.token}`)
    .send({
      title: 'Urgent Weather Warning',
      message: 'High waves expected near Baro Reach',
      severity: 'CRITICAL',
      sendEmail: true,
      sendSms: true,
    });

  assert.equal(res.status, 201);
  assert.ok(res.body.notificationSummary);
  assert.ok(res.body.notificationSummary.totalRecipients >= 0);
});
