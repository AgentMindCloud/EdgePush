export type PipColor = 'red' | 'amber' | 'green';
export type LabStamp = 'live' | 'kill' | 'none';
export type EventStatus = 'created' | 'accepted' | 'step' | 'collab' | 'blocked' | 'done';

export type DeskEvent = {
  v: '0.1';
  ts: string;
  event_id: string;
  bot_id: string;
  job_id: string;
  parent_job_id: string | null;
  peer_bot_ids: string[];
  status: EventStatus;
  step: string;
  intent: string;
  artifact_url: string | null;
  wait_reason: string | null;
};

export type RosterBot = { bot_id: string; name: string; lane: string };
export type DrawerDoor = { id: string; name: string; status: string };

export type DeskState = {
  v: '1';
  clock_tz: string;
  war: { pip: PipColor; verdict: string; sparkline: number[]; updated_at: string };
  lab: { hypothesis: string; stamp: LabStamp; plot: number[]; updated_at: string };
  radar: { roster: RosterBot[] };
  drawer: DrawerDoor[];
  events: DeskEvent[];
};

const BOT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const STATUSES = new Set<EventStatus>(['created', 'accepted', 'step', 'collab', 'blocked', 'done']);
const FILLERS = new Set(['pass', 'queue', 'claim', 'frontier']);

export type StageBot = { id: string; name: string };

export type StageNode = {
  id: string;
  jobId: string;
  label: string;
  bots: StageBot[];
  status: EventStatus;
  step: string;
  intent: string;
  waitReason: string | null;
  artifactUrl: string | null;
  child: boolean;
  split: boolean;
  parentId: string | null;
  x: number;
  y: number;
};

export type StageBridge = { x1: number; y1: number; x2: number; y2: number };

export type Stage = {
  nodes: StageNode[];
  overflow: number;
  bridge: StageBridge | null;
};

export function clip(value: string, max = 34): string {
  const text = value.trim();
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + '…';
}

export function parseEvent(raw: unknown, seen?: Set<string>): DeskEvent | null {
  if (!raw || typeof raw !== 'object') return null;
  const e = raw as Record<string, unknown>;
  if (e.v !== '0.1') return null;
  if (typeof e.ts !== 'string' || !isUtc(e.ts)) return null;
  if (typeof e.event_id !== 'string' || e.event_id.length === 0) return null;
  if (seen?.has(e.event_id)) return null;
  if (typeof e.bot_id !== 'string' || !BOT.test(e.bot_id)) return null;
  if (typeof e.job_id !== 'string' || !BOT.test(e.job_id)) return null;
  if (!(e.parent_job_id === null || (typeof e.parent_job_id === 'string' && BOT.test(e.parent_job_id)))) return null;
  if (!Array.isArray(e.peer_bot_ids) || !e.peer_bot_ids.every((id) => typeof id === 'string' && BOT.test(id))) return null;
  if (typeof e.status !== 'string' || !STATUSES.has(e.status as EventStatus)) return null;
  const status = e.status as EventStatus;
  if (typeof e.step !== 'string' || e.step.length < 1 || e.step.length > 80 || !/^[a-z]/.test(e.step)) return null;
  if (typeof e.intent !== 'string' || e.intent.length > 80) return null;
  if (status !== 'done' && e.intent.trim() === '') return null;
  if (!(e.artifact_url === null || typeof e.artifact_url === 'string')) return null;
  if (status === 'blocked') {
    if (typeof e.wait_reason !== 'string' || e.wait_reason.trim() === '') return null;
  } else if (e.wait_reason !== null) return null;

  seen?.add(e.event_id);
  return {
    v: '0.1',
    ts: e.ts,
    event_id: e.event_id,
    bot_id: e.bot_id,
    job_id: e.job_id,
    parent_job_id: e.parent_job_id,
    peer_bot_ids: e.peer_bot_ids.slice(),
    status,
    step: e.step,
    intent: e.intent,
    artifact_url: e.artifact_url,
    wait_reason: e.wait_reason,
  };
}

export function parseEvents(raw: unknown): DeskEvent[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const events: DeskEvent[] = [];
  for (const item of raw) {
    const event = parseEvent(item, seen);
    if (event) events.push(event);
  }
  return events;
}

export function radarAccent(events: DeskEvent[]): 'coral' | 'gold' | 'emerald' | 'gray' {
  if (events.some((event) => event.status === 'blocked')) return 'coral';
  if (events.some((event) => event.status === 'collab')) return 'gold';
  if (events.some((event) => event.status === 'accepted' || event.status === 'step')) return 'emerald';
  return 'gray';
}

export function jobLabel(jobId: string): string {
  if (jobId.length <= 9) return jobId;
  const parts = jobId.split('-').filter(Boolean);
  return [...parts].reverse().find((part) => !FILLERS.has(part)) ?? parts[0] ?? jobId;
}

type Group = { jobId: string; events: DeskEvent[]; parentJobId: string | null };

