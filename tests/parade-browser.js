// Browser-Prüfung der Schneckenparade im Probe-Modus: Blätter → Kopfbedeckung, Runde → Schnecke, Rückblick,
// Pause, gemeinsame Lernzeit, Hutschachtel im Garten, Sammelalbum, getrennter Probe-Speicher.
// Aufruf: python3 -m http.server 8123 (im Projektordner), dann: node tests/parade-browser.js
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const { loese, loesungen, schreibe } = require('./hilfen.js');
const BASE = process.env.BASE || 'http://localhost:8123/';
const SHOTS = path.join(__dirname, '..', 'screenshots'); fs.mkdirSync(SHOTS, { recursive: true });
const heute = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

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
  const parade = () => page.evaluate(() => JSON.parse(localStorage.getItem('lernspiele:probe:parade') || 'null'));
  const lernzeit = () => page.evaluate(() => JSON.parse(localStorage.getItem('lernspiele:probe:lernzeit') || 'null'));
  const bubble = () => page.textContent('#track .bubble');
  // Spielstand ändern: erst die Spielseite verlassen, damit sie den Stand nicht überschreibt
  const aendere = async (fn, arg) => { await page.goto(BASE); await page.waitForTimeout(200); await page.evaluate(fn, arg); };

  await page.goto(BASE + 'zehnerweg/?probe'); await page.waitForTimeout(800);
  chk(/Schreib eine Zahl/.test(await bubble()), 'Vor der Runde: „Schreib eine Zahl, dann startet die Parade!“');
  chk(await page.textContent('#uhrzeit') === '1:00', 'Probe-Modus: Runde dauert 1 Minute');
  chk(await page.locator('#track .walker').count() === 1 && await page.locator('#leaves .slot').count() === 5, 'Eine Startschnecke als Begleiter, fünf Blatt-Plätze');

  // Bemalen startet keine Runde und zählt nicht zur Lernzeit
  const kb = await page.locator('#f-part1').boundingBox();
  await page.mouse.move(kb.x + kb.width * .28, kb.y + kb.height * .3); await page.mouse.down();
  for (let i = 0; i < 24; i++) await page.mouse.move(kb.x + kb.width * (i % 2 ? .72 : .28), kb.y + kb.height * (.3 + .4 * i / 24), { steps: 3 });
  await page.mouse.up(); await page.waitForTimeout(1200);
  chk(/Bitte nur eine Zahl/.test(await page.locator('#f-part1 + .tag').textContent()) && (await parade()).runde === null && (await lernzeit()) === null, 'Gekritzel: keine Runde, keine Lernzeit');
  await page.click('#f-part1 + .tag .clr');

  // Fünf richtige Aufgaben → eine Kopfbedeckung in der Hutschachtel, aber keine Schnecke
  for (let i = 0; i < 5; i++) { chk(await loese(page), `Aufgabe ${i + 1} gelöst`); await page.waitForTimeout(900); if (i < 4) await page.click('#b-next'); }
  let z = await parade();
  chk(z.runde && z.hutschachtel.length === 1 && z.leaves === 0 && z.garden.length === 1, '5 Blätter: eine Kopfbedeckung in der Hutschachtel, noch keine neue Schnecke');
  chk(/Hutschachtel/.test(await bubble()), 'Hinweis auf die Hutschachtel im Garten');
  await page.screenshot({ path: path.join(SHOTS, 'parade-hut.png') });

  // Falsche Antwort: freundlich, nichts geht verloren
  await page.click('#b-next'); await page.waitForTimeout(300);
  await schreibe(page, '#f-part1', 7); await page.waitForTimeout(800);
  await page.click('#b-check'); await page.waitForTimeout(300);
  chk(/Macht nichts/.test(await bubble()), 'Fehler: freundliche Nachricht');

  // Zeit um → angefangene Aufgabe fertig → neue Schnecke, Rückblick
  await aendere(() => { const z = JSON.parse(localStorage.getItem('lernspiele:probe:parade')); z.runde.ende = Date.now() - 100; z.runde.pause = null; z.runde.zeitUm = false; localStorage.setItem('lernspiele:probe:parade', JSON.stringify(z)); });
  await page.goto(BASE + 'zehnerweg/'); await page.waitForTimeout(3500);
  // Beim Öffnen ist noch nichts geschrieben: Die Runde endet sofort, ohne auf eine neue Aufgabe zu warten
  chk(await page.locator('dialog.rueckblick[open]').count() === 1, 'Rückblick erscheint');
  const rb = await page.textContent('dialog.rueckblick');
  chk(/Runde geschafft/.test(rb) && /neue Schnecke/.test(rb) && /Noch eine Runde/.test(rb), 'Rückblick: „Runde geschafft!“, neue Schnecke, „Noch eine Runde“');
  chk(await page.locator('dialog.rueckblick .hut-bild').count() === 1, 'Rückblick zeigt die Kopfbedeckung dieser Runde');
  await page.screenshot({ path: path.join(SHOTS, 'parade-rueckblick.png') });
  z = await parade();
  chk(!z.runde && z.garden.length === 2 && z.garden[1].hat === null && z.practiceDays === 1, 'Runde fertig: genau eine neue Schnecke ohne Kopfbedeckung, ein Übungstag');
  const lz = await lernzeit();
  chk(lz && lz.tag === heute() && lz.ms > 1000 && lz.ms <= 61000, `Lernzeit gezählt (${Math.round((lz || {}).ms / 1000)} s von höchstens 60 s)`);

  // Pause, wenn die App verlassen wird; der nächste Strich setzt fort
  await page.click('dialog.rueckblick button');
  await schreibe(page, '#f-ten', 10); await page.waitForTimeout(1400);
  chk(!!(await parade()).runde, 'Nächste erkannte Zahl startet die nächste Runde');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  const angehalten = await page.textContent('#uhrzeit'); const lzAngehalten = (await lernzeit()).ms;
  await page.waitForTimeout(2200);
  chk((await parade()).runde.pause != null && await page.textContent('#uhrzeit') === angehalten && (await lernzeit()).ms === lzAngehalten, `App verlassen: Uhr und Lernzeit stehen (${angehalten})`);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await schreibe(page, '#f-part1', 1); await page.waitForTimeout(1600);
  chk((await parade()).runde.pause === null && (await lernzeit()).ms > lzAngehalten, 'Nächster Strich: Uhr und Lernzeit laufen weiter');

  // Lernzeit um: freies Üben ohne Belohnung, freundlicher Hinweis
  await aendere(() => { localStorage.setItem('lernspiele:probe:lernzeit', JSON.stringify({ version: 1, tag: new Date().toLocaleDateString('sv'), ms: 4 * 60 * 1000 })); const z = JSON.parse(localStorage.getItem('lernspiele:probe:parade')); z.runde = null; localStorage.setItem('lernspiele:probe:parade', JSON.stringify(z)); });
  await page.reload(); await page.waitForTimeout(300);
  chk(await page.locator('[data-lernzeit-anzeige].geschafft').count() === 1, 'Startseite: Lernzeit-Punkte zeigen „geschafft“');
  await page.goto(BASE + 'zehnerweg/'); await page.waitForTimeout(800);
  chk(/Lernzeit für heute ist um/.test(await bubble()) && await page.textContent('#uhrzeit') === '0:00', 'Lernzeit um: Hinweis „Schau doch mal in deinen Garten!“');
  const blattVor = (await parade()).leaves;
  chk(await loese(page), 'Freies Üben: Aufgabe lösen geht weiter'); await page.waitForTimeout(1000);
  z = await parade();
  chk(!z.runde && z.leaves === blattVor && /Super gerechnet/.test(await bubble()), 'Freies Üben: Lob, aber keine Runde und keine Blätter');

  // Garten: Hutschachtel und Sammelalbum
  await page.click('#b-garten'); await page.waitForURL(/garten/); await page.waitForTimeout(400);
  chk(await page.locator('.hs-hut:not(.hs-ab)').count() === 1, 'Hutschachtel zeigt die Kopfbedeckung');
  await page.locator('.hs-hut:not(.hs-ab)').first().click();
  chk(/Tippe eine Schnecke an/.test(await page.textContent('#hinweis')), 'Kopfbedeckung gewählt: „Tippe eine Schnecke an“');
  const name = await page.locator('.g-snail span').first().textContent();
  await page.locator('.g-snail').first().click(); await page.waitForTimeout(200);
  z = await parade();
  chk(z.hutschachtel.length === 0 && z.garden.some(s => s.name === name && s.hat) && (await page.textContent('#hinweis')).includes(name), `${name} trägt jetzt die Kopfbedeckung, Schachtel leer`);
  await page.screenshot({ path: path.join(SHOTS, 'garten-hutschachtel.png') });
  await page.click('.hs-ab'); await page.locator('.g-snail').first().click(); await page.waitForTimeout(200);
  chk((await parade()).hutschachtel.length === 1, 'Abnehmen: Kopfbedeckung wieder in der Schachtel');
  await page.click('#r-album'); await page.waitForTimeout(200);
  chk(await page.locator('.sticker').count() === 71 && /von 71 entdeckt/.test(await page.textContent('#album-zahl')), 'Sammelalbum: 71 Felder (48 Häuser)');
  chk(await page.locator('.haeuser-teil ~ .seite-teil .sticker:not(.miss)').first().locator('svg').count() === 1, 'Gefundene Kopfbedeckung im Album als Bild');
  await page.click('#r-garten');

  // Nächster Tag (Probe): Lernzeit wieder voll
  await page.click('#b-tag'); await page.waitForTimeout(200);
  await page.click('#b-spiel'); await page.waitForURL(/zehnerweg/); await page.waitForTimeout(800);
  chk(/Schreib eine Zahl/.test(await bubble()) && await page.textContent('#uhrzeit') === '1:00', 'Nächster Tag: Lernzeit wieder voll, neue Runde möglich');

  // Probe-Modus beenden: echter Speicher unberührt
  await page.goto(BASE); await page.click('.erwachsene summary'); await page.click('[data-probe-knopf]'); await page.waitForTimeout(500);
  chk(!(await page.evaluate(() => document.documentElement.classList.contains('probe'))), 'Probe beendet: kein Probe-Rahmen mehr');
  chk(await page.evaluate(() => localStorage.getItem('lernspiele:parade') === null && localStorage.getItem('lernspiele:lernzeit') === null), 'Im Probe-Modus wurden weder echter Garten noch echte Lernzeit angelegt');
  await page.goto(BASE + 'garten/'); await page.waitForTimeout(300);
  chk(await page.locator('#b-tag').isHidden(), 'Ohne Probe kein „Nächster Tag“-Knopf');
  await page.setViewportSize({ width: 1280, height: 800 }); await page.click('[data-thema-knopf]'); await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SHOTS, 'garten-android-quer-dunkel.png') });
  chk(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)), 'Garten ohne Querscrollen');

  // Zeitende mit vorgespulter Uhr (Probe: Runde 60 s, Nachspiel 30 s)
  const p2 = await ctx.newPage(); await p2.clock.install();
  p2.on('pageerror', e => probleme.push(e.message));
  const frisch = async () => { await p2.goto(BASE + 'zehnerweg/?probe'); await p2.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('lernspiele:probe:')) localStorage.removeItem(k); }); await p2.goto(BASE + 'zehnerweg/?probe'); await p2.clock.runFor(1500); };
  const bubble2 = () => p2.textContent('#track .bubble');
  const rb2 = () => p2.locator('dialog.rueckblick[open]').count();
  // Uhr vorspulen, dabei alle 12 s schreiben (sonst hält die Uhr nach 20 s ohne erkannte Zahl an)
  const ueben = async (ms, feld = '#f-ten') => { for (let t = 0; t < ms; t += 12000) { await schreibe(p2, feld, 1); await p2.clock.runFor(Math.min(12000, ms - t)); } };
  const loeseFake = async () => { const ans = await loesungen(p2); for (const id of ['part1', 'ten', 'part2', 'goal']) { await schreibe(p2, '#f-' + id, ans[id]); await p2.clock.runFor(900); } await p2.clock.runFor(300); };
  const gartenGroesse = () => p2.evaluate(() => JSON.parse(localStorage.getItem('lernspiele:probe:parade')).garden.length);

  // a) Nur geschrieben, nichts richtig: Zeit um → „Löse noch 2 Aufgaben richtig“, Runde läuft weiter; nach dem Nachspiel Ende ohne Schnecke
  await frisch(); await ueben(64000);
  chk(/Löse noch 2 Aufgaben richtig/.test(await bubble2()) && await rb2() === 0, 'Zeit um, 0 richtig: „Löse noch 2 Aufgaben richtig, dann kommt deine Schnecke“, Runde läuft weiter');
  await p2.click('#b-next'); await p2.clock.runFor(3500);
  chk(await rb2() === 0, 'Neue Aufgabe reicht nicht, um die Runde ohne richtige Aufgaben zu beenden');
  await ueben(30000);
  await p2.clock.runFor(4000);
  const text = await p2.textContent('dialog.rueckblick');
  chk(await rb2() === 1 && /Gut gemacht/.test(text) && /brauchst du 2 richtige Aufgaben/.test(text), 'Nach dem Nachspiel: Ende mit freundlichem Rückblick ohne Schnecke');
  chk(await gartenGroesse() === 1 && (await p2.evaluate(() => JSON.parse(localStorage.getItem('lernspiele:probe:parade')).practiceDays)) === 0, 'Keine neue Schnecke, kein Übungstag');
  chk((await p2.evaluate(() => JSON.parse(localStorage.getItem('lernspiele:probe:lernzeit')).ms)) > 30000, 'Die Lernzeit zählt trotzdem');
  await p2.click('dialog.rueckblick button');

  // b) 2 richtige Aufgaben, dann Zeit um: angefangene Aufgabe darf fertig werden, leere Aufgabe beendet die Runde sofort
  await frisch(); await loeseFake(); await p2.click('#b-next'); await loeseFake(); await p2.click('#b-next');
  await ueben(56000);
  chk(/Zeit ist um/.test(await bubble2()) && !/Löse noch/.test(await bubble2()) && await rb2() === 0, '2 richtig, Zeit um mit angefangener Aufgabe: „Mach diese Aufgabe noch fertig“');
  await p2.click('#b-next'); await p2.clock.runFor(3500);
  chk(await rb2() === 1 && /neue Schnecke/.test(await p2.textContent('dialog.rueckblick')) && await gartenGroesse() === 2, 'Neue Aufgabe nach Zeitende: Runde endet mit neuer Schnecke');
  await p2.click('dialog.rueckblick button');
  await frisch();
  for (let i = 0; i < 9; i++) { await loeseFake(); await p2.click('#b-next'); }    // fleißig gelöst (~58 s, jede Aufgabe etwa 6,5 s)
  await p2.clock.runFor(5000); await p2.clock.runFor(3500);                        // neue Aufgabe noch leer, Zeit läuft ab
  chk(await rb2() === 1 && await gartenGroesse() === 2, 'Zeit um ohne Geschriebenes (2 richtig): Runde endet sofort mit Schnecke');
  await p2.close();

  // Erster Start: Die Schnecken des Startgartens bleiben beim erneuten Öffnen gleich (werden sofort gespeichert)
  const ctx2 = await b.newContext(); const p3 = await ctx2.newPage();
  const namen = async () => (await p3.locator('.g-snail span:not(.marke)').allTextContents()).join(',');
  await p3.goto(BASE + 'garten/'); await p3.waitForTimeout(300); const erster = await namen();
  chk(await p3.evaluate(() => localStorage.getItem('lernspiele:parade') !== null), 'Startgarten wird sofort gespeichert');
  let gleich = erster.split(',').length === 1;
  for (let i = 0; i < 3; i++) { await p3.goto(BASE + 'garten/'); await p3.waitForTimeout(250); gleich = gleich && (await namen()) === erster; }
  chk(gleich, `Erster Start: Namen bleiben bei jedem Öffnen gleich (${erster})`);
  await ctx2.close();

  chk(!probleme.length, 'Keine Fehler/CSP-Verstöße ' + probleme.join(' | '));
  chk(!fremd.length, 'Keine Anfragen an fremde Server ' + fremd.join(' '));
  await b.close();
  console.log(fehler ? `${fehler} FEHLER` : 'ALLES OK');
  process.exit(fehler ? 1 : 0);
})();
