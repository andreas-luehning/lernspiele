// Prüft den Rundenstart im Leuchttisch (Schreiben): Gekritzel startet keine Runde, eine erkannte Zahl schon.
// Aufruf: python3 -m http.server 8123 (im Projektordner), dann: node tests/leuchttisch-browser.js
const { chromium } = require('playwright');
const { schreibe } = require('./hilfen.js');
const BASE = process.env.BASE || 'http://localhost:8123/';

(async () => {
  const b = await chromium.launch();
  let fehler = 0; const chk = (c, m) => { console.log((c ? 'ok     ' : 'FEHLER ') + m); if (!c) fehler++; };
  const page = await (await b.newContext({ viewport: { width: 820, height: 1180 } })).newPage();
  const probleme = [], fremd = [];
  page.on('console', m => { if (m.type() === 'error') probleme.push(m.text()); });
  page.on('pageerror', e => probleme.push(e.message));
  page.on('request', r => { if (!r.url().startsWith(BASE)) fremd.push(r.url()); });

  await page.goto(BASE + 'leuchttisch/?probe');
  await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('lernspiele:probe:')) localStorage.removeItem(k); });
  await page.goto(BASE + 'leuchttisch/?probe'); await page.waitForTimeout(800);
  await page.click('#b-info'); await page.click('[data-eingabe=schreiben]'); await page.click('#b-info'); await page.waitForTimeout(1500); // Einstellung „Schreiben“ im ?-Feld, Zahlenerkennung lädt
  chk(await page.textContent('#uhrzeit') === '1:00', 'Vor dem Schreiben: Uhr steht bei 1:00');

  // Bemalen: keine Runde, Uhr läuft nicht
  const box = await page.locator('#schreiben canvas').boundingBox();
  await page.mouse.move(box.x + box.width * .25, box.y + box.height * .3); await page.mouse.down();
  for (let i = 0; i < 24; i++) await page.mouse.move(box.x + box.width * (i % 2 ? .75 : .25), box.y + box.height * (.3 + .4 * i / 24), { steps: 3 });
  await page.mouse.up(); await page.waitForTimeout(2500);
  chk(await page.textContent('#uhrzeit') === '1:00', 'Gekritzel startet keine Runde: Uhr bleibt bei 1:00');

  // Eine erkannte Zahl (egal ob richtig): die Runde beginnt
  await page.evaluate(() => document.querySelector('#schreiben .tag .clr')?.click());
  await schreibe(page, '#schreiben canvas', 9); await page.waitForTimeout(2500);
  chk(await page.textContent('#uhrzeit') !== '1:00', 'Erkannte Zahl startet die Runde: Uhr läuft (' + await page.textContent('#uhrzeit') + ')');

  chk(!probleme.length, 'Keine Fehler ' + probleme.join(' | '));
  chk(!fremd.length, 'Keine Anfragen an fremde Server ' + fremd.join(' '));
  await b.close();
  console.log(fehler ? `${fehler} FEHLER` : 'ALLES OK');
  process.exit(fehler ? 1 : 0);
})();
