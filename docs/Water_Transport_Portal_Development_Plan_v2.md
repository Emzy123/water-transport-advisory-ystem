# Water Transport Advisory Portal — Development Plan v2
**Project:** Development of Water Transport Advisory Portal
**Version:** 2.0 (Stack Reset)
**Status:** Ready to Build

---

## Why the Stack Was Reset

The previous plan used raw PHP + vanilla JS. While functional, it produces
unstructured code that is difficult to maintain, harder to test, and looks
outdated in a 2025/2026 academic context. The new stack uses industry-standard
tools that align with what the thesis already describes — a modern, scalable,
multi-tier web application.

---

## Recommended Stack (PERN)

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | React.js (Vite) + Tailwind CSS | Most widely used frontend framework (43% of devs globally, Stack Overflow 2025). Component-based, fast, mobile-responsive by default. Vite makes setup instant. |
| **Backend** | Node.js + Express.js | JavaScript end-to-end. Pairs natively with React. Handles REST APIs cleanly. Powers real-time updates easily. Used by Netflix, Uber, LinkedIn. |
| **Database** | PostgreSQL | More robust than MySQL for relational data with complex queries. Better support for geospatial data (vessel coordinates). Free and widely available. |
| **ORM** | Prisma | Removes raw SQL complexity. Auto-generates type-safe DB queries. Schema is readable and version-controlled. |
| **Maps** | Leaflet.js + OpenStreetMap | Free, open-source, no API key. Perfect for vessel tracking on Nigerian inland waterways. |
| **Weather API** | Open-Meteo | 100% free, no key required, returns JSON. Wind, rain, visibility data for any coordinates. |
| **Auth** | JWT (JSON Web Tokens) | Industry-standard stateless authentication. Role-based access built-in. |
| **Deployment** | Railway.app (free tier) | One-click deploy for Node + PostgreSQL. Public URL for screenshots. No server management. |
| **Version Control** | Git + GitHub | Industry standard. Supervisor can verify work history. |

**Stack name:** PERN (PostgreSQL + Express + React + Node)

---

## Project Structure

```
water-transport-portal/
│
├── /client                        ← React frontend (Vite)
│   ├── /src
│   │   ├── /components
│   │   │   ├── Navbar.jsx
│   │   │   ├── AlertBanner.jsx    ← live emergency alert
│   │   │   ├── VesselMap.jsx      ← Leaflet map
│   │   │   ├── WeatherPanel.jsx
│   │   │   ├── WarningCard.jsx
│   │   │   └── RouteAdvisoryForm.jsx
│   │   ├── /pages
│   │   │   ├── Home.jsx           ← public landing
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx      ← role-aware
│   │   │   ├── VesselTracking.jsx
│   │   │   ├── WeatherAdvisory.jsx
│   │   │   ├── NavWarnings.jsx
│   │   │   ├── PortDirectory.jsx
│   │   │   ├── FerrySchedules.jsx
│   │   │   ├── RouteAdvisory.jsx
│   │   │   ├── IncidentReport.jsx
│   │   │   ├── EmergencyAlert.jsx
│   │   │   └── AuditLog.jsx
│   │   ├── /context
│   │   │   └── AuthContext.jsx    ← global user/role state
│   │   ├── /utils
│   │   │   └── api.js             ← axios instance with JWT header
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── /server                        ← Node + Express backend
│   ├── /prisma
│   │   └── schema.prisma          ← full DB schema
│   ├── /src
│   │   ├── /routes
│   │   │   ├── auth.routes.js
│   │   │   ├── vessel.routes.js
│   │   │   ├── weather.routes.js
│   │   │   ├── warning.routes.js
│   │   │   ├── port.routes.js
│   │   │   ├── schedule.routes.js
│   │   │   ├── route.routes.js
│   │   │   ├── alert.routes.js
│   │   │   ├── incident.routes.js
│   │   │   └── audit.routes.js
│   │   ├── /middleware
│   │   │   ├── auth.middleware.js  ← JWT verify
│   │   │   └── role.middleware.js  ← role guard
│   │   ├── /controllers
│   │   │   └── (one per route file)
│   │   └── app.js
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## Database Schema (Prisma)

Save this as `/server/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  PUBLIC
  VESSEL_OPERATOR
  PORT_MANAGER
  REGULATORY_OFFICIAL
}

