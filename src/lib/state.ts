import { useMemo, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { parseEvents, type DeskEvent, type DeskState, type LabStamp, type PipColor } from './radar';

export type { DeskEvent, DeskState, DrawerDoor, EventStatus, LabStamp, PipColor, RosterBot } from './radar';

const STORAGE_KEY = 'desk.v1';
const PRACTICE_KEY = 'desk.practiced';

export type DemoMode = 'coral' | 'quiet' | null;
export type PracticePhase = 'ask' | 'coral' | 'off';

let practicePhase: PracticePhase = readPracticed() ? 'off' : 'ask';
let practiceRoom = false;
const practiceListeners = new Set<() => void>();

let snapshot: DeskState | null = readStored();
const listeners = new Set<() => void>();
let started = false;

export function ensureLoaded(): void {
  if (started) return;
  started = true;
  void refresh();
  window.setInterval(() => void refresh(), 30_000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void refresh();
  });
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): DeskState | null {
  return snapshot;
}

function getServerSnapshot(): DeskState | null {
  return null;
}

export function useDesk(): { view: DeskState | null; ready: boolean; practice: PracticePhase } {
  const base = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const practice = useSyncExternalStore(subscribePractice, getPractice, getPracticeServer);
  const { search } = useLocation();
  const mode = practice === 'coral' ? 'coral' : demoMode(search);
  const view = useMemo(() => (base ? applyDemo(base, mode) : null), [base, mode]);
  return { view, ready: base !== null, practice };
}

export function subscribePractice(listener: () => void): () => void {
  practiceListeners.add(listener);
  return () => practiceListeners.delete(listener);
}

export function getPractice(): PracticePhase {
  return practicePhase;
}

export function showCoral(): void {
  practiceRoom = false;
  practicePhase = 'coral';
  emitPractice();
}

export function skipPractice(): void {
  practiceRoom = false;
  rememberPractice();
  practicePhase = 'off';
  emitPractice();
}

export function replayPractice(): void {
  practiceRoom = false;
  practicePhase = 'coral';
  emitPractice();
}

export function finishPractice(): void {
  practiceRoom = false;
  rememberPractice();
  if (practicePhase === 'off') return;
  practicePhase = 'off';
  emitPractice();
}

export function notePracticeRoom(): void {
  if (practicePhase === 'coral') practiceRoom = true;
}

export function consumePracticeRoom(): boolean {
  const seen = practiceRoom;
  practiceRoom = false;
  return seen;
}

export function warTone(pip: PipColor): 'coral' | 'gold' | 'emerald' {
  if (pip === 'red') return 'coral';
  if (pip === 'amber') return 'gold';
  return 'emerald';
}

export function labTone(stamp: LabStamp): 'coral' | 'gold' | 'emerald' {
  if (stamp === 'kill') return 'coral';
  if (stamp === 'none') return 'gold';
  return 'emerald';
}

export function eightWords(value: string): string {
  const words = value.trim().split(/\s+/).filter(Boolean).slice(0, 8);
  return words.length > 0 ? words.join(' ') : 'quiet';
}

export function mergeDesk(local: DeskState | null, file: DeskState): DeskState {
  if (!local) return file;
  if (file.rev < local.rev) return local;
  if (file.rev > local.rev) return file;
  const war = newer(file.war.updated_at, local.war.updated_at) ? file.war : local.war;
  const lab = newer(file.lab.updated_at, local.lab.updated_at) ? file.lab : local.lab;
  const seen = new Set(local.events.map((event) => event.event_id));
  const added = file.events.filter((event) => !seen.has(event.event_id));
  if (war === local.war && lab === local.lab && added.length === 0) return local;
  return { ...local, war, lab, events: [...local.events, ...added] };
}

export function isDegraded(state: DeskState): boolean {
  return state.events.length === 0 && state.war.sparkline.length === 0 && state.drawer.length === 0;
}

export function setWarPip(pip: PipColor): void {
  mutate((state) => ({
    ...state,
    war: { ...state.war, pip, updated_at: new Date().toISOString() },
  }));
}

export function setWarVerdict(verdict: string): void {
  mutate((state) => ({
    ...state,
    war: { ...state.war, verdict, updated_at: new Date().toISOString() },
  }));
}

export function setLabStamp(stamp: 'live' | 'kill'): void {
  mutate((state) => ({
    ...state,
    lab: { ...state.lab, stamp, updated_at: new Date().toISOString() },
  }));
}

export function appendEvent(event: DeskEvent): void {
  mutate((state) => {
    if (state.events.some((item) => item.event_id === event.event_id)) return state;
    return { ...state, events: [...state.events, event] };
  });
}

export function applyDemo(state: DeskState, mode: DemoMode): DeskState {
  if (mode === 'coral') {
    const blocked = state.events.some((event) => event.status === 'blocked');
    return {
      ...state,
      war: { ...state.war, pip: 'red' },
      events: blocked ? state.events : [...state.events, coralEvent()],
    };
  }
  if (mode === 'quiet') {
    return {
      ...state,
      war: { ...state.war, pip: 'green' },
      lab: { ...state.lab, stamp: 'live' },
      events: quietEvents(state.events),
    };
  }
  return state;
}

export function demoMode(search: string): DemoMode {
  const value = new URLSearchParams(search).get('demo');
  if (value === 'coral' || value === 'quiet') return value;
  return null;
}

