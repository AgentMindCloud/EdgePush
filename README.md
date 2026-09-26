# DESK

Three tiles. Color is the UI. Tap only coral or red.

## On this PC

Double-click `START-DESK.bat`. Wait for the browser.

- Green / gold / gray = look, do not tap
- Coral / red = tap that tile
- WAR: KEEP or KILL
- LAB: LIVE or KILL if unstamped
- Esc or back = home
- Close the black window when done

First visit shows PRACTICE. Drawer → Practice to see coral again.

If tiles look empty after an update, clear site data for this page once (old empty save).

## Phone

Same Wi-Fi as the PC: run `npm run start:lan` on the PC, open the printed URL on the phone, then Add to Home Screen.

After Pages is enabled: https://agentmindcloud.github.io/EdgePush/

## Why it looked broken

`public/desk-state.json` had been saved empty. DESK only shows what the seed holds. Seed is restored (`rev` 3) with a red WAR, unstamped LAB, and a radar that has a gold pair plus a coral gate.

## Dev

```bash
npm install
npm run dev
npm run build
npm run preview
```