enum VesselType {
  CARGO_FERRY
  PASSENGER_FERRY
  TANKER
  PATROL
  TUG
  OTHER
}

enum WarningSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum WarningStatus {
  ACTIVE
  CLEARED
  ARCHIVED
}

enum BerthStatus {
  AVAILABLE
  OCCUPIED
  MAINTENANCE
}

enum RiskLevel {
  LOW
  MODERATE
  HIGH
}

enum IncidentSeverity {
  MINOR
  MODERATE
  SERIOUS
  CRITICAL
}

enum IncidentStatus {
  SUBMITTED
  UNDER_REVIEW
  RESOLVED
}

enum AlertSeverity {
  INFO
  WARNING
  CRITICAL
}

model User {
  id            Int       @id @default(autoincrement())
  fullName      String
  email         String    @unique
  passwordHash  String
  role          Role      @default(PUBLIC)
  status        String    @default("active")
  createdAt     DateTime  @default(now())

  vessels           Vessel[]
  publishedWarnings NavWarning[]
  routeRequests     RouteAdvisory[]
  incidentReports   IncidentReport[]
  broadcastAlerts   EmergencyAlert[]
  managedPorts      Port[]
  auditLogs         AuditLog[]
  publishedSchedules FerrySchedule[]
  berthUpdates      BerthRecord[]
}

model Vessel {
  id                 Int        @id @default(autoincrement())
  vesselName         String
  registrationNumber String?    @unique
  vesselType         VesselType @default(OTHER)
  maxDraught         Float?
  latitude           Float      @default(7.8003)
  longitude          Float      @default(6.7332)
  speed              Float      @default(0)
  heading            Int        @default(0)
  lastUpdated        DateTime   @updatedAt
  operator           User?      @relation(fields: [operatorId], references: [id])
  operatorId         Int?

  routeAdvisories RouteAdvisory[]
  incidentReports IncidentReport[]
}

model Port {
  id               Int      @id @default(autoincrement())
  portName         String
  locationName     String?
  latitude         Float?
  longitude        Float?
  contactPhone     String?
  contactEmail     String?
  operationalHours String?
  berthCount       Int      @default(1)
  servicesOffered  String?
  manager          User?    @relation(fields: [managerId], references: [id])
  managerId        Int?

  berths    BerthRecord[]
  schedules FerrySchedule[]
}

model BerthRecord {
  id          Int         @id @default(autoincrement())
  berthName   String
  status      BerthStatus @default(AVAILABLE)
  updatedAt   DateTime    @updatedAt
  port        Port        @relation(fields: [portId], references: [id])
  portId      Int
  updatedBy   User?       @relation(fields: [updatedById], references: [id])
  updatedById Int?
}

model FerrySchedule {
  id          Int      @id @default(autoincrement())
  destination String
  departure   String
  daysOfWeek  String
  vesselName  String?
  fare        Float?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  port        Port     @relation(fields: [portId], references: [id])
  portId      Int
  publisher   User?    @relation(fields: [publishedBy], references: [id])
  publishedBy Int?
}

model NavWarning {
  id               Int             @id @default(autoincrement())
  title            String
  description      String
  severity         WarningSeverity @default(MEDIUM)
  affectedZone     String?
  expectedClearance DateTime?
  status           WarningStatus   @default(ACTIVE)
  publishedAt      DateTime        @default(now())
  publisher        User            @relation(fields: [publishedBy], references: [id])
  publishedBy      Int
}

model WeatherAdvisory {
  id           Int      @id @default(autoincrement())
  location     String?
  windSpeed    Float?
  precipitation Float?
  visibility   Float?
  advisoryType String   @default("info")
  advisoryText String?
  generatedAt  DateTime @default(now())
}

model RouteAdvisory {
  id               Int       @id @default(autoincrement())
  departure        String
  destination      String
  recommendedRoute String?
  riskLevel        RiskLevel @default(LOW)
  estTransitHours  Float?
  advisoryText     String?
  generatedAt      DateTime  @default(now())
  vessel           Vessel?   @relation(fields: [vesselId], references: [id])
  vesselId         Int?
  requester        User      @relation(fields: [requestedBy], references: [id])
  requestedBy      Int
}

