#!/usr/bin/env node
/**
 * Captures all 22 thesis screenshots (Chapter 4 figures).
 *
 * Prerequisites:
 *   1. Backend running:  cd server && npm run dev   (port 5000)
 *   2. Frontend running: cd client && npm run dev   (port 5173)
 *   3. Database seeded:  cd server && npm run seed
 *
 * Usage:
 *   npm run screenshots
 */

import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'screenshots', 'chapter-4');
const BASE = process.env.APP_URL || 'http://localhost:5173';
const PASSWORD = 'Password@1';

const accounts = {
  regulatory: { email: 'admin@portal.ng', role: 'REGULATORY_OFFICIAL' },
  portManager: { email: 'pm@portal.ng', role: 'PORT_MANAGER' },
  operator: { email: 'capt@portal.ng', role: 'VESSEL_OPERATOR' },
};

async function login(page, email) {
  await page.goto(`${BASE}/login`);
  await page.waitForSelector('[data-testid="login-form"]');
  await page.fill('[data-testid="login-form"] input[type="email"]', email);
  await page.fill('[data-testid="login-form"] input[type="password"]', PASSWORD);
  await page.click('[data-testid="login-form"] button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(800);
}

async function logout(page) {
  await page.goto(`${BASE}/`);
  await page.evaluate(() => localStorage.clear());
}

async function capture(page, filename, options = {}) {
  const path = join(OUT_DIR, filename);
  if (options.fullPage !== false) {
    await page.screenshot({ path, fullPage: options.fullPage ?? true });
  } else {
    await page.screenshot({ path });
  }
  console.log(`  ✓ ${filename}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`\nCapturing thesis screenshots → ${OUT_DIR}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  try {
    // Fig 4.1 — Home
    await page.goto(BASE);
    await page.waitForSelector('[data-testid="home-page"]');
    await capture(page, 'fig-4.01-home-landing.png');

    // Fig 4.2 — Login
    await page.goto(`${BASE}/login`);
    await page.waitForSelector('[data-testid="login-form"]');
    await capture(page, 'fig-4.02-login.png');

    // Fig 4.3 — Register
    await page.goto(`${BASE}/register`);
    await page.waitForSelector('[data-testid="register-form"]');
    await capture(page, 'fig-4.03-register.png');

    // Fig 4.4 — Operator dashboard
    await login(page, accounts.operator.email);
    await capture(page, 'fig-4.04-operator-dashboard.png');
    await logout(page);

    // Fig 4.5 — Port Manager dashboard
    await login(page, accounts.portManager.email);
    await capture(page, 'fig-4.05-port-manager-dashboard.png');
    await logout(page);

    // Fig 4.6 — Regulatory dashboard
    await login(page, accounts.regulatory.email);
    await capture(page, 'fig-4.06-regulatory-dashboard.png');

    // Fig 4.7 — Public view (weather, logged out)
    await logout(page);
    await page.goto(`${BASE}/weather`);
    await page.waitForSelector('[data-testid="weather-panel"]', { timeout: 45000 });
    await page.waitForTimeout(2000);
    await capture(page, 'fig-4.07-public-weather-view.png');

    // Fig 4.8 — Vessel map with popup
    await page.goto(`${BASE}/vessels`);
    await page.waitForSelector('.vessel-marker-wrapper, .leaflet-marker-icon', { timeout: 30000 });
    await page.waitForTimeout(1500);
    const marker = page.locator('.vessel-marker-wrapper, .leaflet-marker-icon').first();
    if (await marker.count()) {
      await marker.click();
      await page.waitForTimeout(500);
    }
    await capture(page, 'fig-4.08-vessel-map-popup.png');

    // Fig 4.9 — Weather panel
    await page.goto(`${BASE}/weather`);
    await page.waitForSelector('[data-testid="weather-panel"]', { timeout: 20000 });
    await capture(page, 'fig-4.09-weather-advisory.png');

    // Fig 4.10 — Nav warnings list
    await page.goto(`${BASE}/warnings`);
    await page.waitForSelector('[data-testid="warnings-list"]', { timeout: 15000 });
    await capture(page, 'fig-4.10-nav-warnings.png');

    // Fig 4.11 — Create warning (regulatory)
    await login(page, accounts.regulatory.email);
    await page.goto(`${BASE}/warnings/manage`);
    await page.waitForTimeout(1000);
    await capture(page, 'fig-4.11-create-warning.png');

    // Fig 4.12 — Port directory with search
    await page.goto(`${BASE}/ports`);
    await page.waitForSelector('[data-testid="port-search"]');
    await page.fill('[data-testid="port-search"]', 'Lokoja');
    await page.waitForSelector('[data-testid="port-grid"]');
    await page.waitForTimeout(400);
    await capture(page, 'fig-4.12-port-directory-search.png');

    // Fig 4.13 — Berth management
    await login(page, accounts.portManager.email);
    await page.goto(`${BASE}/berths`);
    await page.waitForTimeout(1000);
    await capture(page, 'fig-4.13-berth-management.png');

    // Fig 4.14 — Ferry schedules
    await page.goto(`${BASE}/schedules`);
    await page.waitForTimeout(1000);
    await capture(page, 'fig-4.14-ferry-schedules.png');

    // Fig 4.15 — Route advisory form
    await login(page, accounts.operator.email);
    await page.goto(`${BASE}/route-advisory`);
    await page.waitForTimeout(800);
    await capture(page, 'fig-4.15-route-advisory-form.png');

    // Fig 4.16 — Route advisory result
    await page.fill('input[placeholder="e.g. 1"]', '1');
    await page.click('[data-testid="route-advisory-form"] button[type="submit"]');
    await page.waitForTimeout(2000);
    await capture(page, 'fig-4.16-route-advisory-result.png');

    // Fig 4.17 — Emergency broadcast form
    await login(page, accounts.regulatory.email);
    await page.goto(`${BASE}/emergency`);
    await page.waitForSelector('[data-testid="emergency-form"]');
    await capture(page, 'fig-4.17-emergency-broadcast-form.png');

    // Fig 4.18 — Emergency banner on dashboard
    await page.goto(`${BASE}/dashboard`);
    await page.waitForTimeout(1000);
    await capture(page, 'fig-4.18-emergency-banner.png', { fullPage: false });

    // Fig 4.19 — Incident report form
    await login(page, accounts.operator.email);
    await page.goto(`${BASE}/incidents`);
    await page.waitForTimeout(800);
    await capture(page, 'fig-4.19-incident-report-form.png');

    // Fig 4.20 — Incident management
    await login(page, accounts.regulatory.email);
    await page.goto(`${BASE}/incidents/manage`);
    await page.waitForTimeout(1000);
    await capture(page, 'fig-4.20-incident-management.png');

    // Fig 4.21 — Audit log
    await page.goto(`${BASE}/audit`);
    await page.waitForTimeout(1000);
    await capture(page, 'fig-4.21-audit-log.png');

    // Fig 4.22 — Mobile responsive dashboard
    await context.close();
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
      deviceScaleFactor: 2,
      isMobile: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${BASE}/login`);
    await mobilePage.fill('[data-testid="login-form"] input[type="email"]', accounts.operator.email);
    await mobilePage.fill('[data-testid="login-form"] input[type="password"]', PASSWORD);
    await mobilePage.click('[data-testid="login-form"] button[type="submit"]');
    await mobilePage.waitForURL('**/dashboard', { timeout: 15000 });
    await mobilePage.waitForTimeout(800);
    await mobilePage.screenshot({
      path: join(OUT_DIR, 'fig-4.22-mobile-dashboard.png'),
      fullPage: true,
    });
    console.log('  ✓ fig-4.22-mobile-dashboard.png');
    await mobileContext.close();

    console.log('\nDone — 22 screenshots saved.\n');
  } catch (err) {
    console.error('\nScreenshot capture failed:', err.message);
    console.error('Ensure server (5000) and client (5173) are running, and DB is seeded.\n');
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