export function deriveStage(events: DeskEvent[], roster: RosterBot[]): Stage {
  const groups = groupEvents(events);
  const built: StageNode[] = [];

  for (const group of groups) {
    const head = group.events[group.events.length - 1];
    const allBots = botsInOrder(group.events);
    const pair = shownPair(group.events, allBots);
    const names = (ids: string[]) => ids.map((id) => ({ id, name: botName(roster, id) }));
    built.push({
      id: group.jobId,
      jobId: group.jobId,
      label: jobLabel(group.jobId),
      bots: names(pair),
      status: head.status,
      step: head.step,
      intent: head.intent,
      waitReason: head.wait_reason,
      artifactUrl: head.artifact_url,
      child: group.parentJobId !== null,
      split: false,
      parentId: group.parentJobId,
      x: 50,
      y: 50,
    });
    for (const extra of allBots.filter((id) => !pair.includes(id))) {
      const own = [...group.events].reverse().find((event) => event.bot_id === extra) ?? head;
      built.push({
        id: `${group.jobId}:${extra}`,
        jobId: group.jobId,
        label: botName(roster, extra),
        bots: names([extra]),
        status: own.status,
        step: own.step,
        intent: own.intent,
        waitReason: own.wait_reason,
        artifactUrl: own.artifact_url,
        child: true,
        split: true,
        parentId: group.jobId,
        x: 50,
        y: 50,
      });
    }
  }

  const ranked = built
    .map((node, index) => ({ node, index }))
    .sort((a, b) => rank(a.node) - rank(b.node) || a.index - b.index)
    .map((item) => item.node);
  const nodes = ranked.slice(0, 10);
  const overflow = Math.max(0, ranked.length - nodes.length);
  place(nodes);

  return { nodes, overflow, bridge: bridgeOf(nodes, groups) };
}

function groupEvents(events: DeskEvent[]): Group[] {
  const sorted = [...events].sort((a, b) => a.ts.localeCompare(b.ts) || a.event_id.localeCompare(b.event_id));
  const order: string[] = [];
  const map = new Map<string, DeskEvent[]>();
  for (const event of sorted) {
    if (!map.has(event.job_id)) {
      map.set(event.job_id, []);
      order.push(event.job_id);
    }
    map.get(event.job_id)?.push(event);
  }
  return order.map((jobId) => {
    const groupEvents = map.get(jobId) ?? [];
    let parentJobId: string | null = null;
    for (const event of groupEvents) {
      if (event.parent_job_id) parentJobId = event.parent_job_id;
    }
    return { jobId, events: groupEvents, parentJobId };
  });
}

function botsInOrder(events: DeskEvent[]): string[] {
  const ids: string[] = [];
  for (const event of events) {
    if (!ids.includes(event.bot_id)) ids.push(event.bot_id);
    for (const peer of event.peer_bot_ids) {
      if (!ids.includes(peer)) ids.push(peer);
    }
  }
  return ids;
}

function shownPair(events: DeskEvent[], all: string[]): string[] {
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const event = events[i];
    if (event.peer_bot_ids.length > 0) {
      const pair = [event.bot_id, ...event.peer_bot_ids].filter((id, index, arr) => arr.indexOf(id) === index);
      return pair.slice(0, 2);
    }
  }
  return all.slice(0, 2);
}

function botName(roster: RosterBot[], id: string): string {
  return roster.find((bot) => bot.bot_id === id)?.name ?? id.split('-')[0] ?? id;
}

function rank(node: StageNode): number {
  const statusRank =
    node.status === 'blocked' ? 0
    : node.status === 'collab' ? 1
    : node.status === 'accepted' || node.status === 'step' ? 2
    : node.status === 'created' ? 3
    : 4;
  return (node.split ? 10 : 0) + statusRank;
}

function place(nodes: StageNode[]) {
  const primaries = nodes.filter((node) => !node.child);
  const count = primaries.length;
  primaries.forEach((node, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / Math.max(count, 1);
    const radius = count <= 1 ? 0 : 27;
    node.x = 50 + Math.cos(angle) * radius;
    node.y = 50 + Math.sin(angle) * radius;
  });

  const byParent = new Map<string, StageNode[]>();
  for (const node of nodes) {
    if (!node.child) continue;
    const key = node.parentId ?? '';
    const list = byParent.get(key) ?? [];
    list.push(node);
    byParent.set(key, list);
  }
  for (const [parentId, children] of byParent) {
    const parent = nodes.find((node) => node.id === parentId);
    children.forEach((child, index) => {
      const originX = parent?.x ?? 50;
      const originY = parent?.y ?? 50;
      const base = Math.atan2(originY - 50, originX - 50);
      const tangential = base + Math.PI / 2;
      const sign = index % 2 === 0 ? 1 : -1;
      const slot = Math.ceil((index + 1) / 2);
      child.x = clamp(originX + Math.cos(tangential) * sign * 20 * slot - Math.cos(base) * 2, 12, 88);
      child.y = clamp(originY + Math.sin(tangential) * sign * 16 * slot - Math.sin(base) * 2, 12, 88);
    });
  }
  for (const node of primaries) {
    node.x = clamp(node.x, 16, 84);
    node.y = clamp(node.y, 16, 84);
  }
}

function bridgeOf(nodes: StageNode[], groups: Group[]): StageBridge | null {
  for (const group of groups) {
    const host = nodes.find((node) => node.id === group.jobId);
    if (!host) continue;
    const head = group.events[group.events.length - 1];
    if (!head || head.peer_bot_ids.length === 0) continue;
    const peerId = head.peer_bot_ids[0];
    const other = nodes.find((node) => node.id !== host.id && !node.split && node.bots.some((bot) => bot.id === peerId));
    if (other) return { x1: host.x, y1: host.y, x2: other.x, y2: other.y };
    return { x1: host.x - 6, y1: host.y, x2: host.x + 6, y2: host.y };
  }
  return null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isUtc(ts: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(ts)) return false;
  return Number.isFinite(Date.parse(ts));
}