model EmergencyAlert {
  id        Int           @id @default(autoincrement())
  title     String
  message   String
  severity  AlertSeverity @default(WARNING)
  isActive  Boolean       @default(true)
  issuedAt  DateTime      @default(now())
  expiresAt DateTime?
  issuer    User          @relation(fields: [issuedBy], references: [id])
  issuedBy  Int
}

model IncidentReport {
  id           Int              @id @default(autoincrement())
  incidentType String?
  description  String
  latitude     Float?
  longitude    Float?
  severity     IncidentSeverity @default(MODERATE)
  status       IncidentStatus   @default(SUBMITTED)
  reportedAt   DateTime         @default(now())
  vessel       Vessel?          @relation(fields: [vesselId], references: [id])
  vesselId     Int?
  reporter     User             @relation(fields: [reportedBy], references: [id])
  reportedBy   Int
}

model AuditLog {
  id        Int      @id @default(autoincrement())
  action    String
  details   String?
  ipAddress String?
  loggedAt  DateTime @default(now())
  user      User?    @relation(fields: [userId], references: [id])
  userId    Int?
}
```

---

## Setup Commands (Run Once)

```bash
# 1. Clone / create project folders
mkdir water-transport-portal && cd water-transport-portal
mkdir client server

# 2. Set up React frontend
cd client
npm create vite@latest . -- --template react
npm install
npm install axios react-router-dom leaflet react-leaflet tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3. Set up Node backend
cd ../server
npm init -y
npm install express prisma @prisma/client bcryptjs jsonwebtoken cors dotenv axios
npm install --save-dev nodemon
npx prisma init

# 4. Add your PostgreSQL connection string to server/.env
# DATABASE_URL="postgresql://user:password@localhost:5432/water_portal"
# JWT_SECRET="your_secret_key_here"

# 5. Run migrations
npx prisma migrate dev --name init

