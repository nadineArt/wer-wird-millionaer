import esbuild from 'esbuild';
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');
const PUBLIC = join(ROOT, 'public');
const DIST = join(ROOT, 'dist');
const isWatch = process.argv.includes('--watch');

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const s = join(src, entry);
    const d = join(dest, entry);
    if (statSync(s).isDirectory()) copyDir(s, d);
    else copyFileSync(s, d);
  }
}

const config = {
  entryPoints: [
    join(SRC, 'player.js'),
    join(SRC, 'admin.js'),
    join(SRC, 'beamer.js'),
  ],
  bundle: true,
  outdir: join(DIST, 'js'),
  format: 'esm',
  splitting: true,
  sourcemap: true,
  minify: !isWatch,
};

if (isWatch) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  mkdirSync(DIST, { recursive: true });
  copyDir(PUBLIC, DIST);
  await esbuild.build(config);
  console.log('Build complete.');
}
