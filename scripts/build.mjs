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
  html = html.replace(/<\/head>/i, '<meta name="theme-color" content="#06142e">\n</head>');
}

const mobileStyles = String.raw`
<style id="caq-mobile-shell">
  html { background: #06142e; }
  *, *::before, *::after { box-sizing: border-box; }
  html, body {
    width: 100%;
    max-width: 100%;
    min-height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-text-size-adjust: 100%;
    -webkit-overflow-scrolling: touch;
  }
  body {
    min-height: 100dvh;
    height: auto;
    margin: 0;
    padding-top: max(12px, env(safe-area-inset-top));
    padding-right: max(12px, env(safe-area-inset-right));
    padding-bottom: max(12px, env(safe-area-inset-bottom));
    padding-left: max(12px, env(safe-area-inset-left));
  }
  img, canvas, video { max-width: 100%; height: auto; }
  button, select, input, textarea, [role="button"] { min-height: 44px; font: inherit; }
  table { width: 100%; table-layout: fixed; border-collapse: collapse; }
  td, th { word-break: break-word; white-space: normal; }
  .card, .serviceInfoPanel, .builderSide, .builderScorePanel, .builderTray, .builderCanvas, .choice, .cardChoice {
    max-width: 100%;
    overflow-wrap: anywhere;
  }

  /* The outer stage is the viewport. The injected inner track owns the authored map coordinates. */
  .questWorldMap {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow: hidden !important;
  }
  .questWorldMap .questWorldStage {
    display: block !important;
    width: auto !important;
    max-width: 100%;
    min-width: 0 !important;
    height: clamp(620px, 68vh, 720px);
    min-height: 620px !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    overscroll-behavior-x: contain;
    scroll-behavior: smooth;
    scrollbar-width: thin;
    scrollbar-color: rgba(96, 165, 250, 0.8) rgba(15, 23, 42, 0.65);
    -webkit-overflow-scrolling: touch;
    touch-action: pan-x pan-y;
  }
  .questWorldMap .questWorldStage::-webkit-scrollbar { height: 10px; }
  .questWorldMap .questWorldStage::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.65);
    border-radius: 999px;
  }
  .questWorldMap .questWorldStage::-webkit-scrollbar-thumb {
    background: linear-gradient(90deg, #2563eb, #22d3ee);
    border: 2px solid rgba(15, 23, 42, 0.65);
    border-radius: 999px;
  }
  .questWorldMap .questWorldTrack {
    position: relative;
    width: max(2400px, 100%);
    min-width: 2400px;
    height: 100%;
    min-height: 100%;
  }
  .questWorldMap .questWorldTrack > .questWorldSvg {
    position: absolute !important;
    inset: 0 !important;
    display: block !important;
    width: 100% !important;
    min-width: 0 !important;
    max-width: none !important;
    height: 100% !important;
    pointer-events: none;
  }
  .questWorldMap .questWorldTrack > .floatingRealm {
    position: absolute !important;
  }

  .topbar { gap: 8px; }
  .choiceInner { min-height: auto; gap: 8px; }
  .choiceNum { flex: 0 0 34px; }

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
  @media (max-width: 900px) {
    body { padding: 8px; }
    .builderLayout { grid-template-columns: 1fr !important; padding: 10px; gap: 10px; }
    .builderTray { grid-column: auto !important; grid-template-columns: 1fr; }
    .builderCanvas { min-height: 420px; }
    .builderHeader { flex-direction: column; align-items: flex-start; gap: 8px; padding: 14px; }
    .builderSide, .builderScorePanel, .builderTray { padding: 12px; }
    .serviceToken { width: min(100%, 112px); min-height: 72px; font-size: 0.73rem; }
    .trayCards { flex-wrap: wrap; }
    .grid { grid-template-columns: 1fr !important; }
    .questWorldMap .questWorldStage {
      height: 680px;
      min-height: 680px !important;
      margin-right: 8px;
      margin-left: 8px;
    }
  }
  @media (max-width: 600px) {
    body {
      padding-left: max(8px, env(safe-area-inset-left));
      padding-right: max(8px, env(safe-area-inset-right));
    }
    .card { padding: 14px; margin: 10px 0; }
    .choiceInner { padding: 12px 14px; }
    .builderCanvas { min-height: 360px; }
    .builderHeader h2 { font-size: 1.1rem; }
  }
  @media (prefers-reduced-motion: reduce) {
    #caq-app-splash img { animation: none; }
    #caq-app-splash { transition-duration: 1ms; }
    .questWorldMap .questWorldStage { scroll-behavior: auto; }
  }
</style>
`;

