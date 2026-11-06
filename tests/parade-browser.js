// Browser-Prüfung der Schneckenparade im Probe-Modus: ganze Runde, Rückblick, Garten, nächster Tag.
// Aufruf: python3 -m http.server 8123 (im Projektordner), dann: node tests/parade-browser.js
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const { loese } = require('./hilfen.js');
const BASE = process.env.BASE || 'http://localhost:8123/';
const SHOTS = path.join(__dirname, '..', 'screenshots'); fs.mkdirSync(SHOTS, { recursive: true });

(async () => {
  const b = await chromium.launch();
  let fehler = 0; const chk = (c, m) => { console.log((c ? 'ok     ' : 'FEHLER ') + m); if (!c) fehler++; };
  const ctx = await b.newContext({ viewport: { width: 820, height: 1180 } });
  const page = await ctx.newPage();
  const probleme = [], fremd = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') probleme.push(m.text()); });
  page.on('pageerror', e => probleme.push(e.message));
  page.on('request', r => { if (!r.url().startsWith(BASE)) fremd.push(r.url()); });
  await page.addInitScript(() => document.addEventListener('securitypolicyviolation', e => console.error('CSP: ' + e.violatedDirective + ' ' + e.blockedURI)));
  const parade = () => page.evaluate(() => JSON.parse(localStorage.getItem('lernspiele:parade') || 'null'));
  const bubble = () => page.textContent('#track .bubble');

  await page.goto(BASE + 'zehnerweg/?probe'); await page.waitForTimeout(800);
  chk(/Schreib los/.test(await bubble()), 'Vor der Runde: „Schreib los, dann startet die Parade!“');
  chk(await page.textContent('#uhrzeit') === '1:00', 'Probe-Modus: Runde dauert 1 Minute');
  chk(await page.locator('#track .walker').count() === 3, 'Drei Begleiter stehen auf der Straße');

  // Drei Aufgaben lösen → neue Schnecke
  for (let i = 0; i < 3; i++) {
    const ok = await loese(page);
    chk(ok, `Aufgabe ${i + 1} gelöst`);
    await page.waitForTimeout(1000);
    if (i < 2) await page.click('#b-next');
  }
  let z = await parade();
  chk(z.runde && z.garden.length === 4 && z.leaves === 0, 'Nach 3 Blättern: neue Schnecke im Garten, Blätter wieder bei 0');
  chk(z.garden[3].hat !== null, 'Ohne Fehler: neue Schnecke trägt einen Hut');
  chk(await page.locator('#track .walker').count() === 4 && /kriecht zur Parade/.test(await bubble()), 'Neue Schnecke kriecht in die Parade');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SHOTS, 'parade-neue-schnecke.png') });

  // Falsche Antwort: einmal pro Aufgabe, Hut fällt weg
  await page.click('#b-next'); await page.waitForTimeout(300);
  const { schreibe } = require('./hilfen.js');
  await schreibe(page, '#f-part1', 7); await page.waitForTimeout(800);
  await page.click('#b-check'); await page.click('#b-check'); await page.waitForTimeout(300);
  z = await parade();
  chk(z.cleanLeaves === false && await page.locator('#leaves .hatmark.off').count() === 1, 'Fehler: Hut-Anzeige wird blass');
  chk(/Macht nichts/.test(await bubble()), 'Fehler: freundliche Nachricht, nichts geht verloren');

  // Neu laden: Runde läuft weiter
  const restVor = await page.textContent('#uhrzeit');
  await page.reload(); await page.waitForTimeout(800);
  chk((await parade()).runde && /Weiter geht/.test(await bubble()), `Nach Neuladen läuft die Runde weiter (${restVor} → ${await page.textContent('#uhrzeit')})`);

  // Zeit um (vorspulen): angefangene Aufgabe darf fertig werden
  await page.evaluate(() => { const z = JSON.parse(localStorage.getItem('lernspiele:parade')); z.runde.ende = Date.now() - 100; localStorage.setItem('lernspiele:parade', JSON.stringify(z)); });
  await page.reload(); await page.waitForTimeout(1000);
  chk(/Zeit ist um/.test(await bubble()) && (await parade()).runde.zeitUm, 'Zeit um: Hinweis, Aufgabe darf fertig werden');
  const ok = await loese(page);
  chk(ok, 'Angefangene Aufgabe nach Ablauf gelöst');
  await page.waitForTimeout(5500);
  chk(await page.locator('dialog.rueckblick[open]').count() === 1, 'Rückblick erscheint nach der Runde');
  const text = await page.textContent('dialog.rueckblick');
  chk(/Für heute geschafft/.test(text) && /neue/.test(text), 'Rückblick: „Für heute geschafft!“ mit neuen Tieren');
  await page.screenshot({ path: path.join(SHOTS, 'parade-rueckblick.png') });
  z = await parade();
  chk(!z.runde && z.practiceDays === 1 && z.garden.filter(s => s.runs === 1).length === 3, 'Runde beendet: 1 Übungstag, Begleiter haben einen Ausflug');

  // Weiter üben ohne Blätter
  await page.click('dialog.rueckblick button'); await page.click('#b-next'); await page.waitForTimeout(300);
  const blattVor = (await parade()).leaves;
  await loese(page); await page.waitForTimeout(1000);
  chk((await parade()).leaves === blattVor && !(await parade()).runde, 'Nach der Runde: weiter üben ohne Blätter, keine neue Runde');
  chk(await page.textContent('#uhrzeit') === '0:00', 'Uhr zeigt 0:00');

  // Garten
  await page.click('#b-garten'); await page.waitForURL(/garten\/\?probe/); await page.waitForTimeout(400);
  const n = (await parade()).garden.length;
  chk(await page.locator('.g-snail').count() === n, `Garten zeigt alle ${n} Tiere`);
  chk(await page.locator('.g-snail.walks').count() === 3, 'Drei Begleiter markiert');
  const ohne = page.locator('.g-snail:not(.walks)').first(); const name = await ohne.locator('span').first().textContent();
  await ohne.click(); await page.waitForTimeout(200);
  chk(await page.locator('.g-snail.walks').count() === 3 && (await page.textContent('#hinweis')).includes(name), `Neuer Begleiter ${name} gewählt, weiterhin höchstens 3`);
  chk(/von \d+ entdeckt/.test(await page.textContent('#album-zahl')), 'Sammelalbum wird angezeigt');
  await page.screenshot({ path: path.join(SHOTS, 'garten-ipad-hoch.png'), fullPage: true });

  // Nächster Tag (Probe)
  await page.click('#b-tag'); await page.click('#b-spiel'); await page.waitForURL(/zehnerweg/); await page.waitForTimeout(800);
  chk(/Schreib los/.test(await bubble()) && await page.textContent('#uhrzeit') === '1:00', 'Nächster Tag: neue Runde möglich');
  chk((await page.locator('#track .walker').count()) === 3, 'Gewählte Begleiter stehen bereit');

  // Ohne ?probe gibt es keinen Probe-Knopf
  await page.goto(BASE + 'garten/'); await page.waitForTimeout(300);
  chk(await page.locator('#b-tag').isHidden(), 'Ohne ?probe kein „Nächster Tag“-Knopf');
  // Garten im Querformat und dunkel
  await page.setViewportSize({ width: 1280, height: 800 }); await page.click('[data-thema-knopf]'); await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SHOTS, 'garten-android-quer-dunkel.png') });
  chk(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)), 'Garten ohne Querscrollen');
  await page.goto(BASE); await page.waitForTimeout(300); await page.screenshot({ path: path.join(SHOTS, 'start-mit-garten.png') });

  chk(!probleme.length, 'Keine Fehler/CSP-Verstöße ' + probleme.join(' | '));
  chk(!fremd.length, 'Keine Anfragen an fremde Server ' + fremd.join(' '));
  await b.close();
  console.log(fehler ? `${fehler} FEHLER` : 'ALLES OK');
  process.exit(fehler ? 1 : 0);
})();
