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
  html, body {
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-text-size-adjust: 100%;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: auto;
  }
  body {
    min-height: 100dvh;
    height: auto;
    overflow-x: hidden;
    overflow-y: auto;
    padding-top: max(12px, env(safe-area-inset-top));
    padding-right: max(12px, env(safe-area-inset-right));
    padding-bottom: max(12px, env(safe-area-inset-bottom));
    padding-left: max(12px, env(safe-area-inset-left));
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
    margin: 0;
    font-size: 16px;
    line-height: 1.4;
  }
  /* Don't force SVGs to shrink — target raster media only. */
  img, canvas, video { max-width: 100%; height: auto; }
  svg { max-width: none !important; height: auto !important; }
  button, select, input, textarea, [role="button"] {
    min-height: 44px;
    font: inherit;
  }
  table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
  }
  td, th {
    word-break: break-word;
    white-space: normal;
  }
  .card, .serviceInfoPanel, .builderSide, .builderScorePanel, .builderTray, .builderCanvas, .choice, .cardChoice, .topbar, .grid {
    max-width: 100%;
    width: 100%;
    overflow-wrap: anywhere;
  }
  body, html, #root, #app, main {
    overflow-y: auto !important;
    overflow-x: hidden !important;
    height: auto !important;
    min-height: 100% !important;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: auto;
  }
  .questWorldStage, .questAreaBoard, .questWorldBoard, .questPane, .questPanel, .mapPanel, .mapViewport, .adventure-map {
    overflow-x: auto !important;
    overflow-y: hidden !important;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-x;
    max-width: 100%;
    min-width: 0;
  }
  /* Make the stage container horizontally scrollable while keeping the
     outer panel constrained to the app width so it doesn't overflow the page. */
  .questWorldStage, .questAreaBoard {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch;
  }

  .questWorldMap, .questAreaShell {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    overflow: visible;
  }

  /* Keep the underlying SVG/map wider than the panel so users can pan horizontally,
     but don't let the outer panel itself expand beyond the app container. */
  .questWorldSvg, .questAreaSvg {
    width: 1400px !important;
    min-width: 1400px !important;
    max-width: none !important;
    height: auto !important;
    display: block;
  }

  /* Strong overrides to prevent global svg/img rules from shrinking the map
     and ensure the scroll container preserves the SVG's natural width. */
  .questWorldStage, .questAreaBoard, .mapViewport, .adventure-map {
    display: block !important;
  }
  .questWorldStage svg, .questAreaBoard svg, .mapViewport svg, .adventure-map svg {
    max-width: none !important;
    width: auto !important;
    min-width: 1200px !important;
    height: auto !important;
    display: inline-block !important;
  }
  .questWorldStage > .questWorldSvg, .questAreaBoard > .questAreaSvg {
    display: inline-block !important;
  }

  /* Reduce floating island visuals so they fit inside the visible panel. */
  .floatingRealm {
    width: 140px !important;
    transform: scale(0.65) !important;
    transform-origin: center bottom;
  }
  .floatingRealm:hover {
    transform: scale(0.7) !important;
  }
  .floatingRealm.current {
    animation: none !important;
  }
  /* TEMPORARY EMERGENCY FIX: force islands to participate in normal flow
     (removes transforms/absolute positioning applied by game) so we can
     verify layout. Remove once upstream code responsible for collapsing is fixed. */
  .floatingRealm, .floatingRealm * {
    position: static !important;
    transform: none !important;
    left: auto !important;
    top: auto !important;
    margin: 0 !important;
    display: inline-block !important;
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
    .questWorldStage, .questAreaBoard, .questWorldBoard, .questPane, .questPanel, .mapPanel, .mapViewport, .adventure-map {
      overflow-x: auto !important;
      overflow-y: hidden !important;
      max-height: min(72vh, 760px);
      min-height: 320px;
    }
    .builderTray { grid-column: auto !important; grid-template-columns: 1fr; }
    .builderCanvas { min-height: 420px; }
    .builderHeader { flex-direction: column; align-items: flex-start; gap: 8px; padding: 14px; }
    .builderSide, .builderScorePanel, .builderTray { padding: 12px; }
    .serviceToken { width: min(100%, 112px); min-height: 72px; font-size: 0.73rem; }
    .trayCards { flex-wrap: wrap; }
    .grid { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 600px) {
    body { padding-left: max(8px, env(safe-area-inset-left)); padding-right: max(8px, env(safe-area-inset-right)); }
    .card { padding: 14px; margin: 10px 0; }
    .choiceInner { padding: 12px 14px; }
    .builderCanvas { min-height: 360px; }
    .builderHeader h2 { font-size: 1.1rem; }
  }
  @media (prefers-reduced-motion: reduce) {
    #caq-app-splash img { animation: none; }
    #caq-app-splash { transition-duration: 1ms; }
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
<script id="caq-scroll-controller">
(() => {
  const applyScrollFix = () => {
    const candidates = [document.documentElement, document.body, ...document.querySelectorAll('body *')];
    for (const el of candidates) {
      const style = el.style;
      if (el === document.documentElement || el === document.body) {
        style.overflowX = 'hidden';
        style.overflowY = 'auto';
        style.minHeight = '100%';
        style.height = 'auto';
      }
      const computed = window.getComputedStyle(el);
      if (['hidden', 'clip'].includes(computed.overflow) || ['hidden', 'clip'].includes(computed.overflowY) || ['hidden', 'clip'].includes(computed.overflowX)) {
        style.overflowX = 'hidden';
        style.overflowY = 'auto';
        style.maxHeight = 'none';
        style.height = 'auto';
      }
      style.touchAction = 'pan-y';
    }
  };
  applyScrollFix();
  window.addEventListener('load', applyScrollFix, { once: true });
  window.addEventListener('resize', applyScrollFix);
})();
</script>
<script id="caq-map-init">
(() => {
  function setMapStart() {
    const wrap = document.querySelector('.questWorldStage, .questAreaBoard, .mapViewport, .adventure-map');
    if (!wrap) return;
    try {
      if (wrap.dataset.caqInitialSet) return;
      // Prefer scrolling to the leftmost island if present
      const island = wrap.querySelector('.floatingRealm');
      let left = 0;
      if (island && typeof island.offsetLeft === 'number') {
        left = Math.max(0, island.offsetLeft - 12);
      }
      wrap.scrollLeft = left;
      wrap.dataset.caqInitialSet = '1';
    } catch (e) {
      // silent
    }
  }
  window.addEventListener('load', () => setTimeout(setMapStart, 120), { once: true });
  document.addEventListener('DOMContentLoaded', () => setTimeout(setMapStart, 120));
  setTimeout(setMapStart, 600);
})();
</script>
<script id="caq-map-pan">
(() => {
  const containerSelector = '.questWorldStage, .questAreaBoard, .mapViewport, .adventure-map';
  function enablePan(el) {
    if (!el) return;
    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    function onPointerDown(e) {
      isDown = true;
      startX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
      startScroll = el.scrollLeft;
      el.classList.add('caq-dragging');
      if (e.pointerId) (e.target).setPointerCapture?.(e.pointerId);
      e.preventDefault?.();
    }
    function onPointerMove(e) {
      if (!isDown) return;
      const x = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
      const dx = x - startX;
      el.scrollLeft = startScroll - dx;
    }
    function onPointerUp(e) {
      isDown = false;
      el.classList.remove('caq-dragging');
      try { if (e.pointerId) (e.target).releasePointerCapture?.(e.pointerId); } catch (err) {}
    }
    el.addEventListener('pointerdown', onPointerDown, { passive: false });
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    // touch fallback
    el.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
  }
  function init() {
    const wrap = document.querySelector(containerSelector);
    if (!wrap) return;
    enablePan(wrap);
  }
  window.addEventListener('load', init, { once: true });
  document.addEventListener('DOMContentLoaded', init);
  setTimeout(init, 200);
})();
</script>
<script id="caq-map-fix">
(() => {
  function distributeIfBunched() {
    const wrap = document.querySelector('.questWorldStage, .questAreaBoard, .mapViewport, .adventure-map');
    if (!wrap) return;
    const islands = Array.from(wrap.querySelectorAll('.floatingRealm'));
    if (islands.length < 2) return;
    // detect bunched: many islands with left positions within 40px of first
    const rects = islands.map(el => el.getBoundingClientRect());
    const firstLeft = rects[0]?.left || 0;
    const bunched = rects.filter(r => Math.abs(r.left - firstLeft) < 60).length > 1;
    if (!bunched) return;
    // make container relative so absolute positioning works
    wrap.style.position = wrap.style.position || 'relative';
    const totalWidth = Math.max(wrap.scrollWidth || 1200, 1200);
    const spacing = Math.max(160, Math.floor(totalWidth / islands.length));
    islands.forEach((el, i) => {
      el.style.position = 'absolute';
      el.style.left = (i * spacing) + 'px';
      el.style.top = (12 + (i % 3) * 6) + 'px';
      el.style.margin = '0';
      el.style.transform = el.style.transform || 'scale(0.65)';
      el.style.zIndex = 10 + i;
      el.style.transition = 'left 350ms ease';
      el.style.outline = '1px solid rgba(255,255,255,0.06)';
    });
  }
  window.addEventListener('load', () => setTimeout(distributeIfBunched, 120));
  document.addEventListener('DOMContentLoaded', () => setTimeout(distributeIfBunched, 120));
  setTimeout(distributeIfBunched, 800);
})();
</script>
<script id="caq-map-debug">
(() => {
  function debugMap() {
    const wrap = document.querySelector('.questWorldStage, .questAreaBoard, .mapViewport, .adventure-map');
    if (!wrap) return;
    const islands = Array.from(wrap.querySelectorAll('.floatingRealm'));
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.right = '8px';
    overlay.style.top = '8px';
    overlay.style.zIndex = 9999999;
    overlay.style.maxWidth = '40vw';
    overlay.style.maxHeight = '60vh';
    overlay.style.overflow = 'auto';
    overlay.style.background = 'rgba(2,6,23,0.85)';
    overlay.style.color = '#9be8ff';
    overlay.style.fontSize = '12px';
    overlay.style.padding = '8px';
    overlay.style.border = '1px solid rgba(155,232,255,0.08)';
    overlay.id = 'caq-debug-overlay';
    const list = document.createElement('div');
    overlay.appendChild(list);
    document.body.appendChild(overlay);
    islands.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      const info = document.createElement('div');
      info.textContent = '#' + i + ' left:' + Math.round(r.left) + ' top:' + Math.round(r.top) + ' w:' + Math.round(r.width) + ' h:' + Math.round(r.height) + ' transform:' + style.transform;
      info.style.padding = '4px 0';
      list.appendChild(info);
      // draw ruler
      const box = document.createElement('div');
      box.style.position = 'absolute';
      box.style.left = (r.left + window.scrollX) + 'px';
      box.style.top = (r.top + window.scrollY) + 'px';
      box.style.width = r.width + 'px';
      box.style.height = r.height + 'px';
      box.style.border = '2px dashed rgba(255,200,100,0.6)';
      box.style.zIndex = 9999998;
      box.style.pointerEvents = 'none';
      box.className = 'caq-debug-box';
      document.body.appendChild(box);
    });
    console.log('caq-debug: islands', islands.length);
  }
  window.addEventListener('load', () => setTimeout(debugMap, 150), { once: true });
  document.addEventListener('DOMContentLoaded', () => setTimeout(debugMap, 150));
  setTimeout(debugMap, 900);
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
