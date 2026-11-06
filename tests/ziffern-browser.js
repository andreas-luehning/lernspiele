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
  // krummer, wie Kinder schreiben
  'Anstrich fast waagerecht': [[[0, .12], [.6, 0], [.6, 1]]],
  'Anstrich mit Haken': [[[.1, .45], [.05, .38], [.55, 0], [.58, 1]]],
  'gebogener Stamm': [[[.15, .35], [.6, 0], [.68, .5], [.6, 1]]],
  'Stamm nach links': [[[.2, .3], [.7, 0], [.4, 1]]],
};
// 7 mit Querstrich (so wird es in Deutschland gelernt)
const SIEBEN = {
  'Querstrich': [[[.05, 0], [.95, 0], [.4, 1]], [[.35, .5], [.85, .5]]],
  'Querstrich, kurzer Balken': [[[.35, 0], [.85, 0], [.45, 1]], [[.4, .5], [.8, .5]]],
  'Querstrich schief': [[[.05, 0], [.95, 0], [.4, 1]], [[.3, .58], [.85, .45]]],
  'Querstrich kurz': [[[.1, 0], [.9, 0], [.45, 1]], [[.5, .5], [.75, .5]]],
  'Querstrich gerade runter': [[[.1, 0], [.8, 0], [.7, 1]], [[.5, .5], [.95, .5]]],
};
// 7 ohne Querstrich: mit der Regel eine 1, ohne die Regel eine 7
const SIEBEN_OHNE = {
  'Balken': [[[.05, 0], [.95, 0], [.4, 1]]],
  'kurzer Balken': [[[.35, 0], [.85, 0], [.45, 1]]],
  'gerade runter': [[[.1, 0], [.8, 0], [.7, 1]]],
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
  const regel = an => page.evaluate(an => localStorage.setItem('lernspiele:erkennung', JSON.stringify({ version: 1, siebenMitQuerstrich: an })), an);
  let gesamt = 0, richtig = 0; const falsch = [];
  const pruefe = async (name, soll, formen) => {
    for (const [sx, sy] of GROESSEN) for (const w of [0, 3]) {
      const s = []; let x = 40;
      for (const f of formen) { s.push(...striche(f, x, 30, sx, sy, w)); x += sx + 25; }
      const ist = await lies(s); gesamt++;
      if (ist === soll) richtig++; else falsch.push(`${name} ${sx}×${sy}${w ? ' verwackelt' : ''}: ${ist}`);
    }
  };
  // A: Regel „7 nur mit Querstrich“ (Standard)
  await regel(true);
  for (const [n, f] of Object.entries(EINS)) await pruefe('1 ' + n, 1, [f]);
  for (const [n, f] of Object.entries(SIEBEN)) await pruefe('7 ' + n, 7, [f]);
  for (const [n, f] of Object.entries(SIEBEN_OHNE)) await pruefe('7 ohne Querstrich ' + n + ' → 1', 1, [f]);
  for (const [z, f] of Object.entries(ZIFFERN)) await pruefe(String(z), +z, [f]);
  await pruefe('11 (lange Anstriche)', 11, [EINS['langer Anstrich'], EINS['mittlerer Anstrich']]);
  await pruefe('17', 17, [EINS['mittlerer Anstrich'], SIEBEN['Querstrich']]);
  await pruefe('14', 14, [EINS['schräg'], ZIFFERN[4]]);
  await pruefe('19', 19, [EINS['flacher Anstrich'], ZIFFERN[9]]);
  await pruefe('11 (krumm)', 11, [EINS['Anstrich fast waagerecht'], EINS['Stamm nach links']]);
  const hinweis = await page.evaluate(async s => { const m = await import('/gemeinsam/ziffern.js'); return m.leseZahl(s, 220, 170).hinweis; }, striche(SIEBEN_OHNE['Balken'], 40, 30, 60, 100, 0));
  gesamt++; if (hinweis === 'siebenOhneQuerstrich') richtig++; else falsch.push('Hinweis bei 7 ohne Querstrich fehlt: ' + hinweis);
  // Gekritzel: keine Zahl 0–20 (auch dick nachgezogen) gilt als Bild, Ausmalen und viele Striche schon
  const ALLE = { 0: ZIFFERN[0], 1: EINS['mittlerer Anstrich'], 2: ZIFFERN[2], 3: ZIFFERN[3], 4: ZIFFERN[4], 5: ZIFFERN[5], 6: ZIFFERN[6], 7: SIEBEN['Querstrich'], 8: ZIFFERN[8], 9: ZIFFERN[9] };
  const kritzel = s => page.evaluate(async s => (await import('/gemeinsam/ziffern.js')).istGekritzel(s, 220, 170), s);
  for (let z = 0; z <= 20; z++) {
    const f = String(z).split('').map(d => ALLE[d]); const breit = f.length === 1 ? 150 : 85;
    const s = []; let x = 10; for (const g of f) { s.push(...striche(g, x, 10, breit, 150, 2)); x += breit + 12; }
    gesamt++; if (!(await kritzel([...s, ...s]))) richtig++; else falsch.push(`Zahl ${z} (nachgezogen) als Gekritzel`);
  }
  const zickzack = [Array.from({ length: 30 }, (_, i) => ({ x: 10 + (i % 2) * 200, y: 10 + i * 5 }))];
  const vieleStriche = Array.from({ length: 10 }, (_, k) => [{ x: 15 + k * 20, y: 60 }, { x: 20 + k * 20, y: 110 }]);
  const dreiZahlen = [...striche(ALLE[1], 10, 30, 50, 100, 0), ...striche(ALLE[2], 80, 30, 50, 100, 0), ...striche(ALLE[3], 150, 30, 50, 100, 0)];
  for (const [n, s] of Object.entries({ Ausmalen: zickzack, 'viele Striche': vieleStriche, 'drei Zahlen': dreiZahlen })) {
    gesamt++; if (await kritzel(s)) richtig++; else falsch.push(`${n} nicht als Gekritzel erkannt`);
  }

  // B: Regel aus – dann zählt auch die 7 ohne Querstrich
  await regel(false);
  for (const [n, f] of Object.entries(SIEBEN_OHNE)) await pruefe('Regel aus: 7 ' + n, 7, [f]);
  for (const n of ['senkrecht', 'kurzer Anstrich', 'mittlerer Anstrich', 'langer Anstrich']) await pruefe('Regel aus: 1 ' + n, 1, [EINS[n]]);
  await regel(true);
  await b.close();
  for (const f of falsch) console.log('FALSCH ' + f);
  const quote = richtig / gesamt;
  console.log(`${richtig} von ${gesamt} richtig erkannt (${Math.round(quote * 100)} %)`);
  // Grenze: Die gezeichneten Formen sind absichtlich schwierig; Ziel ist, dass fast alles klappt.
  // Mit der Regel darf keine 1 als 7 gelesen werden
  const ok = quote >= 0.95 && !falsch.some(f => /^1 /.test(f) && / 7$/.test(f));
  console.log(ok ? 'ALLES OK' : 'FEHLER: zu viele Fehler oder eine 1 als 7 gelesen');
  process.exit(ok ? 0 : 1);
})();
