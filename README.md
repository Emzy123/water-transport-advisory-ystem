# Water Transport Advisory Portal

> An enterprise-grade web application for Nigerian inland waterway transport safety and coordination.  
> Built on the PERN stack (PostgreSQL · Express · React · Node.js) as part of a B.Sc. thesis project.

---

## Overview

The Water Transport Advisory Portal provides real-time safety intelligence, operational coordination, and regulatory oversight for the Niger–Benue inland waterway corridor. It serves four distinct user roles — Public, Vessel Operator, Port Manager, and Regulatory Official — each with a tailored dashboard and access-controlled feature set.

**Core capabilities:**
- Live vessel tracking on an interactive map with WebSocket position updates
- Real-time weather advisories sourced from Open-Meteo API
- Navigational warnings with geospatial zone polygons (PostGIS / Turf.js)
- Rule-based route risk assessment for voyage planning
- Multi-channel emergency alert broadcast (Site banner, SMS & Email dispatch options)
- Regulatory CSV compliance export engine for audit logs and incident records
- Observability & Prometheus metrics telemetry (`GET /api/v1/metrics`)
- Dual-mode authentication (`httpOnly` cookies + Authorization Bearer header support)
- PWA & Offline map tile caching with automated connection status banner
- Port directory, berth status management, and ferry schedules
- Incident reporting and regulatory review queue
- Tamper-evident audit log of all privileged actions

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, React Router 7, TanStack Query 5 |
| **UI / Maps** | Leaflet 1.9, React-Leaflet 5, Lucide-React, React Hot Toast |
| **PWA & Offline** | Service Worker map tile caching (`sw.js`), `OfflineBanner` connectivity detector |
| **Backend** | Node.js, Express 5, Prisma ORM 5 |
| **Database** | PostgreSQL 16 with PostGIS (Docker) / Turf.js fallback (local) |
| **Auth** | Dual JWT access tokens (15 min) + database-revocable refresh tokens (7 days) via Bearer headers & `httpOnly` cookies |
| **External APIs** | Open-Meteo (weather), OpenStreetMap / CartoDB (tiles) |
| **Logging & Telemetry** | Pino + pino-http (structured JSON logs) + Prometheus exposition metrics (`/api/v1/metrics`) |
| **Security** | Helmet, express-rate-limit, bcryptjs, RBAC middleware, BOLA checks |
| **Real-time** | WebSocket (`ws`) — `/ws/vessels` position broadcast |
| **DevOps** | Docker Compose, GitHub Actions CI |
| **Testing** | Node.js built-in test runner + Supertest (30 integration tests) |

---

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16 running locally **or** Docker (recommended)

### Option A — Docker Compose (Recommended)

Runs the full stack in isolated containers (database, API, frontend) with one command.

```bash
# From the project root
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:5000/api/v1 |
| Health check | http://localhost:5000/api/v1/health |
| Prometheus metrics | http://localhost:5000/api/v1/metrics |

### Option B — Native Local Development

**1. Configure the backend:**
```bash
cp server/.env.example server/.env
# Edit server/.env — set DATABASE_URL, JWT_SECRET, CLIENT_URL
```

**2. Start the backend:**
```bash
cd server
npm install
npx prisma migrate dev    # create schema
npm run seed              # populate demo data
npm run dev               # http://localhost:5000
```

**3. Configure and start the frontend:**
```bash
cp client/.env.example client/.env
# Ensure VITE_API_URL=http://localhost:5000/api/v1

