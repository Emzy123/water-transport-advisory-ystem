# Chapter 4 Screenshot Guide

Automated capture of all 22 thesis figures.

## Prerequisites

1. PostgreSQL running with seeded data
2. Backend: `cd server && npm run dev` (port 5000)
3. Frontend: `cd client && npm run dev` (port 5173)

## One-time setup

```bash
cd water-transport-portal
npm install
npm run screenshots:install
```

## Capture all figures

```bash
npm run screenshots
```

Output: `screenshots/chapter-4/fig-4.01-home-landing.png` … `fig-4.22-mobile-dashboard.png`

## Figure index

| File | Chapter figure | Content |
|------|----------------|---------|
| fig-4.01-home-landing.png | Fig 4.1 | Public landing page |
| fig-4.02-login.png | Fig 4.2 | Login page |
| fig-4.03-register.png | Fig 4.3 | Registration page |
| fig-4.04-operator-dashboard.png | Fig 4.4 | Vessel Operator dashboard |
| fig-4.05-port-manager-dashboard.png | Fig 4.5 | Port Manager dashboard |
| fig-4.06-regulatory-dashboard.png | Fig 4.6 | Regulatory Official dashboard |
| fig-4.07-public-weather-view.png | Fig 4.7 | Public user view (weather) |
| fig-4.08-vessel-map-popup.png | Fig 4.8 | Vessel map with popup |
| fig-4.09-weather-advisory.png | Fig 4.9 | Weather advisory panel |
| fig-4.10-nav-warnings.png | Fig 4.10 | Navigational warnings list |
| fig-4.11-create-warning.png | Fig 4.11 | Create warning form |
| fig-4.12-port-directory-search.png | Fig 4.12 | Port directory (search active) |
| fig-4.13-berth-management.png | Fig 4.13 | Berth status management |
| fig-4.14-ferry-schedules.png | Fig 4.14 | Ferry schedule table |
| fig-4.15-route-advisory-form.png | Fig 4.15 | Route advisory form |
| fig-4.16-route-advisory-result.png | Fig 4.16 | Route advisory result |
| fig-4.17-emergency-broadcast-form.png | Fig 4.17 | Emergency broadcast form |
| fig-4.18-emergency-banner.png | Fig 4.18 | Emergency banner on dashboard |
| fig-4.19-incident-report-form.png | Fig 4.19 | Incident report form |
| fig-4.20-incident-management.png | Fig 4.20 | Incident management table |
| fig-4.21-audit-log.png | Fig 4.21 | Audit log |
| fig-4.22-mobile-dashboard.png | Fig 4.22 | Mobile responsive dashboard |

## Manual tips

- Toggle **dark mode** (moon icon in navbar) before capturing bridge-operation variants
- Use browser DevTools responsive mode for additional mobile shots
- For UAT evidence, capture user task completion in a separate folder

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_URL` | `http://localhost:5173` | Frontend base URL |