# 6. Seed the database
node prisma/seed.js
```

---

## Seed File (`/server/prisma/seed.js`)

```js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Password@1', 10);

  // Users
  const admin = await prisma.user.create({
    data: { fullName: 'Admin Official', email: 'admin@portal.ng',
            passwordHash: hash, role: 'REGULATORY_OFFICIAL' }
  });
  const pm = await prisma.user.create({
    data: { fullName: 'Port Manager Lokoja', email: 'pm@portal.ng',
            passwordHash: hash, role: 'PORT_MANAGER' }
  });
  const captain = await prisma.user.create({
    data: { fullName: 'Capt. Yusuf Bello', email: 'capt@portal.ng',
            passwordHash: hash, role: 'VESSEL_OPERATOR' }
  });

  // Ports
  const lokoja = await prisma.port.create({
    data: { portName: 'Lokoja River Port', locationName: 'Lokoja, Kogi State',
            latitude: 7.8003, longitude: 6.7332, contactPhone: '+234-801-000-0001',
            operationalHours: '06:00 - 20:00', berthCount: 4, managerId: pm.id }
  });
  const onitsha = await prisma.port.create({
    data: { portName: 'Onitsha River Port', locationName: 'Onitsha, Anambra State',
            latitude: 6.1676, longitude: 6.7858, contactPhone: '+234-801-000-0003',
            operationalHours: '07:00 - 19:00', berthCount: 5, managerId: pm.id }
  });
  await prisma.port.create({
    data: { portName: 'Baro River Port', locationName: 'Baro, Niger State',
            latitude: 8.6167, longitude: 6.4000, contactPhone: '+234-801-000-0002',
            operationalHours: '06:00 - 18:00', berthCount: 3, managerId: pm.id }
  });
  await prisma.port.create({
    data: { portName: 'Warri Port', locationName: 'Warri, Delta State',
            latitude: 5.5167, longitude: 5.7500, contactPhone: '+234-801-000-0004',
            operationalHours: '06:00 - 22:00', berthCount: 6, managerId: pm.id }
  });

  // Berths
  await prisma.berthRecord.createMany({
    data: [
      { berthName: 'Berth A1', status: 'AVAILABLE', portId: lokoja.id },
      { berthName: 'Berth A2', status: 'OCCUPIED',  portId: lokoja.id },
      { berthName: 'Berth A3', status: 'AVAILABLE', portId: lokoja.id },
      { berthName: 'Berth C1', status: 'AVAILABLE', portId: onitsha.id },
      { berthName: 'Berth C2', status: 'MAINTENANCE', portId: onitsha.id },
    ]
  });

  // Vessels
  await prisma.vessel.createMany({
    data: [
      { vesselName: 'MV Niger Star',  registrationNumber: 'NIG-2021-0045',
        vesselType: 'CARGO_FERRY',     operatorId: captain.id,
        latitude: 7.820, longitude: 6.740, speed: 8.5, heading: 180 },
      { vesselName: 'MV Benue Pride', registrationNumber: 'NIG-2019-0112',
        vesselType: 'PASSENGER_FERRY', operatorId: captain.id,
        latitude: 8.590, longitude: 6.410, speed: 12.0, heading: 270 },
      { vesselName: 'MT River Queen', registrationNumber: 'NIG-2020-0087',
        vesselType: 'TANKER',          operatorId: captain.id,
        latitude: 6.190, longitude: 6.790, speed: 6.0, heading: 90 },
      { vesselName: 'MV Confluence',  registrationNumber: 'NIG-2022-0033',
        vesselType: 'PATROL',          operatorId: captain.id,
        latitude: 7.780, longitude: 6.720, speed: 0.0, heading: 0 },
    ]
  });

  // Navigational Warnings
  await prisma.navWarning.createMany({
    data: [
      { title: 'Shallow Water — Baro Reach',
        description: 'River depth at Baro Reach has dropped below 1.5m. Vessels with draught exceeding 1.2m must avoid this section.',
        severity: 'HIGH', affectedZone: 'Baro Reach, Niger State',
        publishedBy: admin.id, status: 'ACTIVE' },
      { title: 'Submerged Obstruction — Lokoja Junction',
        description: 'A submerged tree trunk reported at 7.79°N, 6.73°E. Navigate with extreme caution.',
        severity: 'CRITICAL', affectedZone: 'Lokoja Confluence Zone',
        publishedBy: admin.id, status: 'ACTIVE' },
      { title: 'Sand Bar — Onitsha Approach',
        description: 'New sand bar on eastern approach to Onitsha Port. Use western channel.',
        severity: 'MEDIUM', affectedZone: 'Onitsha Approach, Anambra State',
        publishedBy: admin.id, status: 'ACTIVE' },
    ]
  });

  // Ferry Schedules
  await prisma.ferrySchedule.createMany({
    data: [
      { portId: lokoja.id, destination: 'Onitsha River Port',
        departure: '07:00', daysOfWeek: 'Mon,Wed,Fri',
        vesselName: 'MV Niger Star', fare: 2500, publishedBy: pm.id },
      { portId: onitsha.id, destination: 'Warri Port',
        departure: '08:00', daysOfWeek: 'Mon-Fri',
        vesselName: 'MV Benue Pride', fare: 3500, publishedBy: pm.id },
    ]
  });

  // Emergency Alert
  await prisma.emergencyAlert.create({
    data: { title: 'STORM ADVISORY — All Vessels',
            message: 'Heavy rainfall and winds >40 km/h forecast for the Niger corridor from 18:00. All non-essential vessels should seek safe anchorage.',
            severity: 'WARNING', issuedBy: admin.id,
            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) }
  });

  console.log('Database seeded successfully.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

---

## Key Backend Code Snippets

### `/server/src/app.js`
```js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',      require('./routes/auth.routes'));
app.use('/api/vessels',   require('./routes/vessel.routes'));
app.use('/api/weather',   require('./routes/weather.routes'));
app.use('/api/warnings',  require('./routes/warning.routes'));
app.use('/api/ports',     require('./routes/port.routes'));
app.use('/api/schedules', require('./routes/schedule.routes'));
app.use('/api/routes',    require('./routes/route.routes'));
app.use('/api/alerts',    require('./routes/alert.routes'));
app.use('/api/incidents', require('./routes/incident.routes'));
app.use('/api/audit',     require('./routes/audit.routes'));

app.listen(5000, () => console.log('Server running on port 5000'));
module.exports = app;
```

### `/server/src/middleware/auth.middleware.js`
```js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### `/server/src/middleware/role.middleware.js`
```js
module.exports = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};
```

### `/server/src/routes/auth.routes.js`
```js
const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