function quietEvents(events: DeskEvent[]): DeskEvent[] {
  const rewritten = events.map((event) => {
    if (event.status !== 'blocked' && event.status !== 'collab') return event;
    return {
      ...event,
      status: 'step' as const,
      peer_bot_ids: [] as string[],
      wait_reason: null,
      intent: event.intent.trim() || 'hold a quiet watch',
    };
  });
  if (rewritten.some((event) => event.status === 'accepted' || event.status === 'step')) return rewritten;
  const newest = [...rewritten].sort((a, b) => a.ts.localeCompare(b.ts)).at(-1);
  if (!newest) return rewritten;
  return rewritten.map((event) =>
    event.event_id === newest.event_id
      ? {
          ...event,
          status: 'step' as const,
          peer_bot_ids: [],
          wait_reason: null,
          intent: event.intent.trim() || 'hold a quiet watch',
        }
      : event,
  );
}

function coralEvent(): DeskEvent {
  return {
    v: '0.1',
    ts: '2026-09-24T01:05:00Z',
    event_id: 'demo-coral-gate',
    bot_id: 'protocol-scout',
    job_id: 'demo-gate',
    parent_job_id: null,
    peer_bot_ids: [],
    status: 'blocked',
    step: 'hold the human gate',
    intent: 'wait for a human tap',
    artifact_url: null,
    wait_reason: 'human must keep or kill',
  };
}

async function refresh(): Promise<void> {
  const file = await fetchFile();
  if (!file) {
    if (!snapshot) {
      snapshot = emptyState();
      emit();
    }
    return;
  }
  const next = mergeDesk(snapshot, file);
  if (next === snapshot) return;
  snapshot = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* storage may be blocked */
  }
  emit();
}

async function fetchFile(): Promise<DeskState | null> {
  try {
    const response = await fetch('/desk-state.json', { cache: 'no-store' });
    if (!response.ok) return null;
    return parseState(await response.json());
  } catch {
    return null;
  }
}

function newer(fileStamp: string, localStamp: string): boolean {
  if (!fileStamp) return false;
  if (!localStamp) return true;
  return fileStamp > localStamp;
}

function mutate(change: (state: DeskState) => DeskState): void {
  if (!snapshot) return;
  const next = change(snapshot);
  if (next === snapshot) return;
  snapshot = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* storage may be blocked */
  }
  emit();
}

function emit(): void {
  for (const listener of listeners) listener();
}

function emitPractice(): void {
  for (const listener of practiceListeners) listener();
}

function readPracticed(): boolean {
  try {
    return localStorage.getItem(PRACTICE_KEY) === '1';
  } catch {
    return false;
  }
}

function rememberPractice(): void {
  try {
    localStorage.setItem(PRACTICE_KEY, '1');
  } catch {
    /* storage may be blocked */
  }
}

function getPracticeServer(): PracticePhase {
  return 'off';
}

function readStored(): DeskState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function parseState(raw: unknown): DeskState | null {
  if (!raw || typeof raw !== 'object') return null;
  const state = raw as Record<string, unknown>;
  if (state.v !== '1') return null;
  if (!state.war || typeof state.war !== 'object' || !state.lab || typeof state.lab !== 'object') return null;
  const war = state.war as Record<string, unknown>;
  const lab = state.lab as Record<string, unknown>;
  if (war.pip !== 'red' && war.pip !== 'amber' && war.pip !== 'green') return null;
  if (lab.stamp !== 'live' && lab.stamp !== 'kill' && lab.stamp !== 'none') return null;
  const radar = state.radar && typeof state.radar === 'object' ? (state.radar as Record<string, unknown>) : {};
  return {
    v: '1',
    rev: typeof state.rev === 'number' && Number.isFinite(state.rev) ? state.rev : 0,
    clock_tz: typeof state.clock_tz === 'string' && state.clock_tz ? state.clock_tz : 'Asia/Ho_Chi_Minh',
    war: {
      pip: war.pip,
      verdict: typeof war.verdict === 'string' ? war.verdict : 'quiet',
      sparkline: numbers(war.sparkline),
      updated_at: typeof war.updated_at === 'string' ? war.updated_at : '',
    },
    lab: {
      hypothesis: typeof lab.hypothesis === 'string' ? lab.hypothesis : 'quiet',
      stamp: lab.stamp,
      plot: numbers(lab.plot),
      updated_at: typeof lab.updated_at === 'string' ? lab.updated_at : '',
    },
    radar: { roster: rosterOf(radar.roster) },
    drawer: doorsOf(state.drawer),
    events: parseEvents(state.events),
  };
}

function numbers(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is number => typeof item === 'number' && Number.isFinite(item));
}

function rosterOf(raw: unknown): DeskState['radar']['roster'] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const bot = item as Record<string, unknown>;
    if (typeof bot.bot_id !== 'string' || typeof bot.name !== 'string') return [];
    return [{ bot_id: bot.bot_id, name: bot.name, lane: typeof bot.lane === 'string' ? bot.lane : '' }];
  });
}

function doorsOf(raw: unknown): DeskState['drawer'] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const door = item as Record<string, unknown>;
    if (typeof door.id !== 'string' || typeof door.name !== 'string') return [];
    return [{ id: door.id, name: door.name, status: typeof door.status === 'string' ? door.status : 'sleeping' }];
  });
}

function emptyState(): DeskState {
  return {
    v: '1',
    rev: 0,
    clock_tz: 'Asia/Ho_Chi_Minh',
    war: { pip: 'green', verdict: 'quiet', sparkline: [], updated_at: '' },
    lab: { hypothesis: 'quiet', stamp: 'none', plot: [], updated_at: '' },
    radar: { roster: [] },
    drawer: [],
    events: [],
  };
}
