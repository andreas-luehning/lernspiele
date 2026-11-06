// Prüft die Zahlenerkennung mit gezeichneten Strichen: deutsche 1 mit Anstrich, 7 mit und ohne Querstrich,
// alle Ziffern 0–9 und zweistellige Zahlen, jeweils in mehreren Größen, Seitenverhältnissen und leicht verwackelt.
// Aufruf: python3 -m http.server 8123 (im Projektordner), dann: node tests/ziffern-browser.js
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8123/';

const EINS = {
  'senkrecht': [[[.5, 0], [.5, 1]]],
  'kurzer Anstrich': [[[.3, .2], [.55, 0], [.55, 1]]],
  'mittlerer Anstrich': [[[.2, .35], [.6, 0], [.6, 1]]],
  'langer Anstrich': [[[.05, .5], [.6, 0], [.6, 1]]],
  'flacher Anstrich': [[[0, .3], [.6, 0], [.62, 1]]],
  'schräg': [[[.15, .4], [.65, 0], [.5, 1]]],
  'zwei Striche': [[[.15, .4], [.6, 0]], [[.6, 0], [.6, 1]]],
  'mit Fuß': [[[.2, .35], [.6, 0], [.6, 1]], [[.3, 1], [.9, 1]]],
};
const SIEBEN = {
  'Balken': [[[.05, 0], [.95, 0], [.4, 1]]],
  'Querstrich': [[[.05, 0], [.95, 0], [.4, 1]], [[.35, .5], [.85, .5]]],
  'kurzer Balken': [[[.35, 0], [.85, 0], [.45, 1]]],
  'gerade runter': [[[.1, 0], [.8, 0], [.7, 1]]],
  'Querstrich, kurzer Balken': [[[.35, 0], [.85, 0], [.45, 1]], [[.4, .5], [.8, .5]]],
};
const ZIFFERN = {
  0: [[[.5, 0], [.15, .2], [.1, .5], [.15, .8], [.5, 1], [.85, .8], [.9, .5], [.85, .2], [.5, 0]]],
  2: [[[.1, .25], [.3, .02], [.7, .02], [.88, .25], [.8, .5], [.1, 1], [.95, 1]]],
  3: [[[.1, .1], [.5, 0], [.85, .15], [.85, .35], [.45, .5], [.9, .65], [.9, .88], [.5, 1], [.1, .9]]],
  4: [[[.6, 0], [.08, .65], [.92, .65]], [[.65, .3], [.65, 1]]],
  5: [[[.85, 0], [.2, 0], [.15, .45], [.55, .38], [.88, .6], [.85, .88], [.5, 1], [.12, .9]]],
  6: [[[.75, 0], [.3, .3], [.12, .7], [.3, .98], [.7, .98], [.85, .72], [.6, .5], [.2, .65]]],
  8: [[[.5, .5], [.15, .3], [.25, .05], [.75, .05], [.85, .3], [.5, .5], [.12, .72], [.25, .97], [.75, .97], [.88, .72], [.5, .5]]],
  9: [[[.85, .3], [.65, .05], [.3, .05], [.15, .3], [.35, .5], [.8, .4], [.85, .3], [.75, 1]]],
};
const GROESSEN = [[60, 100], [45, 110], [80, 90], [70, 70]];

// Wiederholbares Wackeln
let seed = 7; const zufall = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5);
function striche(form, ox, oy, sx, sy, wackel) {
  return form.map(s => {
    const pts = [];
    for (let i = 0; i < s.length - 1; i++) for (let t = 0; t < 8; t++) {
      const a = s[i], c = s[i + 1];
      pts.push({ x: ox + (a[0] + (c[0] - a[0]) * t / 8) * sx + zufall() * wackel, y: oy + (a[1] + (c[1] - a[1]) * t / 8) * sy + zufall() * wackel });
    }
    const l = s[s.length - 1]; pts.push({ x: ox + l[0] * sx, y: oy + l[1] * sy });
    return pts;
  });
}

(async () => {
  const b = await chromium.launch(); const page = await b.newPage();
  await page.goto(BASE + 'zehnerweg/'); await page.waitForTimeout(500);
  const lies = strokes => page.evaluate(async s => {
    const m = await import('/gemeinsam/ziffern.js'); await m.ladeModell();
    const r = m.leseZahl(s, 220, 170); return r ? r.value : null;
  }, strokes);
  let gesamt = 0, richtig = 0; const falsch = [];
  const pruefe = async (name, soll, formen) => {
    for (const [sx, sy] of GROESSEN) for (const w of [0, 3]) {
      const s = []; let x = 40;
      for (const f of formen) { s.push(...striche(f, x, 30, sx, sy, w)); x += sx + 25; }
      const ist = await lies(s); gesamt++;
      if (ist === soll) richtig++; else falsch.push(`${name} ${sx}×${sy}${w ? ' verwackelt' : ''}: ${ist}`);
    }
  };
  for (const [n, f] of Object.entries(EINS)) await pruefe('1 ' + n, 1, [f]);
  for (const [n, f] of Object.entries(SIEBEN)) await pruefe('7 ' + n, 7, [f]);
  for (const [z, f] of Object.entries(ZIFFERN)) await pruefe(String(z), +z, [f]);
  await pruefe('11 (lange Anstriche)', 11, [EINS['langer Anstrich'], EINS['mittlerer Anstrich']]);
  await pruefe('17', 17, [EINS['mittlerer Anstrich'], SIEBEN['Balken']]);
  await pruefe('14', 14, [EINS['schräg'], ZIFFERN[4]]);
  await pruefe('19', 19, [EINS['flacher Anstrich'], ZIFFERN[9]]);
  await b.close();
  for (const f of falsch) console.log('FALSCH ' + f);
  const quote = richtig / gesamt;
  console.log(`${richtig} von ${gesamt} richtig erkannt (${Math.round(quote * 100)} %)`);
  // Grenze: Die gezeichneten Formen sind absichtlich schwierig; Ziel ist, dass fast alles klappt.
  const ok = quote >= 0.95 && !falsch.some(f => /^1 /.test(f) && / 7$/.test(f));
  console.log(ok ? 'ALLES OK' : 'FEHLER: zu viele Fehler oder eine 1 als 7 gelesen');
  process.exit(ok ? 0 : 1);
})();
