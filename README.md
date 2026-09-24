# EdgePush

Visual daily desk for the edge use cases (WAR / LAB / RADAR).
Phone-first. Almost no text. Color is the UI.

Repo: https://github.com/AgentMindCloud/EdgePush

## Human use (when the app actually runs)

1. Double-click `START-DESK.bat` on Windows, or open the published URL on the phone.
2. Around 10:00–11:00 Asia/Ho_Chi_Minh: look at three tiles.
3. Tap only coral/red. Esc or back = home.

## Dev

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 4173
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Grok Build: read `AGENTS.md` then `prompts/GROK_BUILD_MOBILE_DESK.md`.

## Status

Skeleton + canon only. Local Windows build existed at `C:\Users\louis\desk`.
This repo is the source of truth. Mobile / real browser quality is the next Build pass.
