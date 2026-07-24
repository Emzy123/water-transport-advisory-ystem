# UI Polish Plan — Implementation Summary

All five polish tracks have been implemented.

## 1. Map experience

- Custom vessel markers — colour-coded by type with heading arrow
- Map legend — floating panel bottom-left
- Fullscreen toggle — top-right button
- Auto fit bounds on load
- Dark map tiles (CartoDB) in dark mode
- Rich popups with structured vessel details

## 2. Loading skeletons

Shimmer placeholders for weather, map, tables, port grid, and warning lists. Spinners only for form submissions.

## 3. Dark mode

Theme toggle in navbar, localStorage persistence, no flash on load, dark variants for all surfaces.

## 4. Micro-copy pass

Centralised in `client/src/content/copy.js` — empty states, hints, labels, vessel type names.

## 5. Thesis screenshots

```bash
npm install && npm run screenshots:install
npm run screenshots
```

Output: `screenshots/chapter-4/fig-4.01-*.png` … `fig-4.22-*.png`