cd client
npm install
npm run dev               # http://localhost:5173
```

### Environment Variables

**`server/.env`**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/water_portal"
JWT_SECRET="minimum_32_character_secret_key_here"
CLIENT_URL="http://localhost:5173"
PORT=5000
NODE_ENV=development
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## Demo Accounts

All accounts use the password: **`Password@1`**

| Email | Role | Access |
|-------|------|--------|
| `admin@portal.ng` | Regulatory Official | Full access — warnings, alerts, incidents, audit log, CSV exports |
| `pm@portal.ng` | Port Manager | Port, berth, and schedule management |
| `capt@portal.ng` | Vessel Operator | Vessel tracking, route advisory, incident reporting |
| *(register)* | Public | Read-only — weather, warnings, ports, schedules |

---

## Functional Requirements Coverage (FR-01 – FR-11)

| ID | Feature | Status | Roles |
|----|---------|--------|-------|
| FR-01 | Authentication (register, login, refresh, logout, httpOnly cookies) | ✅ Complete | All |
| FR-02 | Vessel tracking map + fleet registry | ✅ Complete | Public read; Operator write |
| FR-03 | Live weather advisory (Open-Meteo integration) | ✅ Complete | All |
| FR-04 | Navigational warnings — view + regulatory CRUD | ✅ Complete | Public read; Regulatory write |
| FR-05 | Port directory with search | ✅ Complete | Public |
| FR-06 | Berth status management | ✅ Complete | Port Manager, Regulatory |
| FR-07 | Ferry schedules — public view + management | ✅ Complete | Public read; Port Manager write |
| FR-08 | Rule-based route advisory engine | ✅ Complete | Vessel Operator+ |
| FR-09 | Emergency alert broadcast + multi-channel (SMS/Email) dispatch | ✅ Complete | Public read; Regulatory broadcast |
| FR-10 | Incident report submission + regulatory review & CSV exports | ✅ Complete | Operator submit; Regulatory manage |
| FR-11 | Audit log with filters, pagination & CSV exports | ✅ Complete | Regulatory Official |

---

## API Reference

All endpoints are available under **`/api/v1`**. Legacy aliases (`/api/*`) are preserved for backward compatibility.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Create account (forced PUBLIC role) | None |
| `POST` | `/auth/login` | Authenticate and receive tokens / set httpOnly cookies | None |
| `POST` | `/auth/refresh` | Rotate refresh token (body or cookie) | Refresh token |
| `POST` | `/auth/logout` | Revoke refresh token & clear cookies | Auth |
| `GET` | `/auth/me` | Current user profile | Auth |
| `GET` | `/vessels` | All vessel positions and metadata | Public |
| `PUT` | `/vessels/:id/position` | Update vessel GPS position | Operator (own vessel) |
| `GET` | `/weather` | Live weather advisory (cached, with fallback) | Public |
| `GET` | `/weather/history` | Historical weather advisory records | Auth |
| `GET` | `/warnings` | Active navigational warnings | Public |
| `GET` | `/warnings/zones` | Active geospatial warning zone polygons | Public |
| `GET` | `/warnings/at` | Warnings at a specific coordinate `?lat=&lng=` | Public |
| `GET` | `/warnings/templates` | Predefined corridor zone templates | Auth |
| `POST` | `/warnings` | Publish new warning with optional GeoJSON zone | Regulatory |
| `PUT` | `/warnings/:id` | Update warning details or severity | Regulatory |
| `PATCH` | `/warnings/:id/clear` | Mark warning as CLEARED | Regulatory |
| `DELETE` | `/warnings/:id` | Archive warning | Regulatory |
| `GET` | `/ports` | Port directory with optional search | Public |
| `GET` | `/ports/:id` | Single port with berths and schedules | Public |
| `PUT` | `/ports/:id/berths/:berthId` | Update berth status | Port Manager |
| `GET` | `/schedules` | Ferry schedules (filterable by port) | Public |
| `POST` | `/schedules` | Create schedule | Port Manager |
| `PUT` | `/schedules/:id` | Update schedule | Port Manager |
| `POST` | `/routes` | Generate route advisory (rule engine) | Vessel Operator |
| `GET` | `/alerts/active` | Current active emergency alerts | Public |
| `POST` | `/alerts` | Broadcast emergency alert with optional SMS/Email dispatches | Regulatory |
| `GET` | `/incidents` | Incident reports (own or all) | Auth |
| `GET` | `/incidents/export` | Download incident reports as CSV | Auth |
| `POST` | `/incidents` | Submit incident report | Vessel Operator |
| `PATCH` | `/incidents/:id/status` | Update incident review status | Regulatory |
| `GET` | `/audit` | Filtered, paginated audit log | Regulatory |
| `GET` | `/audit/export` | Download audit logs as CSV | Regulatory |
| `GET` | `/metrics` | Prometheus exposition text format metrics | Public |
| `GET` | `/dashboard/stats` | Role-specific KPI statistics | Auth |
| `GET` | `/health` | Service health with DB probe and WS stats | Public |
| `GET` | `/docs` | OpenAPI specification (JSON) | Public |

### WebSocket

| Endpoint | Description |
|----------|-------------|
| `ws://localhost:5000/ws/vessels` | Snapshot on connect + batched position updates every 5 s |

---

## Enterprise Features

### Security
- **JWT dual-token auth** — 15-minute access tokens + 7-day database-revocable refresh tokens
- **`httpOnly` Cookie Support** — automatic cookie placement and clearance (`accessToken` & `refreshToken`) with `SameSite=Strict`
- **Refresh token family revocation** — replayed refresh tokens revoke all sessions for that user
- **RBAC middleware** — role-level guards on every protected route
- **Rate limiting** — global (500 req / 15 min), auth (20 req / 15 min), weather (30 req / min)
- **Helmet** — full HTTP security header suite
- **CORS** — restricted to `CLIENT_URL` only with `credentials: true`
- **bcrypt** — password hashing with salt rounds
- **Audit trail** — every privileged action is logged with user, IP, and timestamp
- **Request IDs** (`X-Request-Id`) on every response for traceability

### Reliability & Telemetry
- **Prometheus Metrics** — `/api/v1/metrics` exposes HTTP request counts, average request duration histograms, status code distributions, and active WebSocket connections.
- **Structured logging** via Pino with request correlation IDs
- **Graceful shutdown** — handles `SIGTERM` / `SIGINT`, closes DB connections cleanly
- **Weather fallback** — returns last cached reading if Open-Meteo is unreachable
- **Error boundaries** — React-level fault isolation per page
- **Standardised error schema** — `{ error, code, requestId }` on all API errors

### Scalability & Offline Caching
- **PWA & Offline Tile Caching** — Service Worker (`sw.js`) caches app shell assets and Leaflet map tiles from OpenStreetMap / CartoDB.
- **Offline Connection Banner** — `OfflineBanner` alerts users when network connectivity drops.
- **Stateless API** — horizontally scalable; no server-side session state
- **Database indexes** on foreign keys, status fields, and timestamps
- **Pagination & Exporting** — CSV exports for audit logs and incident queues
- **API versioning** — `/api/v1` with backward-compatible aliases
- **Code splitting** — `React.lazy` per route; each page is a separate JS chunk

### Multi-Channel Communications
- Multi-channel notification dispatcher (`notification.service.js`) triggering Email and SMS notifications to captains and port managers when emergency alerts are broadcast.

### Geospatial
- GeoJSON warning zone polygons stored per `NavWarning` record
- `ST_Contains` spatial queries via PostGIS (Docker/CI environment)
- Turf.js application-level fallback for local development without PostGIS
- Predefined corridor zone templates: Baro Reach, Lokoja Confluence, Onitsha Approach
- Map overlays rendered on vessel tracking and warnings pages

### Real-time
- WebSocket hub at `/ws/vessels` — sends vessel snapshot on connect
- Batch position updates broadcast to all connected clients
- Vessel position simulation for demo (corridor-bound AIS feed)
- Frontend auto-reconnect with exponential backoff + live/offline indicator

---

## Security & Access Control Model (Separation of Concerns)

To align with academic and industrial safety standards, the application implements a strict **least-privilege access model** that segregates domain administration from system administration:

### 1. Tamper-Resistant Audit Trail (Immutability)
* **Design:** While `REGULATORY_OFFICIAL` accounts can query and inspect the audit trail via `GET /api/v1/audit` or export CSVs via `GET /api/v1/audit/export`, the system exposes **no endpoints or controller logic** to delete, modify, or clear entries in the `AuditLog` table.
* **Benefit:** Ensures non-repudiation. Even compromised administrator-level credentials cannot be used to erase history or "cover tracks" after executing unauthorized operations.

### 2. Privilege Escalation & Vetting Lock
* **Design:** User registration via the public endpoint (`POST /api/v1/auth/register`) automatically forces the `PUBLIC` role.
* **Benefit:** Higher-privilege accounts (`VESSEL_OPERATOR`, `PORT_MANAGER`, and `REGULATORY_OFFICIAL`) cannot be self-elevated. They must be provisioned directly by a database administrator (DBA) or an IT systems administrator via seed scripts or direct database management.

### 3. Separation of Agency vs. Infrastructure Management
* **Design:** The `REGULATORY_OFFICIAL` represents safety regulators (like NIWA/NIMASA) rather than IT operators. They possess full CRUD privileges over dynamic safety data (navigational warnings, weather logs, emergency alerts), but they cannot create new ports, edit terminal specifications, or register physical vessels.
* **Benefit:** Infrastructure assets are treated as static config items, preventing safety inspectors from making unauthorized modifications to physical wharves or assigning vessel ownership arbitrarily.

### 4. Broken Object-Level Authorization (BOLA) Protections
* **Design:** Whenever a client requests a route advisory (`POST /api/v1/routes`) or files an incident report (`POST /api/v1/incidents`), the backend queries the database to verify if `vessel.operatorId === req.user.id` or if `req.user.role === 'REGULATORY_OFFICIAL'`.
* **Benefit:** Prevents malicious or erroneous requests from accessing or reporting incidents on behalf of vessels operated by other captains.

---

## Available Commands

```bash
# --- Backend (from server/) ---
npm run dev              # Start dev server with nodemon (http://localhost:5000)
npm start                # Start production server
npm test                 # Run 30 integration tests
npm run seed             # Seed demo users, ports, vessels, warnings
npm run db:migrate       # Run Prisma migrations
npm run db:generate      # Regenerate Prisma client after schema changes

# --- Frontend (from client/) ---
npm run dev              # Start Vite dev server (http://localhost:5173)
npm run build            # Production build to client/dist/
npm run lint             # Lint source files with oxlint
npm run preview          # Preview production build locally

# --- Root (from water-transport-portal/) ---
docker compose up --build    # Full stack (DB + API + client) in Docker
npm run screenshots          # Capture all 22 thesis figures to screenshots/chapter-4/
```

---

## Running Tests

```bash
cd server
npm test
```

**30 integration tests** cover:

- Health check with live database probe
- Auth — login, register, token refresh, logout, role enforcement, httpOnly cookies
- Refresh token replay attack → family revocation
- Vessel list endpoint (public access)
- Audit log — unauthenticated 401, authenticated read, CSV export
- Incident management — submission, status updates, CSV export
- Dashboard stats — all three role variants
- Prometheus telemetry — `/metrics` exposition text output
- Emergency alert broadcast — multi-channel SMS & email notification dispatch
- Warning zone geospatial queries (`/warnings/zones`, `/warnings/at`)
- BOLA prevention — route advisory and incident report cross-vessel protection
- Weather — strict NaN coordinate handling
- GeoJSON validation — valid corridors accepted, invalid geometry rejected
- Turf.js point-in-polygon — inside and outside Lokoja zone
- WebSocket — snapshot delivery on connect
- Vessel position simulation — movement and stationary edge cases

---

## Thesis Figures

The `npm run screenshots` command (from project root) uses Playwright to capture all 22 figures required for Chapter 4 of the thesis. Screenshots are saved to `screenshots/chapter-4/`.

| Figure | Page / Feature |
|--------|----------------|
| Fig 4.1 | Public landing / home page |
| Fig 4.2 | Login page |
| Fig 4.3 | Registration page |
| Fig 4.4 | Vessel Operator dashboard |
| Fig 4.5 | Port Manager dashboard |
| Fig 4.6 | Regulatory Official dashboard |
| Fig 4.7 | Public user weather view |
| Fig 4.8 | Vessel tracking map (popup open) |
| Fig 4.9 | Weather advisory panel (live data) |
| Fig 4.10 | Navigational warnings list |
| Fig 4.11 | Create navigational warning form |
| Fig 4.12 | Port directory (search active) |
| Fig 4.13 | Berth status management |
| Fig 4.14 | Ferry schedule table (public) |
| Fig 4.15 | Route advisory form |
| Fig 4.16 | Route advisory result card |
| Fig 4.17 | Emergency alert broadcast form |
| Fig 4.18 | Emergency banner (on dashboard) |
| Fig 4.19 | Incident report submission form |
| Fig 4.20 | Incident management (Regulatory view) |
| Fig 4.21 | Audit log table |
| Fig 4.22 | Mobile responsive dashboard view |

---

## UAT Test Tasks (Chapter 5)

| Task | Role |
|------|------|
| Register as Vessel Operator and log in | Vessel Operator |
| View the vessel tracking map and open a vessel popup | Vessel Operator |
| Read the current weather advisory | All |
| View all active navigational warnings | All |
| Request a route advisory (Lokoja → Onitsha) | Vessel Operator |
| Submit an incident report | Vessel Operator |
| Update berth A1 status to Occupied | Port Manager |
| Publish a new navigational warning | Regulatory Official |
| Broadcast an emergency alert with SMS/Email notifications | Regulatory Official |
| Export audit logs & incident reports to CSV | Regulatory Official |
| View ferry schedules as a public user (no login) | Public |

---

## Project Structure

```
water-transport-portal/
├── client/                    React 19 + Vite frontend
│   ├── public/
│   │   └── sw.js              PWA Service Worker (Map tile & static asset caching)
│   ├── src/
│   │   ├── components/        Shared UI components (Navbar, OfflineBanner, VesselMap, …)
│   │   ├── pages/             Route-level page components (19 pages)
│   │   ├── context/           AuthContext, ThemeContext
│   │   ├── hooks/             Custom React hooks
│   │   ├── utils/             Axios API instance (JWT interceptor)
│   │   └── content/           Centralised UI copy strings
│   └── Dockerfile
│
├── server/                    Express 5 + Prisma backend
│   ├── prisma/
│   │   ├── schema.prisma      Full DB schema (11 models, 8 enums)
│   │   ├── seed.js            Demo data (users, ports, vessels, warnings)
│   │   └── migrations/
│   ├── src/
│   │   ├── routes/            12 route files + /api/v1 versioned router (includes /metrics)
│   │   ├── controllers/       Business logic (11 controllers + CSV exporters)
│   │   ├── middleware/        Auth, RBAC, Rate limit, Metrics, Error, NotFound, RequestId
│   │   ├── services/          Weather service, Notification service (SMS/Email), Vessel simulation
│   │   ├── utils/             Prisma client, logger, audit helper, geoService
│   │   ├── ws/                WebSocket vessel hub + position simulator
│   │   └── docs/              openapi.json (served at /api/v1/docs)
│   ├── tests/                 api.test.js (30 tests), ws.test.js, geo.test.js
│   └── Dockerfile
│
├── docs/
│   ├── ENTERPRISE.md          Full architecture and design decisions
│   └── UI_POLISH.md           UI/UX implementation summary
│
├── scripts/
│   └── capture-screenshots.mjs   Playwright screenshot automation
│
├── screenshots/
│   └── chapter-4/             22 thesis figures (fig-4.01 … fig-4.22)
│
├── .github/workflows/         GitHub Actions CI pipeline
├── docker-compose.yml         Full stack container orchestration
└── README.md
```

---

## Architecture

See [docs/ENTERPRISE.md](docs/ENTERPRISE.md) for the full architecture diagram, authentication flow, security pillars, and deployment guide.

```
Client (React + Vite + PWA Service Worker)
    │  HTTPS /api/v1
    ▼
API Gateway Layer  [Helmet │ CORS │ Rate Limit │ Request ID │ Metrics │ Pino]
    │
Express v1 Router  [Auth │ Vessels │ Weather │ Warnings │ Ports │ Metrics │ ...]
    │
Controllers + Rule Engine + Audit Exporter + Notification Service
    │
PostgreSQL (Prisma ORM, indexed, RefreshToken store)
    │
Open-Meteo API          OpenStreetMap Tiles
```

---

*Developed as part of a B.Sc. Computer Science thesis — Water Transport Advisory System for Nigerian Inland Waterways.*
