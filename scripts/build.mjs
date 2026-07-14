import { promises as fs } from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

const root = process.cwd();
const outputDir = path.join(root, 'dist');
const chunkDirectory = path.join(root, 'game', 'chunks');

const chunkNames = (await fs.readdir(chunkDirectory)).sort();
if (chunkNames.length === 0) {
  throw new Error(`No game chunks found in ${chunkDirectory}`);
}

const chunks = await Promise.all(
  chunkNames.map((name) => fs.readFile(path.join(chunkDirectory, name))),
);
const html = gunzipSync(Buffer.concat(chunks));

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, 'index.html'), html);

console.log(`Built unchanged HTML (${html.length} bytes)`);
