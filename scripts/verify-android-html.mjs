import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = path.join(root, 'dist', 'index.html');
const assets = path.join(root, 'android', 'app', 'src', 'main', 'assets');
const destination = path.join(
  assets,
  'public',
  'index.html',
);

// Do not leave the asset path used by the earlier native-only wrapper in the APK.
await fs.rm(path.join(assets, 'www'), { recursive: true, force: true });

const [sourceBytes, packagedBytes] = await Promise.all([
  fs.readFile(source),
  fs.readFile(destination),
]);

if (!sourceBytes.equals(packagedBytes)) {
  throw new Error('Capacitor changed the packaged HTML');
}

const plugins = JSON.parse(
  await fs.readFile(path.join(assets, 'capacitor.plugins.json'), 'utf8'),
);
if (!Array.isArray(plugins) || plugins.length !== 0) {
  throw new Error('Unexpected Capacitor plugins are configured');
}

console.log(`Verified unchanged Capacitor HTML copy with no plugins (${packagedBytes.length} bytes)`);
