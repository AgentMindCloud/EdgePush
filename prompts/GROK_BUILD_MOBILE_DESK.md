# GROK BUILD — EdgePush mobile + browser rebuild

You are Grok Build (or Codex). Work in this repo: https://github.com/AgentMindCloud/EdgePush
Local clone may also exist at C:\Users\louis\desk. Prefer this GitHub repo as source of truth.
If both exist, copy working pieces from the Windows folder into this repo, then make them actually usable on phone and desktop browsers.

Read first: AGENTS.md, docs/CANON.md, this file.
Plan in 10 bullets. Then implement until acceptance is green.
Commit in this repo. Do not invent a fourth product.

---

## Problem you must fix

A first DESK exists. It does **not** work well in a real browser, and it does **not** work on a phone.
Treat the current UI as a sketch. Rebuild the front-end so a human can use it daily at 10:00–11:00 without a terminal.

Typical failures you must kill:

- page taller than the screen, user has to hunt
- tiles overflow, wrap into a text list, or sit under the notch
- tap targets too small; hover-only buttons
- 100vh jumps on iOS / Android Chrome
- Vite only on a random port; phone cannot open the PC
- white flash, default serif, system blue links
- radar / charts crash on small width
- back gesture does not return home
- PRACTICE hidden behind `?demo=coral` (human will never type that)
- “localhost” instructions instead of one tap / one double-click

If it is ugly or broken at **360×740** and **390×844**, you are not done.

---

## Product (do not change the idea)

**DESK** = one dark glass home, three tiles.

| Tile | Route | Human does |
|---|---|---|
| WAR | /war | look at sparkline + 8-word verdict. If coral, DECIDE → KEEP or KILL |
| LAB | /lab | look at last experiment. If unstamped, LIVE or KILL |
| RADAR | /radar | look at job dots. Coral node = human gate. Inspector 4 rows |
| DRAWER | /drawer | seven sleeping doors + PRACTICE + HOW. No interiors |

Keys: 1 WAR, 2 LAB, 3 RADAR, 0 drawer, Esc home.
Browser back and left swipe = home from a room.

Clock tz: Asia/Ho_Chi_Minh. No 08:00 copy anywhere.

---

## Visual (exact)

Background `#07080B`. Glass tiles `#0E1218` + 1px `#1C2430`.
Gray `#8B93A1` · emerald `#12B886` · gold `#E0B84A` · teal `#2A9B8F` · coral `#E36A5D` · intent `#F3E6C0`.
Wordmark small caps DESK. 8 words max per line.
Emerald halo breathes 2s unless prefers-reduced-motion.
Coral does not blink.
No MUI, no Tailwind kit, no Chart.js, no emoji rain.

Home (phone):
- top: DESK · clock · LIVE dot
- three tall tiles in a **row** if width ≥ 360, stacked only below 360
- each tile ≥ 44px in every tap region
- bottom: DRAWER chevron, above the home indicator

Home (desktop 1280): same composition, tiles larger, still only three.

---

## State

Load `public/desk-state.json`. Mirror to `localStorage` key `desk.v1`.
WAR KEEP/KILL and LAB LIVE/KILL write through immediately.
Radar derives from `events[]`. Drop events that miss schema v0.1 fields.
Home pip rules:
- WAR color = war.pip (red=coral, amber=gold, green=emerald)
- LAB gold if stamp none, emerald if live, coral if kill
- RADAR coral if any blocked, gold if any collab, else emerald if working else gray

---

## First-run PRACTICE (required)

Never tell the human to type a query string.
If `localStorage.desk.practiced !== "1"` show overlay:

```
PRACTICE
coral means tap
[SHOW CORAL]  [SKIP]
```

SHOW CORAL = force WAR red + DECIDE and a blocked radar node. After they act or go home, set practiced=1 and restore real state.
SKIP = set flag, show real state.
Keep `?demo=coral` and `?demo=quiet` as hidden extras.
Drawer has PRACTICE + HOW (three lines: double-click START-DESK / look at colors / tap coral only).

---

## Phone + PWA (required)

- viewport-fit=cover, theme-color #07080B
- apple-mobile-web-app-capable, black-translucent status bar
- `public/manifest.webmanifest` + simple icons (SVG or 192/512 PNG you generate)
- `100dvh` not `100vh`
- padding uses env(safe-area-inset-*)
- overscroll-behavior: none
- touch-action manipulation on tiles
- no hover-only UI
- “Add to Home Screen” must show DESK, not Vite

When previewing from the PC for a phone on the same Wi‑Fi, also bind `0.0.0.0` **in addition** to 127.0.0.1 via a script `start:lan` that prints the LAN URL. Do not replace START-DESK.bat 127.0.0.1 behavior for the owner’s own machine.

---

## Windows one-click (keep)

`START-DESK.bat` in repo root:
1. cd to repo
2. npm install if needed
3. npm run build if dist missing/stale
4. npm run preview on 4173
5. open http://127.0.0.1:4173/

Do not require the human to type npm.

---

## Code shape

Vite + React + TypeScript + React Router.
Keep files tight:

```
src/main.tsx
src/App.tsx
src/desk.css
src/lib/state.ts
src/lib/ingest.ts
src/lib/radar.ts
src/pages/Home.tsx
src/pages/War.tsx
src/pages/Lab.tsx
src/pages/Radar.tsx
src/pages/Drawer.tsx
src/components/Tile.tsx
src/components/Pip.tsx
src/components/Sparkline.tsx
src/components/RadarMap.tsx
src/components/Inspector.tsx
src/components/Practice.tsx
```

Stub `ingestEvent` / `setWarPip` for later Bot writes. No fake spawn button.

---

## Implementation order

1. Make Home layout correct at 360, 390, 430, 1280. No overflow. Safe areas.
2. Wire state + pips + routes.
3. WAR / LAB stamp flows.
4. Radar map + inspector from seed events (include one gold bridge + one blocked).
5. PRACTICE overlay + drawer HOW.
6. PWA manifest + icons.
7. START-DESK.bat + start:lan.
8. `npm run build` must pass.
9. Manually walk every route in a 390-wide viewport (browser device mode). Fix what breaks.

After each step, delete words if a screen has more than ~20.

---

## Acceptance

- [ ] Home: only DESK, clock, LIVE, three tiles, drawer chevron
- [ ] 360 and 390 widths: no horizontal scroll, tiles tappable
- [ ] 1280 width: still three tiles, not a dashboard table
- [ ] WAR DECIDE only when red; KEEP/KILL persist
- [ ] LAB buttons only when unstamped; stamp persists
- [ ] Radar ≤10 nodes, ≤2 bots on a job, coral on blocked, inspector wait_reason
- [ ] PRACTICE overlay on first visit; hidden query demos still work
- [ ] Esc / back / swipe-left from a room returns home
- [ ] PWA manifest present
- [ ] START-DESK.bat exists
- [ ] npm run build exits 0
- [ ] No fourth tile, no chat, no spawn bot

---

## Git

Commit on `main` of AgentMindCloud/EdgePush.
Message example: `feat(desk): phone-first three-tile surface`.
Do not force-push.
If C:\Users\louis\desk still exists, copy any good CSS/components from it, then keep developing in this repo.

## Report when done

```
READY
repo: https://github.com/AgentMindCloud/EdgePush
phone 390: pass/fail
phone 360: pass/fail
desktop 1280: pass/fail
practice: overlay yes/no
start bat: yes/no
build: ok/fail
open: http://127.0.0.1:4173/
```
