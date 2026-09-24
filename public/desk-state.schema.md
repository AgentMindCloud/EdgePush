# desk-state.json

`v` is `"1"`. Boot reads this file, then prefers `localStorage` key `desk.v1` when that value also has `v: "1"`. The first successful load is mirrored into `desk.v1`. Stamps write the whole document back to that key. `?demo=coral` and `?demo=quiet` change the view only. They do not write storage.

## clock_tz

IANA zone. The home clock formats `HH:MM` in this zone and refreshes every 30 seconds. Default `Asia/Ho_Chi_Minh`.

## war

| field | type | rule |
| pip | `red` \| `amber` \| `green` | home tile coral, gold, or emerald |
| verdict | string | show at most 8 words |
| sparkline | number[] | last 12 drawn |
| updated_at | ISO-8601 UTC | set when the pip changes |

`KEEP` sets pip `green` and verdict `kept the open claims`. `KILL` sets pip `amber` and verdict `killed the open claims`. `DECIDE` shows only while the viewed pip is `red`.

## lab

| field | type | rule |
| hypothesis | string | show at most 8 words |
| stamp | `live` \| `kill` \| `none` | emerald, coral, or gold |
| plot | number[] | vial chart |
| updated_at | ISO-8601 UTC | set when the stamp changes |

`LIVE` and `KILL` render only when stamp is `none`. After a stamp they unmount.

## radar.roster

`{ bot_id, name, lane }`. `bot_id` is kebab-case. `name` is the short label. `lane` is free text and is not drawn.

## drawer

`{ id, name, status }`. Known status values: `sleeping`, `open`. Anything else reads as quiet. Doors do not contain products.

## events

Invalid events are dropped. A valid event:

| field | rule |
| v | `"0.1"` |
| ts | ISO-8601 UTC (`Z` or a numeric offset) |
| event_id | unique string |
| bot_id | `^[a-z0-9]+(?:-[a-z0-9]+)*$` |
| job_id | same kebab shape |
| parent_job_id | kebab string or null |
| peer_bot_ids | array of kebab strings |
| status | `created` \| `accepted` \| `step` \| `collab` \| `blocked` \| `done` |
| step | 1–80 chars, starts with a lowercase letter |
| intent | 0–80 chars, empty only when status is `done` |
| artifact_url | string or null |
| wait_reason | required non-empty string when `blocked`, otherwise null |

Stage rules used by the app:

- Latest event per `job_id` is the head.
- A capsule shows at most two bots. A later bot on that job is a smaller offset node and counts toward the cap.
- A job with `parent_job_id` is drawn smaller, offset from the parent.
- One gold bridge: the first on-stage job whose head has a non-empty `peer_bot_ids`.
- At most 10 nodes. The rest is a gray `+N`.
- Node color: `blocked` coral, `collab` gold, `step` emerald halo, `accepted` dashed intent, `created` and `done` gray.
- Home radar color, first match: any `blocked` coral, else any `collab` gold, else any `accepted` or `step` emerald, else gray.

## demo

`?demo=coral` forces war pip `red` and, if no blocked event remains, adds an in-memory blocked event. `?demo=quiet` forces war pip `green`, lab stamp `live`, rewrites `blocked` and `collab` to `step`, and clears peers and wait reasons.
