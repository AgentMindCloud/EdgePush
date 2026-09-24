# EdgePush — AGENTS

This repo is the contract for DESK. Grok Build and Codex must obey it.

## Product

One home. Three tiles: WAR, LAB, RADAR. Drawer for World, Foundry, Voice, X-Card, Physics, Film, Economy.
Do not build drawer interiors unless a home tile is removed first.

Daily time: 10:00–11:00 Asia/Ho_Chi_Minh. Not 08:00.

## Visual

Field `#07080B`. Glass `#0E1218`. Edge `#1C2430`.
Gray `#8B93A1`. Emerald `#12B886`. Gold `#E0B84A`. Teal `#2A9B8F`. Coral `#E36A5D`. Intent `#F3E6C0`.
Max 8 words per sentence on canvas. Max 10 radar nodes. Max 2 bots per job.

## Do not

Fourth home tile. Login. Chat box. Prompt box. Spawn Grok Bot. Scrape Grok Bot UI.
MUI / Chart.js / component kits. Hover-only controls.

## Mobile is the bar

If it fails on a 390×844 phone browser, it is not shipped.
Use `100dvh`, safe-area insets, 44px targets, no horizontal scroll.
PWA installable. Preview must bind `127.0.0.1` or `0.0.0.0`, never assume localhost-only hover.

## State

`public/desk-state.json` → `localStorage` key `desk.v1`.
Radar events: schema v0.1 in `docs/CANON.md`. Drop invalid events.

## Next agent pass

Read `prompts/GROK_BUILD_MOBILE_DESK.md` and make the UI actually usable on phone + desktop browser.
