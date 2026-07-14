import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = path.join(root, 'dist', 'index.html');
const assets = path.join(root, 'android', 'app', 'src', 'main', 'assets');
const destinationDirectory = path.join(assets, 'www');
const destination = path.join(destinationDirectory, 'index.html');

// Remove files produced by the previous Capacitor wrapper so no bridge script
// or generated configuration can be packaged with the standalone game.
await Promise.all([
  fs.rm(path.join(assets, 'public'), { recursive: true, force: true }),
  fs.rm(path.join(assets, 'capacitor.config.json'), { force: true }),
  fs.rm(path.join(assets, 'capacitor.plugins.json'), { force: true }),
]);

await fs.rm(destinationDirectory, { recursive: true, force: true });
await fs.mkdir(destinationDirectory, { recursive: true });
await fs.copyFile(source, destination);

const [sourceBytes, packagedBytes] = await Promise.all([
  fs.readFile(source),
  fs.readFile(destination),
]);

if (!sourceBytes.equals(packagedBytes)) {
  throw new Error('Android asset differs from dist/index.html');
}

console.log(`Copied unchanged HTML to Android assets (${packagedBytes.length} bytes)`);
