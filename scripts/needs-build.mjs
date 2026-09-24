import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function walk(dir, out) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else out.push(path);
  }
}

const files = [];
for (const dir of ['src', 'public']) walk(dir, files);
for (const file of ['index.html', 'package.json', 'vite.config.ts', 'tsconfig.json']) files.push(file);
const newest = Math.max(...files.map((file) => statSync(file).mtimeMs));
const built = statSync('dist/index.html').mtimeMs;
process.exit(newest > built ? 2 : 0);