const splashMarkup = String.raw`
<div id="caq-app-splash" role="status" aria-label="Loading Cloud Architect Quest">
  <img src="./assets/architect-blueprint.png" alt="">
</div>
<script id="caq-mobile-controller">
(() => {
  const splash = document.getElementById('caq-app-splash');
  const started = performance.now();
  let splashHidden = false;

  function hideSplash() {
    if (splashHidden || !splash) return;
    splashHidden = true;
    const delay = Math.max(0, 850 - (performance.now() - started));
    window.setTimeout(() => {
      splash.classList.add('caq-splash-hidden');
      window.setTimeout(() => splash.remove(), 500);
    }, delay);
  }

  const mapX = [5, 11.5, 22, 32, 42, 52, 62, 72, 82, 93];
  const mapY = [58, 35, 58, 30, 56, 26, 44, 72, 22, 63];

  function enhanceWorldMap(stage) {
    if (!stage || stage.dataset.caqScrollableMap === '1') return;
    const realms = Array.from(stage.querySelectorAll(':scope > .floatingRealm'));
    const svg = stage.querySelector(':scope > .questWorldSvg');
    if (!svg || realms.length !== mapX.length) return;

    stage.dataset.caqScrollableMap = '1';
    stage.tabIndex = 0;
    stage.setAttribute('role', 'region');
    stage.setAttribute('aria-label', 'Adventure world map. Scroll horizontally to explore all islands.');

    const track = document.createElement('div');
    track.className = 'questWorldTrack';
    stage.insertBefore(track, stage.firstChild);
    track.appendChild(svg);
    realms.forEach((realm, index) => {
      realm.style.left = 'calc(' + mapX[index] + '% - 105px)';
      track.appendChild(realm);
    });

    const routes = Array.from(svg.querySelectorAll('.questRoutePath'));
    routes.forEach((route, index) => {
      if (index >= mapX.length - 1) return;
      const middleX = (mapX[index] + mapX[index + 1]) / 2;
      const middleY = (mapY[index] + mapY[index + 1]) / 2 + (index % 2 === 0 ? -7 : 8);
      route.setAttribute(
        'd',
        'M ' + mapX[index] + ',' + mapY[index] + ' Q ' + middleX + ',' + middleY + ' ' + mapX[index + 1] + ',' + mapY[index + 1],
      );
    });

    stage.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      stage.scrollBy({ left: event.key === 'ArrowLeft' ? -280 : 280, behavior: 'smooth' });
    });

    requestAnimationFrame(() => { stage.scrollLeft = 0; });
  }

  function enhanceRenderedMaps(root = document) {
    root.querySelectorAll?.('.questWorldMap .questWorldStage').forEach(enhanceWorldMap);
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        if (node.matches?.('.questWorldStage')) enhanceWorldMap(node);
        enhanceRenderedMaps(node);
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  enhanceRenderedMaps();

  window.addEventListener('load', () => {
    enhanceRenderedMaps();
    hideSplash();
  }, { once: true });
  window.setTimeout(hideSplash, 6000);
})();
</script>
`;

html = html.replace(/<\/head>/i, `${mobileStyles}</head>`);
html = html.replace(/<body([^>]*)>/i, `<body$1>${splashMarkup}`);

if (!html.includes('id="caq-app-splash"') || !html.includes('className = \'questWorldTrack\'')) {
  throw new Error('Could not inject the mobile application shell.');
}

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputAssets, { recursive: true });
await Promise.all([
  fs.writeFile(path.join(outputDir, 'index.html'), html, 'utf8'),
  fs.writeFile(path.join(outputAssets, 'architect-blueprint.png'), splashImage),
]);

console.log(`Built Cloud Architect Quest (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(1)} MB)`);
