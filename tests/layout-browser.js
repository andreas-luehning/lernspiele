// Prüft viele Tablet-Größen (quer und hoch): Nichts im Zehnerweg darf sich überlappen oder aus dem Bild ragen.
// Aufruf: python3 -m http.server 8123 (im Projektordner), dann: node tests/layout-browser.js
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8123/';
(async () => { const b = await chromium.launch(); const ctx = await b.newContext(); const p = await ctx.newPage();
  const groessen = [];
  for (const w of [1024, 1112, 1180, 1194, 1280, 1366]) for (const h of [600, 680, 740, 768, 800, 834, 900]) if (w > h) groessen.push([w, h]);
  for (const [w, h] of [[768, 1024], [800, 1280], [820, 1180], [834, 1194], [744, 1133], [810, 1080], [600, 960], [800, 1100]]) groessen.push([w, h]);
  const schlecht = [];
  for (const [w, h] of groessen) {
    await p.setViewportSize({ width: w, height: h }); await p.goto(BASE + 'zehnerweg/'); await p.waitForTimeout(450);
    const r = await p.evaluate(() => {
      const sel = ['#b-zurueck', '.brand', '#eq', '.seg', '#uhr', '#leaves', '#b-garten', '#b-flip', '[data-thema-knopf]', '#b-info', '#hint', '#b-clear', '#b-check', '#b-next', '#track', '#stage'];
      const box = sel.map(s => [s, document.querySelector(s)?.getBoundingClientRect()]).filter(([, r]) => r && r.width);
      const ue = [];
      for (let i = 0; i < box.length; i++) for (let j = i + 1; j < box.length; j++) { const [a, A] = box[i], [c, C] = box[j]; const x = Math.min(A.right, C.right) - Math.max(A.left, C.left), y = Math.min(A.bottom, C.bottom) - Math.max(A.top, C.top); if (x > 2 && y > 2) ue.push(a + '×' + c); }
      const raus = box.filter(([, r]) => r.bottom > innerHeight + 1 || r.right > innerWidth + 1).map(([s]) => s);
      return { side: document.querySelector('.app').classList.contains('side'), ue, raus };
    });
    if (r.ue.length || r.raus.length) { schlecht.push(`${w}×${h} ${r.side ? 'Seitenleiste' : 'oben/unten'}: überlappt ${r.ue.join(', ') || '-'} | ragt raus ${r.raus.join(', ') || '-'}`); }
  }
  console.log(schlecht.length ? schlecht.join('\n') : 'keine Überlappung'); console.log(groessen.length, 'Größen geprüft');
  await b.close();
  console.log(schlecht.length ? `${schlecht.length} FEHLER` : 'ALLES OK'); process.exit(schlecht.length ? 1 : 0); })();
