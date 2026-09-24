import { existsSync, mkdirSync, readFileSync, watch, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const dropDir = join(root, 'drop');
const dropFile = join(dropDir, 'desk-state.json');
const once = process.argv.includes('--once');

function apply() {
  if (!existsSync(dropFile)) return;
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(dropFile, 'utf8'));
  } catch {
    return;
  }
  if (!parsed || parsed.v !== '1' || typeof parsed.rev !== 'number' || !Number.isFinite(parsed.rev)) return;
  const text = `${JSON.stringify(parsed, null, 2)}\n`;
  writeFileSync(join(root, 'public', 'desk-state.json'), text);
  if (existsSync(join(root, 'dist'))) writeFileSync(join(root, 'dist', 'desk-state.json'), text);
}

mkdirSync(dropDir, { recursive: true });
apply();
if (!once) watch(dropDir, () => apply());