// Register
router.post('/register', async (req, res) => {
  const { fullName, email, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { fullName, email, passwordHash: hash,
              role: role || 'PUBLIC' }
    });
    res.json({ message: 'Registered successfully', userId: user.id });
  } catch (e) {
    res.status(400).json({ error: 'Email already in use' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !await bcrypt.compare(password, user.passwordHash))
    return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, role: user.role, fullName: user.fullName },
    process.env.JWT_SECRET, { expiresIn: '8h' }
  );
  // Log action
  await prisma.auditLog.create({
    data: { userId: user.id, action: 'LOGIN', details: `${user.email} logged in` }
  });
  res.json({ token, role: user.role, fullName: user.fullName });
});

module.exports = router;
```

### `/server/src/routes/weather.routes.js`
```js
const router = require('express').Router();
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const lat = 7.80, lon = 6.73; // Niger-Benue corridor centre
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
            + `&current=wind_speed_10m,precipitation,visibility,weathercode&wind_speed_unit=kmh`;
  const { data } = await axios.get(url);
  const c = data.current;
  const wind = c.wind_speed_10m, rain = c.precipitation, vis = c.visibility / 1000;

  let type = 'info', text = '';
  if (wind > 40 || vis < 1) {
    type = 'warning';
    text = `NAVIGATION WARNING: Wind ${wind} km/h, visibility ${vis.toFixed(1)} km. All vessels reduce speed and exercise extreme caution.`;
  } else if (wind > 25 || rain > 5) {
    type = 'caution';
    text = `CAUTION: Wind ${wind} km/h, rainfall ${rain} mm/hr. Monitor conditions closely.`;
  } else {
    text = `Conditions favourable. Wind: ${wind} km/h, Rain: ${rain} mm/hr, Visibility: ${vis.toFixed(1)} km.`;
  }

  // Auto-save to DB
  await prisma.weatherAdvisory.create({
    data: { location: 'Niger-Benue Corridor', windSpeed: wind,
            precipitation: rain, visibility: vis,
            advisoryType: type, advisoryText: text }
  });

  res.json({ wind, rain, visibility: vis, type, text });
});

module.exports = router;
```

---

## Key Frontend Code Snippets

### `/client/src/utils/api.js`
```js
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

### `/client/src/context/AuthContext.jsx`
```jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('role');
    const name  = localStorage.getItem('fullName');
    return token ? { token, role, fullName: name } : null;
  });

  const login = (data) => {
    localStorage.setItem('token',    data.token);
    localStorage.setItem('role',     data.role);
    localStorage.setItem('fullName', data.fullName);
    setUser(data);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### `/client/src/components/VesselMap.jsx`
```jsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../utils/api';

