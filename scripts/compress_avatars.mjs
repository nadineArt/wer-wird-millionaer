import sharp from 'sharp';
import { readdirSync, statSync, writeFileSync, renameSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, '..', 'public', 'assets', 'avatars');
const files = readdirSync(dir).filter(f => f.endsWith('.jpg'));

let before = 0, after = 0;
for (const f of files) {
  const src = join(dir, f);
  const tmp = src + '.tmp';
  const origSize = statSync(src).size;
  before += origSize;

  const buf = await sharp(src)
    .resize(200, 200, { fit: 'cover', position: 'top' })
    .jpeg({ quality: 72, mozjpeg: true })
    .toBuffer();

  writeFileSync(tmp, buf);
  renameSync(tmp, src);
  after += buf.length;
  console.log(`${f}: ${Math.round(origSize/1024)}KB → ${Math.round(buf.length/1024)}KB`);
}

console.log(`\nGesamt: ${Math.round(before/1024)}KB → ${Math.round(after/1024)}KB (${Math.round((1-after/before)*100)}% kleiner)`);
