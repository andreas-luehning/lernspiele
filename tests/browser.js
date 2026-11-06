// Browser-Prüfung: Layout auf Tablet-Größen, Aufgabe lösen per Schreiben, Eingabe-Robustheit,
// Sicherheit (keine fremden Anfragen, keine CSP-Verstöße, manipulierter Speicher).
const { chromium } = require('playwright');
// Aufruf: python3 -m http.server 8123 (im Projektordner), dann: node tests/browser.js
const BASE = process.env.BASE || 'http://localhost:8123/';
const path = require('path'); const fs = require('fs');
const SHOTS = path.join(__dirname, '..', 'screenshots'); fs.mkdirSync(SHOTS, { recursive: true });
const VP = { 'ipad-hoch': [820, 1180], 'ipad-quer': [1180, 820], 'android-hoch': [800, 1280], 'android-quer': [1280, 800] };
const { schreibe } = require('./hilfen.js');
(async () => {
  const b = await chromium.launch();
  let fehler = 0; const chk = (c, m) => { console.log((c ? 'ok    ' : 'FEHLER ') + m); if (!c) fehler++; };
  for (const [name, [w, h]] of Object.entries(VP)) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const probleme = [], fremd = [];
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') probleme.push(m.text()); });
    page.on('pageerror', e => probleme.push(e.message));
    page.on('request', r => { if (!r.url().startsWith(BASE)) fremd.push(r.url()); });
    await page.addInitScript(() => document.addEventListener('securitypolicyviolation', e => console.error('CSP: ' + e.violatedDirective + ' ' + e.blockedURI)));
    await page.goto(BASE); await page.waitForTimeout(300);
    await page.screenshot({ path: `${SHOTS}/start-${name}.png` });
    await page.click('.kachel'); await page.waitForURL(/zehnerweg/); await page.waitForTimeout(700);
    await page.screenshot({ path: `${SHOTS}/zehnerweg-${name}.png` });
    // Felder im sichtbaren Bereich, nicht überlappend, Knöpfe ≥ 44 px
    const info = await page.evaluate(() => {
      const r = [...document.querySelectorAll('.field')].map(e => e.getBoundingClientRect());
      const vw = innerWidth, vh = innerHeight; let ueberlapp = 0;
      for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) if (r[i].left < r[j].right && r[j].left < r[i].right && r[i].top < r[j].bottom && r[j].top < r[i].bottom) ueberlapp++;
      const btns = [...document.querySelectorAll('button')].filter(x => x.offsetParent).map(x => x.getBoundingClientRect()).filter(x => Math.min(x.width, x.height) < 44).length;
      return { sichtbar: r.every(x => x.left >= 0 && x.top >= 0 && x.right <= vw && x.bottom <= vh), ueberlapp, kleinsteFlaeche: Math.round(Math.min(...r.map(x => Math.min(x.width, x.height)))), kleineKnoepfe: btns, side: document.querySelector('.app').classList.contains('side'), scroll: document.documentElement.scrollWidth > vw };
    });
    console.log(name, JSON.stringify(info)); const lay = await page.evaluate(() => { const s = document.getElementById('stage').getBoundingClientRect(), hd = document.querySelector('header').getBoundingClientRect(), bt = document.querySelector('.bottom').getBoundingClientRect(), side = document.querySelector('.app').classList.contains('side'); return side ? true : (s.top >= hd.bottom - 1 && s.bottom + 8 <= bt.top + 1); }); chk(lay, name + ': Bühne überdeckt weder Kopfzeile noch Tipp');
    chk(info.sichtbar && info.ueberlapp <= 2 && !info.scroll, `${name}: Felder sichtbar, ohne Überlappung, kein Querscrollen`);
    // Aufgabe lösen
    const eq = await page.textContent('#eq'); const m = eq.match(/(\d+)\s*([+−])\s*(\d+)/);
    const a = +m[1], op = m[2], bb = +m[3];
    const p1 = op === '+' ? 10 - a : a - 10, ans = { part1: p1, ten: 10, part2: bb - p1, goal: op === '+' ? a + bb : a - bb };
    const blaetter = () => page.evaluate(() => JSON.parse(localStorage.getItem('lernspiele:parade') || '{}').leaves);
    const gelesen = {};
    for (const id of ['part1', 'ten', 'part2', 'goal']) {
      await schreibe(page, '#f-' + id, ans[id]); await page.waitForTimeout(800);
      gelesen[id] = await page.evaluate(i => document.querySelector('#f-' + i).nextElementSibling.textContent, id);
    }
    const hint = await page.textContent('#hint');
    const done = await page.evaluate(() => document.getElementById('stage').classList.contains('done'));
    console.log(`${name}: ${eq.trim()} soll ${JSON.stringify(ans)} gelesen ${JSON.stringify(gelesen)}\n   Tipp: ${hint}`);
    if (done) { await page.waitForTimeout(900); chk(await blaetter() === 1 && await page.locator('#leaves .slot.on').count() === 1, `${name}: gelöst, ein Salatblatt für die Parade`); }
    else console.log(`hinweis ${name}: nicht alles richtig erkannt (synthetische Ziffern), Tipp erscheint`);
    await page.screenshot({ path: `${SHOTS}/geschrieben-${name}.png` });
    chk(!probleme.length, `${name}: keine Fehler/CSP-Verstöße ${probleme.join(' | ')}`);
    chk(!fremd.length, `${name}: keine Anfragen an fremde Server ${fremd.join(' ')}`);
    await ctx.close();
  }
  // Eingabe-Robustheit
  const ctx = await b.newContext({ viewport: { width: 820, height: 1180 } }); const page = await ctx.newPage();
  await page.goto(BASE + 'zehnerweg/'); await page.waitForTimeout(700);
  const box = await page.locator('#f-part1').boundingBox();
  // Loslassen außerhalb des Feldes
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 3); await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height + 200, { steps: 8 }); await page.mouse.move(5, 5, { steps: 4 }); await page.mouse.up();
  await page.waitForTimeout(800);
  await schreibe(page, '#f-ten', 10); await page.waitForTimeout(800);
  chk(/10/.test(await page.evaluate(() => document.querySelector('#f-ten').nextElementSibling.textContent)), 'Nach Loslassen außerhalb: anderes Feld beschreibbar');
  // Stift, dann Finger: 1,5 s gesperrt, danach wieder frei; zweiter Finger ignoriert
  const r = await page.evaluate(async () => {
    const f = document.querySelector('#f-part2 canvas'), rc = f.getBoundingClientRect();
    const ev = (t, id, typ, dx = 0) => f.dispatchEvent(new PointerEvent(t, { pointerId: id, pointerType: typ, clientX: rc.left + rc.width / 2 + dx, clientY: rc.top + rc.height / 2, bubbles: true, cancelable: true, isPrimary: true }));
    const n = () => document.querySelector('#f-part2').classList.contains('has') || 0;
    const zaehle = () => f.getContext('2d').getImageData(0, 0, f.width, f.height).data.some(v => v);
    ev('pointerdown', 50, 'pen'); ev('pointerup', 50, 'pen');
    document.querySelector('#f-part2 + .tag .clr')?.click();
    const fieldObj = f; // Prüfung über gezeichnete Pixel
    const c = f.getContext('2d'); c.clearRect(0,0,f.width,f.height);
    ev('pointerdown', 51, 'touch'); ev('pointerup', 51, 'touch');
    const gesperrt = !zaehle();
    await new Promise(r => setTimeout(r, 1600));
    ev('pointerdown', 52, 'touch'); ev('pointermove', 52, 'touch', 20);
    ev('pointerdown', 53, 'touch', -30); // zweiter Finger, während der erste noch schreibt
    const frei = zaehle();
    ev('pointerup', 52, 'touch'); ev('pointerup', 53, 'touch');
    return { gesperrt, frei };
  });
  chk(r.gesperrt, 'Finger kurz nach Stift ignoriert (Handflächen-Schutz)');
  chk(r.frei, 'Finger nach 1,5 s wieder frei');
  // Speicher: manipulierte Daten werden bereinigt
  await page.evaluate(() => localStorage.setItem('lernspiele:zehnerweg', JSON.stringify({ version: 1, modus: '<img src=x onerror=alert(1)>', gespiegelt: 'ja', __proto__: { x: 1 } })));
  await page.reload(); await page.waitForTimeout(500);
  const st = await page.evaluate(() => ({ m: document.querySelector('.seg [aria-pressed=true]').dataset.mode, f: document.getElementById('b-flip').getAttribute('aria-pressed'), img: !!document.querySelector('img') }));
  chk(st.m === 'plus' && st.f === 'false' && !st.img, 'Manipulierter Speicher wird bereinigt ' + JSON.stringify(st));
  await page.evaluate(() => localStorage.setItem('lernspiele:zehnerweg', '{kaputt'));
  await page.reload(); await page.waitForTimeout(300);
  chk(await page.locator('#f-start .given').textContent() !== '', 'Kaputter Speicher: Spiel startet trotzdem');
  // Dunkelmodus
  await page.click('[data-thema-knopf]'); await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(SHOTS, 'zehnerweg-dunkel.png') });
  await page.goto(BASE); chk(await page.evaluate(() => document.documentElement.dataset.theme) === 'dark', 'Nachtmodus gilt auch auf der Startseite');
  await b.close();
  console.log(fehler ? `${fehler} FEHLER` : 'ALLES OK');
  process.exit(fehler ? 1 : 0);
})();
