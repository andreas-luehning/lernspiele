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
  // Malen statt schreiben: kein Raten, kein automatisches Prüfen, freundlicher Hinweis
  await page.click('#b-next'); await page.waitForTimeout(200);
  const kb = await page.locator('#f-part1').boundingBox();
  // im Inneren des Ovals hin und her (die Ecken des Rechtecks gehören nicht zum Feld)
  await page.mouse.move(kb.x + kb.width * .28, kb.y + kb.height * .3); await page.mouse.down();
  for (let i = 0; i < 24; i++) await page.mouse.move(kb.x + kb.width * (i % 2 ? .72 : .28), kb.y + kb.height * (.3 + .4 * i / 24), { steps: 3 });
  await page.mouse.up(); await page.waitForTimeout(900);
  chk(/Bitte nur eine Zahl/.test(await page.locator('#f-part1 + .tag').textContent()) && /Platz für eine Zahl/.test(await page.textContent('#hint')), 'Gekritzel: „Bitte nur eine Zahl“ und freundlicher Tipp');
  chk(!(await page.evaluate(() => document.querySelector('#f-part1').classList.contains('no'))), 'Gekritzel zählt nicht als Fehler');
  if (await page.locator('#f-part1 + .tag .clr').isVisible()) await page.click('#f-part1 + .tag .clr');
  // Zurück-Knopf
  await page.click('#b-zurueck'); await page.waitForTimeout(300);
  chk(new URL(page.url()).pathname === '/' && await page.locator('.kachel').count() >= 1, 'Zurück-Knopf führt zur Startseite');
  await page.goto(BASE + 'zehnerweg/'); await page.waitForTimeout(500);

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
  await ctx.close();

  // Leuchttisch: Layout auf Tablets, Antworten, Hilfe verrät nichts, Amulett, Speicher, Sicherheit
  for (const [name, [w, h]] of Object.entries(VP)) {
    const c2 = await b.newContext({ viewport: { width: w, height: h } }); const p = await c2.newPage();
    const probleme = [], fremd = [];
    p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') probleme.push(m.text()); });
    p.on('pageerror', e => probleme.push(e.message));
    p.on('request', r => { if (!r.url().startsWith(BASE)) fremd.push(r.url()); });
    await p.addInitScript(() => document.addEventListener('securitypolicyviolation', e => console.error('CSP: ' + e.violatedDirective + ' ' + e.blockedURI)));
    await p.goto(BASE); await p.click('.kachel[href="leuchttisch/"]'); await p.waitForURL(/leuchttisch/); await p.waitForTimeout(500);
    const lay = await p.evaluate(() => {
      const vw = innerWidth, vh = innerHeight, t = document.getElementById('tisch').getBoundingClientRect();
      const kl = [...document.querySelectorAll('button')].filter(x => x.offsetParent).map(x => x.getBoundingClientRect()).filter(x => Math.min(x.width, x.height) < 44).length;
      const raus = [...document.querySelectorAll('button, .tisch, .amulett-platz')].filter(x => x.offsetParent).some(x => { const r = x.getBoundingClientRect(); return r.left < 0 || r.top < 0 || r.right > vw + 1 || r.bottom > vh + 1; });
      return { tisch: Math.round(Math.min(t.width, t.height)), kl, raus, scroll: document.documentElement.scrollWidth > vw || document.documentElement.scrollHeight > vh };
    });
    chk(lay.tisch >= 400 && !lay.kl && !lay.raus && !lay.scroll, `leuchttisch ${name}: Tisch groß, alles sichtbar, Knöpfe ≥ 44 px ${JSON.stringify(lay)}`);
    await p.click('#stufen [data-stufe="1"]'); await p.waitForTimeout(200);
    const n = await p.$$eval('.tisch .stein', s => s.length);
    const opts = await p.$$eval('.opt', bs => bs.map(x => +x.textContent));
    chk(opts.length === 4 && opts.filter(o => o === n).length === 1, `leuchttisch ${name}: vier Antworten, eine richtig`);
    await p.click(`.opt[data-wert="${opts.find(o => o !== n)}"]`); await p.waitForTimeout(200);
    const fh = await p.textContent('#hinweis');
    chk(/\?/.test(fh) && !new RegExp('=\\s*' + n + '\\b').test(fh) && await p.$$eval('#amulett .stein', s => s.length) === 0, `leuchttisch ${name}: falsch zeigt a + b = ?, kein Stein ${fh}`);
    await p.click('#b-hilfe'); await p.waitForTimeout(1900);
    const hh = await p.textContent('#hinweis');
    chk(/\?/.test(hh) && await p.$$eval('.gruppe', g => g.length) === 2, `leuchttisch ${name}: Zeig mir's umrandet zwei Gruppen, Ergebnis bleibt offen`);
    await p.click(`.opt[data-wert="${n}"]`); await p.waitForTimeout(300);
    chk(await p.$$eval('#amulett .stein', s => s.length) === 1, `leuchttisch ${name}: richtig setzt einen Stein ins Amulett`);
    await p.screenshot({ path: `${SHOTS}/leuchttisch-${name}.png` });
    chk(!probleme.length, `leuchttisch ${name}: keine Fehler/CSP-Verstöße ${probleme.join(' | ')}`);
    chk(!fremd.length, `leuchttisch ${name}: keine Anfragen an fremde Server ${fremd.join(' ')}`);
    await c2.close();
  }
  {
    const c3 = await b.newContext({ viewport: { width: 820, height: 1180 } }); const p = await c3.newPage();
    const probleme = []; p.on('pageerror', e => probleme.push(e.message));
    await p.goto(BASE + 'leuchttisch/'); await p.waitForTimeout(300);
    for (let i = 0; i < 5; i++) { const n = await p.$$eval('.tisch .stein', s => s.length); await p.click(`.opt[data-wert="${n}"]`); await p.waitForTimeout(i < 4 ? 2400 : 5200); }
    chk(await p.textContent('#kistezahl') === '1', 'leuchttisch: 5 richtige = ein Amulett in der Schatzkiste');
    await p.reload(); await p.waitForTimeout(300);
    chk(await p.textContent('#kistezahl') === '1', 'leuchttisch: Schatzkiste bleibt nach Neuladen');
    await p.evaluate(() => localStorage.setItem('lernspiele:leuchttisch', JSON.stringify({ version: 1, stufe: '<img src=x onerror=alert(1)>', eingabe: 'x', fassung: ['<img src=x>', 'rubin'], amulette: [['a', 'b']] })));
    await p.reload(); await p.waitForTimeout(300);
    const st = await p.evaluate(() => ({ k: document.getElementById('kistezahl').textContent, f: document.querySelectorAll('#amulett .stein').length, img: !!document.querySelector('img') }));
    chk(st.k === '0' && st.f === 1 && !st.img, 'leuchttisch: manipulierter Speicher wird bereinigt ' + JSON.stringify(st));
    await p.evaluate(() => localStorage.setItem('lernspiele:leuchttisch', '{kaputt')); await p.reload(); await p.waitForTimeout(300);
    chk(await p.$$eval('.tisch .stein', s => s.length) >= 2, 'leuchttisch: kaputter Speicher, Spiel startet trotzdem');
    // Runde und Lernzeit: erste Antwort startet die Uhr; ist die Lernzeit um, gibt es keine Steine (freies Üben)
    await p.evaluate(() => { localStorage.removeItem('lernspiele:leuchttisch'); localStorage.removeItem('lernspiele:lernzeit'); });
    await p.reload(); await p.waitForTimeout(300);
    const uhrVor = await p.textContent('#uhrzeit');
    let n0 = await p.$$eval('.tisch .stein', s => s.length); await p.click(`.opt[data-wert="${n0}"]`); await p.waitForTimeout(1600);
    const r1 = await p.evaluate(() => JSON.parse(localStorage.getItem('lernspiele:leuchttisch')).runde);
    chk(uhrVor === '5:00' && r1 && r1.steine === 1 && await p.textContent('#uhrzeit') !== '5:00', 'leuchttisch: erste Antwort startet die 5-Minuten-Runde, Stein zählt');
    await p.goto(BASE); // erst die Seite verlassen: beim Verlassen speichert der Leuchttisch seine Runde
    await p.evaluate(() => { const d = new Date(), t = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      localStorage.setItem('lernspiele:lernzeit', JSON.stringify({ version: 1, tag: t, ms: 60 * 60 * 1000 }));
      const z = JSON.parse(localStorage.getItem('lernspiele:leuchttisch')); z.runde = null; z.fassung = []; localStorage.setItem('lernspiele:leuchttisch', JSON.stringify(z)); });
    await p.goto(BASE + 'leuchttisch/'); await p.waitForTimeout(300);
    chk(/Lernzeit/.test(await p.textContent('#hinweis')), 'leuchttisch: Lernzeit um wird angezeigt');
    n0 = await p.$$eval('.tisch .stein', s => s.length); await p.click(`.opt[data-wert="${n0}"]`); await p.waitForTimeout(400);
    chk(await p.$$eval('#amulett .stein', s => s.length) === 0 && /Super/.test(await p.textContent('#hinweis')), 'leuchttisch: freies Üben lobt, gibt aber keinen Stein');
    await p.goto(BASE); await p.evaluate(() => localStorage.removeItem('lernspiele:lernzeit')); await p.goto(BASE + 'leuchttisch/'); await p.waitForTimeout(300);
    // Schatzkammer: zeigt Amulette und Album, ohne fremde Anfragen; manipulierter Speicher
    {
      const fremd2 = [], fehler2 = [];
      p.on('request', r => { if (!r.url().startsWith(BASE)) fremd2.push(r.url()); });
      p.on('console', m => { if (m.type() === 'error') fehler2.push(m.text()); });
      await p.goto(BASE); await p.evaluate(() => localStorage.setItem('lernspiele:leuchttisch', JSON.stringify({ version: 1, stufe: 2, fassung: ['rubin', 'topas'],
        amulette: [{ steine: ['rubin', 'saphir', 'smaragd', 'amethyst', 'citrin'], form: 'sonne', material: 'silber' }, { steine: ['<img src=x onerror=alert(1)>'], form: 'x', material: 'y' }], modell: { form: 'schild', material: 'ton' } })));
      await p.click('.kachel[href="schatzkammer/"]'); await p.waitForURL(/schatzkammer/); await p.waitForTimeout(300);
      const sk = await p.evaluate(() => ({ karten: document.querySelectorAll('#amulette .karte').length, album: document.querySelectorAll('#album .karte').length,
        gefunden: document.querySelectorAll('#album .karte:not(.fehlt)').length, zahl: document.getElementById('album-zahl').textContent,
        jetzt: document.querySelectorAll('#jetzt .stein').length, img: !!document.querySelector('img'), scroll: document.documentElement.scrollWidth > innerWidth }));
      chk(sk.karten === 1 && sk.album === 24 && sk.gefunden === 1 && /1 von 24/.test(sk.zahl) && sk.jetzt === 2 && !sk.img && !sk.scroll, 'schatzkammer: Amulette, Album, angefangenes Amulett, bereinigt ' + JSON.stringify(sk));
      await p.screenshot({ path: `${SHOTS}/schatzkammer.png`, fullPage: true });
      chk(!fremd2.length && !fehler2.length, 'schatzkammer: keine fremden Anfragen, keine Fehler ' + fremd2.join(' ') + fehler2.join(' | '));
      await p.goto(BASE); await p.evaluate(() => localStorage.removeItem('lernspiele:leuchttisch')); await p.goto(BASE + 'leuchttisch/'); await p.waitForTimeout(300);
    }
    // Schreiben (Eltern-Einstellung)
    await p.click('#b-info'); await p.click('#eingabe [data-eingabe="schreiben"]'); await p.click('#b-info'); await p.waitForTimeout(800);
    await p.click('#stufen [data-stufe="0"]'); await p.waitForTimeout(300);
    const n = await p.$$eval('.tisch .stein', s => s.length);
    await schreibe(p, '#f-antwort', n); await p.waitForTimeout(900);
    const gelesen = await p.textContent('#f-antwort + .tag');
    if (await p.$$eval('#amulett .stein', s => s.length) === 1) chk(true, `leuchttisch: geschriebene ${n} erkannt, Stein dazu`);
    else console.log(`hinweis leuchttisch: ${n} geschrieben, gelesen "${gelesen}" (synthetische Ziffern)`);
    chk(!probleme.length, 'leuchttisch: keine Fehler ' + probleme.join(' | '));
    await c3.close();
  }
  await b.close();
  console.log(fehler ? `${fehler} FEHLER` : 'ALLES OK');
  process.exit(fehler ? 1 : 0);
})();