export default function VesselMap() {
  const [vessels, setVessels] = useState([]);

  useEffect(() => {
    const load = () => api.get('/vessels').then(r => setVessels(r.data));
    load();
    const interval = setInterval(load, 300000); // refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  return (
    <MapContainer center={[7.80, 6.73]} zoom={7}
                  style={{ height: '500px', width: '100%', borderRadius: '8px' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                 attribution="© OpenStreetMap contributors" />
      {vessels.map(v => (
        <Marker key={v.id} position={[v.latitude, v.longitude]}>
          <Popup>
            <strong>{v.vesselName}</strong><br />
            Type: {v.vesselType}<br />
            Speed: {v.speed} knots &nbsp;|&nbsp; Heading: {v.heading}°<br />
            Operator: {v.operator?.fullName ?? 'N/A'}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

### Route Advisory Logic (in `/server/src/routes/route.routes.js`)
```js
// Rule-based advisory engine
function generateAdvisory(weatherType, warnings, vesselDraught) {
  const criticalWarning = warnings.find(w => w.severity === 'CRITICAL');
  const highWarning     = warnings.find(w => w.severity === 'HIGH');

  if (weatherType === 'warning' || criticalWarning) {
    return {
      riskLevel: 'HIGH',
      recommendedRoute: criticalWarning
        ? `Avoid ${criticalWarning.affectedZone}. Use alternate channel.`
        : 'Delay voyage until weather conditions improve.',
      advisoryText: 'Current conditions present serious risk to navigation. Do not proceed without authorisation from port authority.'
    };
  }
  if (weatherType === 'caution' || highWarning) {
    return {
      riskLevel: 'MODERATE',
      recommendedRoute: highWarning
        ? `Exercise caution near ${highWarning.affectedZone}.`
        : 'Proceed cautiously. Reduce speed in low-visibility areas.',
      advisoryText: 'Moderate risk detected. Ensure all crew safety equipment is operational before departure.'
    };
  }
  return {
    riskLevel: 'LOW',
    recommendedRoute: 'Direct route recommended. Conditions are favourable.',
    advisoryText: 'No significant hazards identified for this route at current time.'
  };
}
```

---

## Build Order (21 Days)

### Sprint 1 — Foundation (Days 1–4)
- [ ] Create project folders; install all dependencies
- [ ] Run Prisma migration and seed script; verify DB in pgAdmin
- [ ] Build `app.js`, auth middleware, role middleware
- [ ] Build auth routes: `POST /api/auth/register`, `POST /api/auth/login`
- [ ] Build React: `Login.jsx`, `Register.jsx`, `AuthContext.jsx`, `api.js`
- [ ] Build `Navbar.jsx` with role-aware navigation links
- [ ] Build `Dashboard.jsx` that shows different content per role
- [ ] ✅ **Screenshot:** Login page, Registration page, each role's dashboard

### Sprint 2 — Core Map & Weather (Days 5–9)
- [ ] Build `GET /api/vessels` backend route
- [ ] Build `VesselMap.jsx` with Leaflet + vessel markers + popups
- [ ] Build `VesselTracking.jsx` page (map + vessel list table below)
- [ ] Build `GET /api/weather` backend route (live Open-Meteo call + DB save)
- [ ] Build `WeatherPanel.jsx` + `WeatherAdvisory.jsx` page
- [ ] Build `GET /api/warnings` + `POST /api/warnings` backend routes
- [ ] Build `NavWarnings.jsx` (public view) + `WarningCard.jsx` component
- [ ] Build warning management page for Regulatory Officials (create/edit/delete)
- [ ] ✅ **Screenshot:** Vessel map with markers, weather panel, warnings list, create warning form

### Sprint 3 — Ports & Schedules (Days 10–13)
- [ ] Build `GET /api/ports` + `GET /api/ports/:id` backend routes
- [ ] Build `PortDirectory.jsx` (searchable list with map pins)
- [ ] Build `PUT /api/ports/:id/berths` for Port Manager berth updates
- [ ] Build berth management UI for Port Manager dashboard
- [ ] Build `GET /api/schedules` + `POST /api/schedules` backend routes
- [ ] Build `FerrySchedules.jsx` (public view, filterable by port)
- [ ] Build schedule management UI for Port Manager
- [ ] ✅ **Screenshot:** Port directory, berth status cards, ferry schedule table

### Sprint 4 — Advisory & Emergency Modules (Days 14–17)
- [ ] Build `RouteAdvisoryForm.jsx` + `POST /api/routes` (rule engine inside)
- [ ] Build `RouteAdvisory.jsx` page with form + result card
- [ ] Build `POST /api/alerts` + `GET /api/alerts/active` backend routes
- [ ] Build `AlertBanner.jsx` (polls every 60s, shows active alert at top of all pages)
- [ ] Build `EmergencyAlert.jsx` broadcast form for Regulatory Officials
- [ ] Build `POST /api/incidents` + `GET /api/incidents` backend routes
- [ ] Build `IncidentReport.jsx` submission form for Vessel Operators
- [ ] Build incident management view for Regulatory Officials
- [ ] ✅ **Screenshot:** Route advisory output, emergency banner, incident form, incident management table

### Sprint 5 — Polish, Testing & UAT (Days 18–21)
- [ ] Build `GET /api/audit` route + `AuditLog.jsx` page
- [ ] Add client-side form validation to all forms (required fields, format checks)
- [ ] Ensure all role guards work (test each restricted page with wrong role)
- [ ] Apply consistent Tailwind styling — colour scheme, spacing, typography
- [ ] Test on mobile screen size (browser DevTools responsive mode)
- [ ] Deploy to Railway.app (or run locally for final screenshots)
- [ ] Conduct UAT with 5+ users using structured test tasks
- [ ] ✅ **Screenshot:** Audit log, mobile view, admin overview, all UAT forms completed

---

## Screenshots Needed for Chapter 4

| Fig No. | Page / Feature |
|---|---|
| Fig 4.1 | Public landing / home page |
| Fig 4.2 | Login page |
| Fig 4.3 | Registration page |
| Fig 4.4 | Vessel Operator dashboard |
| Fig 4.5 | Port Manager dashboard |
| Fig 4.6 | Regulatory Official dashboard |
| Fig 4.7 | Public user view |
| Fig 4.8 | Vessel tracking map (with vessel markers + popup open) |
| Fig 4.9 | Weather advisory panel (live data showing) |
| Fig 4.10 | Navigational warnings list |
| Fig 4.11 | Create navigational warning form |
| Fig 4.12 | Port directory (with search active) |
| Fig 4.13 | Berth status management (Port Manager) |
| Fig 4.14 | Ferry schedule table (public) |
| Fig 4.15 | Route advisory form |
| Fig 4.16 | Route advisory result / output card |
| Fig 4.17 | Emergency alert broadcast form |
| Fig 4.18 | Emergency alert banner (shown on dashboard) |
| Fig 4.19 | Incident report submission form |
| Fig 4.20 | Incident reports management (Regulatory view) |
| Fig 4.21 | Audit log table |
| Fig 4.22 | Mobile responsive view of dashboard |

---

## UAT Plan (Chapter 5)

### Participants
Minimum 5 users representing all 4 roles. Can include coursemates, supervisors, or simulated users.

### Test Tasks

| Task | Role | Module Being Tested |
|---|---|---|
| Register as Vessel Operator and log in | Vessel Operator | Authentication (FR-01) |
| View the vessel tracking map and open a vessel popup | Vessel Operator | Vessel Tracking (FR-02) |
| Read the current weather advisory | All | Weather Advisory (FR-03) |
| View all active navigational warnings | All | Nav Warnings (FR-04) |
| Request a route advisory (Lokoja → Onitsha) | Vessel Operator | Route Advisory (FR-08) |
| Submit an incident report | Vessel Operator | Incident Report (FR-10) |
| Update berth A1 status to Occupied | Port Manager | Berth Management (FR-06) |
| Publish a new navigational warning | Regulatory Official | Warning Management (FR-04) |
| Broadcast an emergency alert | Regulatory Official | Alert Broadcast (FR-09) |
| View ferry schedules as a public user (no login) | Public | Ferry Schedules (FR-07) |

### SUS Questionnaire (rate 1–5)
1. I think I would like to use this system frequently.
2. I found the system unnecessarily complex.
3. I thought the system was easy to use.
4. I think I would need the support of a technical person to use this system.
5. I found the various functions in this system were well integrated.
6. I thought there was too much inconsistency in this system.
7. I would imagine that most people would learn to use this system very quickly.
8. I found the system very cumbersome to use.
9. I felt very confident using the system.
10. I needed to learn a lot of things before I could get going with this system.

**Scoring:** Odd items: score − 1. Even items: 5 − score. Multiply total by 2.5. Target: ≥ 70.

---

## Deliverables Tracker

| Item | Status |
|---|---|
| Chapters 1–3 thesis (docx) | ✅ Done |
| Stack decision + full plan (this doc) | ✅ Done |
| Prisma schema (all 11 models) | ✅ Done |
| Seed data (ports, vessels, warnings) | ✅ Done |
| Backend scaffolding (routes, middleware, auth) | ✅ Done |
| Frontend scaffolding (AuthContext, api.js, VesselMap) | ✅ Done |
| Rule-based advisory engine logic | ✅ Done |
| **Working system (build sprints 1–5)** | ⬜ To build |
| **22 screenshots** | ⬜ After system built |
| **Chapter 4 — Implementation** | ⬜ After screenshots |
| **UAT with 5+ users** | ⬜ After system built |
| **Chapter 5 — Testing & Evaluation** | ⬜ After UAT |

---

*When the system is running, share screenshots here and Chapter 4 & 5 will be written immediately.*
