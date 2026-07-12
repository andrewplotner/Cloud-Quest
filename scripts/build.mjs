import { promises as fs } from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

const root = process.cwd();
const outputDir = path.join(root, 'dist');
const outputAssets = path.join(outputDir, 'assets');

async function readChunks(directory) {
  const names = (await fs.readdir(directory)).sort();
  if (names.length === 0) throw new Error(`No asset chunks found in ${directory}`);
  const chunks = await Promise.all(names.map((name) => fs.readFile(path.join(directory, name))));
  return Buffer.concat(chunks);
}

const gameArchive = await readChunks(path.join(root, 'game', 'chunks'));
const splashImage = await readChunks(path.join(root, 'assets', 'splash', 'chunks'));
let html = gunzipSync(gameArchive).toString('utf8');

if (!/<meta\s+name=["']viewport["']/i.test(html)) {
  html = html.replace(
    /<meta\s+charset=["']utf-8["']\s*\/?>/i,
    '$&\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
  );
}

if (!/<meta\s+name=["']theme-color["']/i.test(html)) {
  html = html.replace(
    /<\/head>/i,
    '<meta name="theme-color" content="#06142e">\n</head>',
  );
}

const mobileStyles = String.raw`
<style id="caq-mobile-shell">
  html { background: #06142e; }
  *, *::before, *::after { box-sizing: border-box; }
  body {
    min-height: 100dvh;
    overflow-x: hidden;
    padding-top: max(12px, env(safe-area-inset-top));
    padding-right: max(12px, env(safe-area-inset-right));
    padding-bottom: max(12px, env(safe-area-inset-bottom));
    padding-left: max(12px, env(safe-area-inset-left));
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
  }
  button, select, [role="button"] { min-height: 44px; }
  #caq-app-splash {
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    display: grid;
    place-items: center;
    overflow: hidden;
    padding: max(20px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right))
      max(20px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left));
    background: #06142e;
    opacity: 1;
    visibility: visible;
    transition: opacity 420ms ease, visibility 420ms ease;
  }
  #caq-app-splash.caq-splash-hidden {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }
  #caq-app-splash img {
    display: block;
    width: min(82vw, 620px);
    max-width: 100%;
    max-height: 86dvh;
    object-fit: contain;
    filter: drop-shadow(0 0 28px rgba(34, 211, 238, 0.2));
    animation: caqBlueprintPulse 1.8s ease-in-out infinite alternate;
  }
  @keyframes caqBlueprintPulse {
    from { transform: scale(0.985); filter: brightness(0.92) drop-shadow(0 0 20px rgba(34, 211, 238, 0.12)); }
    to { transform: scale(1); filter: brightness(1.08) drop-shadow(0 0 34px rgba(34, 211, 238, 0.28)); }
  }
  @media (prefers-reduced-motion: reduce) {
    #caq-app-splash img { animation: none; }
    #caq-app-splash { transition-duration: 1ms; }
  }
  @media (max-width: 600px) {
    body { padding-left: max(8px, env(safe-area-inset-left)); padding-right: max(8px, env(safe-area-inset-right)); }
    .card { padding: 14px; margin: 12px 0; }
  }
</style>
`;

const splashMarkup = String.raw`
<div id="caq-app-splash" role="status" aria-label="Loading Cloud Architect Quest">
  <img src="./assets/architect-blueprint.png" alt="">
</div>
<script id="caq-splash-controller">
(() => {
  const splash = document.getElementById('caq-app-splash');
  const started = performance.now();
  let hidden = false;
  const hideSplash = () => {
    if (hidden || !splash) return;
    hidden = true;
    const minimumDisplay = Math.max(0, 850 - (performance.now() - started));
    window.setTimeout(() => {
      splash.classList.add('caq-splash-hidden');
      window.setTimeout(() => splash.remove(), 500);
    }, minimumDisplay);
  };
  window.addEventListener('load', hideSplash, { once: true });
  window.setTimeout(hideSplash, 6000);
})();
</script>
`;

html = html.replace(/<\/head>/i, `${mobileStyles}</head>`);
html = html.replace(/<body([^>]*)>/i, `<body$1>${splashMarkup}`);

if (!html.includes('id="caq-app-splash"')) {
  throw new Error('Could not inject the mobile splash screen.');
}

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputAssets, { recursive: true });
await Promise.all([
  fs.writeFile(path.join(outputDir, 'index.html'), html, 'utf8'),
  fs.writeFile(path.join(outputAssets, 'architect-blueprint.png'), splashImage),
]);

console.log(`Built Cloud Architect Quest (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(1)} MB)`);
