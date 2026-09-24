# EdgePush canon

## Why this repo exists

Keep the edge ideas and the daily DESK in one place so they are not ten dead grok.me links.

Home stage (only these three):
1. WAR — synthesis board, pip red/amber/green
2. LAB — last kill-test, stamp live/kill
3. RADAR — job map from events, cap 10 nodes

Drawer (sleeping doors, no interiors yet):
World, Foundry, Voice, X-Card, Physics, Film, Economy

## Four runtimes

| Runtime | Owns |
|---|---|
| This web app | What the human sees |
| Grok Bots | Night work on their cloud PC |
| Grok Automations | Clock ping only |
| GitHub (this repo) | Contract, state seed, code |
| Local Ollama | Day drafts — not this UI |

Bots consume DESK. DESK does not spawn Bots.

## Event schema v0.1

Required fields: v, ts, event_id, bot_id, job_id, parent_job_id, peer_bot_ids, status, step, intent, artifact_url, wait_reason.
status: created | accepted | step | collab | blocked | done
Drop invalid events. No heartbeats.

## Color

coral = must tap. gold = collab or unstamped lab. emerald = ok. gray = sleep.

## Time

Operator uses DESK at 10:00–11:00 Asia/Ho_Chi_Minh.
