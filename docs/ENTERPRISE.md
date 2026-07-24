# Enterprise Architecture — Water Transport Advisory Portal

This document describes how the platform meets **enterprise-grade** standards while preserving the full original scope (FR-01 through FR-11).

---

## 1. Scope preservation matrix

Every original requirement remains implemented and accessible:

| ID | Requirement | Enterprise endpoints | Roles |
|----|-------------|---------------------|-------|
| FR-01 | Authentication | `POST /api/v1/auth/register`, `/login`, `/refresh`, `/logout`, `GET /me` | All |
| FR-02 | Vessel tracking | `GET /api/v1/vessels`, `PUT /:id/position` | Public read; operator write |
| FR-03 | Weather advisory | `GET /api/v1/weather`, `/history` | Public + regulatory |
| FR-04 | Nav warnings | `GET/POST/PUT/PATCH/DELETE /api/v1/warnings` | Public read; regulatory write |
| FR-05 | Port directory | `GET /api/v1/ports`, `GET /:id` | Public |
| FR-06 | Berth management | `PUT /api/v1/ports/:id/berths/:berthId` | Port manager |
| FR-07 | Ferry schedules | `GET/POST/PUT /api/v1/schedules` | Public read; port manager write |
| FR-08 | Route advisory | `POST /api/v1/routes` (rule engine) | Vessel operator+ |
| FR-09 | Emergency alerts | `GET /active`, `POST /api/v1/alerts` | Public read; regulatory broadcast |
| FR-10 | Incident reports | `GET/POST /api/v1/incidents`, `PATCH /:id/status` | Operator submit; regulatory review |
| FR-11 | Audit log | `GET /api/v1/audit` (filtered, paginated) | Regulatory |

Legacy `/api/*` routes remain as backward-compatible aliases.

---

## 2. Enterprise pillars implemented

### Security
- **Helmet** HTTP security headers
- **JWT access tokens** (15 min) + **refresh tokens** (7 days, revocable, stored in DB)
- **RBAC** on all protected routes
- **Registration locked to PUBLIC** — no self-elevation
- **Rate limiting**: global (500/15min), auth (20/15min), weather (30/min)
- **bcrypt** password hashing
- **CORS** restricted to `CLIENT_URL`
- **Audit logging** on privileged actions
- **Request IDs** (`X-Request-Id`) on every response

### Reliability
- **Structured logging** (Pino + pino-http)
- **Graceful shutdown** (SIGTERM/SIGINT, Prisma disconnect)
- **Health checks** with DB probe, uptime, version (`GET /api/v1/health`)
- **Standardised errors** (`ApiError` with `code`, `requestId`)
- **Weather cache** with stale-data fallback
- **404 handler** for unknown routes

### Scalability
- **Database indexes** on FKs, status fields, timestamps
- **Pagination utilities** (audit, incidents, weather history)
- **Stateless API** — horizontal scaling ready
- **API versioning** (`/api/v1`)
- **Docker Compose** for containerised deployment

### Observability
- Request/response logging with correlation IDs
- Audit trail with filters (action, userId, date range)
- OpenAPI spec at `GET /api/v1/docs`

### Quality
- **Integration tests** (Node test runner + Supertest)
- **GitHub Actions CI** (migrate, seed, test, build)
- **Code splitting** (React.lazy per route)
- **React Query** for cached data fetching
- **Error boundaries** for fault isolation

### Real-time (Phase 2)
- **WebSocket stream** at `/ws/vessels` — snapshot on connect + batched position updates
- **Position simulation** — corridor-bound movement for demo AIS feed (`VESSEL_SIMULATION`)
- **Client auto-reconnect** — exponential backoff with live/offline indicator
- **REST + WS sync** — operator position updates broadcast to all connected clients

### Geospatial (Phase 3)
- **Warning zone polygons** — GeoJSON stored per `NavWarning`, rendered on vessel + warnings maps
- **PostGIS queries** — `ST_Contains` point-in-zone when PostGIS is available (Docker/CI)
- **Turf.js fallback** — application-level spatial queries for local dev without PostGIS
- **Corridor templates** — Baro Reach, Lokoja Confluence, Onitsha Approach presets
- **API** — `GET /warnings/zones`, `GET /warnings/at?lat=&lng=`, `GET /warnings/templates`
- **Route advisory** — geo-matched warnings when vessel position intersects hazard zones

### Usability (retained + enhanced)
- Premium UI with dark mode (bridge operations)
- Custom map markers, legend, fullscreen
- Loading skeletons, toast notifications
- 403 Forbidden and 404 Not Found pages
- Deep-link return after login

---

## 3. Architecture diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (React + Vite)                     │
│  React Query │ Error Boundary │ Lazy Routes │ JWT + Refresh      │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS /api/v1
┌────────────────────────────▼────────────────────────────────────┐
│                     API Gateway Layer                            │
│  Helmet │ CORS │ Rate Limit │ Request ID │ Pino Logging         │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                   Express v1 Router                              │
│  Auth │ Vessels │ Weather │ Warnings │ Ports │ Schedules        │
│  Routes │ Alerts │ Incidents │ Audit                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│              Controllers + Rule Engine + Audit                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│         PostgreSQL (Prisma ORM, indexed, RefreshToken store)      │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │ Open-Meteo    OpenStreetMap │
              └─────────────────────────────┘
```

---

## 4. Authentication flow (enterprise)

```
Login → accessToken (15m) + refreshToken (7d, DB)
     ↓
API calls with Bearer accessToken
     ↓
401 → auto refresh via POST /auth/refresh
     ↓
Success → retry original request
Failure → logout + redirect to login
Logout → revoke refreshToken server-side
```

---

## 5. Deployment options

### Local development
```bash
cd server && npm run dev
cd client && npm run dev
```

### Docker (production-like)
```bash
docker compose up --build
```

### Railway / cloud
Set environment variables:
- `DATABASE_URL`, `JWT_SECRET` (≥32 chars), `CLIENT_URL`, `NODE_ENV=production`

---

## 6. Testing

```bash
cd server && npm test          # 9 integration tests
cd client && npm run build     # production build
npm run screenshots            # thesis figures
```

---

## 7. Roadmap (post-enterprise baseline)

| Phase | Enhancement |
|-------|-------------|
| Phase 2 | WebSocket live vessel positions | **Implemented** — `/ws/vessels` stream + simulation |
| Phase 3 | PostGIS geospatial warning zones | **Implemented** — GeoJSON zones, `/warnings/zones`, `/warnings/at` |
| Phase 4 | SMS/email emergency notifications |
| Phase 5 | Prometheus metrics + Grafana |
| Phase 6 | httpOnly cookie auth option |

---

*All original thesis modules, roles, UAT tasks, and screenshot requirements remain valid on this enterprise baseline.*
