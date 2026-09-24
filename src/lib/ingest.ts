// Bots / automations will POST or drop JSON here later.

import { parseEvent } from './radar';
import { appendEvent, setWarPip as writeWarPip } from './state';

export function ingestEvent(e: unknown): void {
  const event = parseEvent(e);
  if (!event) return;
  appendEvent(event);
}

export function setWarPip(pip: 'red' | 'amber' | 'green'): void {
  writeWarPip(pip);
}
