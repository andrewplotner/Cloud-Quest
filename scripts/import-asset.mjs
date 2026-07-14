import { promises as fs } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const [kind, inputArgument] = process.argv.slice(2);

if (!['game', 'splash'].includes(kind) || !inputArgument) {
  console.error('Usage: node scripts/import-asset.mjs <game|splash> <input-file>');
  process.exit(1);
}

const root = process.cwd();
const inputPath = path.resolve(root, inputArgument);
const outputDirectory = kind === 'game'
  ? path.join(root, 'game', 'chunks')
  : path.join(root, 'assets', 'splash', 'chunks');
const raw = await fs.readFile(inputPath);
const payload = kind === 'game' ? gzipSync(raw, { level: 9 }) : raw;
const chunkSize = kind === 'game' ? 96 * 1024 : 200 * 1024;

await fs.rm(outputDirectory, { recursive: true, force: true });
await fs.mkdir(outputDirectory, { recursive: true });

const writes = [];
for (let offset = 0, index = 0; offset < payload.length; offset += chunkSize, index += 1) {
  const extension = kind === 'game' ? 'b64' : 'bin';
  const name = `part-${String(index).padStart(3, '0')}.${extension}`;
  const chunk = payload.subarray(offset, offset + chunkSize);
  writes.push(fs.writeFile(
    path.join(outputDirectory, name),
    kind === 'game' ? chunk.toString('base64') : chunk,
  ));
}
await Promise.all(writes);

console.log(`Imported ${kind}: ${raw.length} bytes -> ${writes.length} committed chunks`);
