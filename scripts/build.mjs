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

function replaceExactlyOnce(source, label, find, replacement) {
  const first = source.indexOf(find);
  if (first < 0) throw new Error(`Could not find ${label} in the imported game.`);
  if (source.indexOf(find, first + find.length) >= 0) {
    throw new Error(`Found more than one ${label}; refusing an ambiguous map rewrite.`);
  }
  return source.slice(0, first) + replacement + source.slice(first + find.length);
}

/* Rewrite the game's renderer itself. The map no longer depends on a post-render DOM controller. */
html = replaceExactlyOnce(
  html,
  'Adventure map positions',
  ` const mapPos=[
   {x:8,y:58},{x:21,y:35},{x:35,y:58},{x:47,y:30},{x:58,y:56},
   {x:68,y:26},{x:79,y:44},{x:71,y:72},{x:86,y:22},{x:90,y:63}
 ];`,
  ` const mapPos=[
   {x:105,y:390},{x:275,y:230},{x:545,y:390},{x:805,y:210},{x:1065,y:370},
   {x:1325,y:190},{x:1585,y:315},{x:1845,y:485},{x:2105,y:170},{x:2300,y:420}
 ];`,
);

html = replaceExactlyOnce(
  html,
  'Adventure realm positioning template',
  'style="left:calc(${p.x}% - 105px); top:calc(${p.y}% - 86px);"',
  'style="left:${p.x-105}px; top:${p.y-86}px;"',
);

html = replaceExactlyOnce(
  html,
  'Adventure map stage template',
  `   <div class="questWorldStage">
     <svg class="questWorldSvg" viewBox="0 0 100 100" preserveAspectRatio="none">\${paths}</svg>
     \${nodes}
   </div>`,
  `   <div class="questWorldStage" tabindex="0" role="region" aria-label="Adventure world map. Scroll horizontally to explore all islands." data-caq-map-build="0.5.0">
     <div class="questWorldTrack">
       <svg class="questWorldSvg" viewBox="0 0 2400 680" preserveAspectRatio="none">\${paths}</svg>
       \${nodes}
     </div>
   </div>`,
);

html = replaceExactlyOnce(
  html,
  'Adventure build badge insertion point',
  '         <span class="questPill">Goal: conquer each realm and reach Exam Summit</span>',
  `         <span class="questPill">Goal: conquer each realm and reach Exam Summit</span>
         <span class="questPill caqBuildBadge">Build 0.5.0</span>`,
);

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

  /* The outer stage is the viewport. Every map layer uses the same fixed-pixel inner canvas. */
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
    height: 682px;
    min-height: 682px !important;
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
    width: 2400px;
    min-width: 2400px;
    height: 680px;
    min-height: 680px;
  }
  .questWorldMap .questWorldTrack > .questWorldSvg {
    position: absolute !important;
    inset: 0 !important;
    display: block !important;
    width: 2400px !important;
    min-width: 0 !important;
    max-width: none !important;
    height: 680px !important;
    pointer-events: none;
  }
  .questWorldMap .questWorldTrack > .floatingRealm {
    position: absolute !important;
    width: 210px !important;
    transform: none !important;
    animation: none !important;
    filter: none !important;
    transform-origin: center 86px !important;
  }
  .questWorldMap .questWorldTrack > .floatingRealm.locked {
    transform: none !important;
    filter: none !important;
    opacity: 0.42 !important;
  }
  .questWorldMap .questWorldTrack .worldIslandSprite,
  .questWorldMap .questWorldTrack .floatingRealm:hover .worldIslandSprite,
  .questWorldMap .questWorldTrack .floatingRealm.current .worldIslandSprite,
  .questWorldMap .questWorldTrack .floatingRealm.locked .worldIslandSprite {
    width: 210px !important;
    height: 190px !important;
    margin: 0 auto -12px !important;
    transform: none !important;
    filter: none !important;
  }
  .questWorldMap .questWorldTrack .worldIslandSprite svg {
    width: 210px !important;
    height: 190px !important;
    overflow: visible !important;
  }
  /* Android WebView can drop these large inline SVGs when nested SVG/CSS filters are combined. */
  .questWorldMap .questWorldTrack .worldIslandSvgAsset [filter] {
    filter: none !important;
  }
  .questWorldMap .questWorldTrack .islandPlate,
  .questWorldMap .questWorldTrack .floatingRealm.locked .islandPlate {
    left: 50% !important;
    top: 2px !important;
    transform: translateX(-50%) !important;
    width: max-content;
    max-width: 190px;
    white-space: normal;
    line-height: 1.15;
  }
  .questWorldMap .questWorldTrack .realmCaption {
    width: 210px;
    margin-top: -6px !important;
    transform: none !important;
    transform-origin: top center;
  }
  .questWorldMap .questWorldTrack .questRoutePath {
    stroke-width: 10;
    stroke-dasharray: 26 18;
  }
  .questWorldMap .questWorldTrack .questRoutePath.active {
    stroke-width: 12;
    stroke-dasharray: 30 18;
  }
  .questWorldMap .caqBuildBadge {
    border-color: rgba(34, 211, 238, 0.65);
    color: #a5f3fc;
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
      height: 682px;
      min-height: 682px !important;
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
  const appBuild = '0.5.0';
  const splash = document.getElementById('caq-app-splash');
  const started = performance.now();
  let splashHidden = false;
  document.documentElement.dataset.caqBuild = appBuild;

  function hideSplash() {
    if (splashHidden || !splash) return;
    splashHidden = true;
    const delay = Math.max(0, 850 - (performance.now() - started));
    window.setTimeout(() => {
      splash.classList.add('caq-splash-hidden');
      window.setTimeout(() => splash.remove(), 500);
    }, delay);
  }

  window.addEventListener('load', () => {
    hideSplash();
  }, { once: true });
  window.setTimeout(hideSplash, 6000);
})();
</script>
`;

html = html.replace(/<\/head>/i, `${mobileStyles}</head>`);
html = html.replace(/<body([^>]*)>/i, `<body$1 data-caq-app-build="0.5.0">${splashMarkup}`);

if (!html.includes('id="caq-app-splash"') || !html.includes('class="questWorldTrack"') || !html.includes('data-caq-map-build="0.5.0"')) {
  throw new Error('Could not inject the mobile application shell.');
}

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputAssets, { recursive: true });
await Promise.all([
  fs.writeFile(path.join(outputDir, 'index.html'), html, 'utf8'),
  fs.writeFile(path.join(outputAssets, 'architect-blueprint.png'), splashImage),
]);

console.log(`Built Cloud Architect Quest (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(1)} MB)`);
