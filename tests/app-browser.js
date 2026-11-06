// Prüft Installierbarkeit und Offline-Betrieb: Manifest, Symbole, Service Worker, Offline spielen,
// Installieren-Knopf, Vollbild, Diagnose, und dass sw.js alle ausgelieferten Dateien kennt.
// Aufruf: python3 -m http.server 8123 (im Projektordner), dann: node tests/app-browser.js
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs'); const path = require('path');
const { schreibe } = require('./hilfen.js');
const BASE = process.env.BASE || 'http://localhost:8123/';
const ROOT = path.join(__dirname, '..');

(async () => {
  let fehler = 0; const chk = (c, m) => { console.log((c ? 'ok     ' : 'FEHLER ') + m); if (!c) fehler++; };

  // 1. sw.js kennt alle Dateien, die ausgeliefert werden
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  const liste = JSON.parse(sw.match(/const DATEIEN = (\[[\s\S]*?\]);/)[1].replace(/'/g, '"').replace(/,\s*\]/, ']'));
  const ausgeliefert = execSync('git ls-files --cached --others --exclude-standard', { cwd: ROOT }).toString().split('\n')
    .filter(f => f && !/^(prototypen|werkzeuge|tests|docs)\//.test(f) && !/\.(md|txt)$/.test(f) && !['.gitignore', 'sw.js', 'gemeinsam/icons/icon-maskable.svg'].includes(f));
  const fehlt = ausgeliefert.filter(f => !liste.includes(f));
  const zuviel = liste.filter(f => !f.endsWith('/') && !fs.existsSync(path.join(ROOT, f)));
  chk(!fehlt.length, 'sw.js enthält alle ausgelieferten Dateien ' + fehlt.join(' '));
  chk(!zuviel.length, 'sw.js enthält keine Dateien, die es nicht gibt ' + zuviel.join(' '));

  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 820, height: 1180 } });
  const page = await ctx.newPage();
  const probleme = [], fremd = [];
  page.on('console', m => { if (m.type() === 'error') probleme.push(m.text()); });
  page.on('pageerror', e => probleme.push(e.message));
  ctx.on('request', r => { if (!r.url().startsWith(BASE)) fremd.push(r.url()); });
  await page.addInitScript(() => document.addEventListener('securitypolicyviolation', e => console.error('CSP: ' + e.violatedDirective + ' ' + e.blockedURI)));

  // 2. Manifest und Symbole
  await page.goto(BASE); await page.waitForTimeout(500);
  const m = await page.evaluate(async () => {
    const link = document.querySelector('link[rel=manifest]'); const r = await fetch(link.href); const j = await r.json();
    const groessen = await Promise.all(j.icons.map(ic => new Promise(res => { const i = new Image(); i.onload = () => res(ic.sizes === 'any' || ic.sizes === i.naturalWidth + 'x' + i.naturalHeight); i.onerror = () => res(false); i.src = new URL(ic.src, link.href); })));
    return { display: j.display, start: j.start_url, scope: j.scope, name: j.name, maskable: j.icons.some(i => i.purpose === 'maskable'), groessen, apple: !!document.querySelector('link[rel=apple-touch-icon]') };
  });
  chk(m.display === 'fullscreen' && m.start === './' && m.scope === './' && m.name, 'Manifest: Vollbild, Start und Bereich stimmen');
  chk(m.groessen.every(Boolean) && m.maskable && m.apple, 'Alle Symbole laden in der angegebenen Größe, mit maskable und Apple-Symbol');

  // 3. Service Worker aktiv und steuert die Seite
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload(); await page.waitForTimeout(500);
  chk(await page.evaluate(() => !!navigator.serviceWorker.controller), 'Service Worker steuert die Seite');
  const caches = await page.evaluate(async () => { const k = await caches.keys(); const c = await caches.open(k[0]); return { k, n: (await c.keys()).length }; });
  chk(caches.k.length === 1 && /^lernspiele-v\d+$/.test(caches.k[0]) && caches.n >= 30, `Alle Dateien gespeichert (${caches.k[0]}, ${caches.n} Einträge)`);

  // 4. Installieren-Knopf erscheint bei Chromes Signal (hier nachgestellt)
  await page.click('.erwachsene summary');
  chk(/Browser|Installationssignal|Teilen/.test(await page.textContent('[data-install-hinweis]')), 'Ohne Signal: Hinweis, wie man installiert');
  await page.evaluate(() => { const e = new Event('beforeinstallprompt'); e.prompt = () => { window.__gefragt = true; }; e.userChoice = Promise.resolve({ outcome: 'accepted' }); window.dispatchEvent(e); });
  chk(await page.locator('[data-installieren-knopf]').isVisible(), 'Mit Signal: Knopf „Installieren“ erscheint');
  await page.click('[data-installieren-knopf]'); await page.waitForTimeout(200);
  chk(await page.evaluate(() => window.__gefragt === true) && /gestartet/.test(await page.textContent('[data-install-hinweis]')), 'Knopf öffnet den Installationsdialog');

  // 5. Vollbild
  const vb = page.locator('.erwachsene [data-vollbild-knopf]');
  chk(await vb.isVisible(), 'Vollbild-Knopf sichtbar (Browser erlaubt Vollbild)');
  await vb.click(); await page.waitForTimeout(300);
  chk(await page.evaluate(() => !!document.fullscreenElement) && /aus/.test(await vb.textContent()), 'Vollbild an, Knopf zeigt „Vollbild aus“');
  await vb.click(); await page.waitForTimeout(300);
  chk(await page.evaluate(() => !document.fullscreenElement), 'Vollbild wieder aus');

  // 5b. Schalter „7 nur mit Querstrich“
  const schalter = page.locator('input[data-einstellung=siebenMitQuerstrich]');
  chk(await schalter.isChecked(), 'Regel „7 nur mit Querstrich“ ist standardmäßig an');
  await schalter.click();
  chk(await page.evaluate(() => JSON.parse(localStorage.getItem('lernspiele:erkennung')).siebenMitQuerstrich === false), 'Schalter aus wird gespeichert');
  await schalter.click();
  chk(await page.evaluate(() => JSON.parse(localStorage.getItem('lernspiele:erkennung')).siebenMitQuerstrich === true), 'Schalter wieder an');

  // 6. Diagnose
  await page.click('[data-diagnose-knopf]'); await page.waitForTimeout(1500);
  const d = await page.textContent('[data-diagnose-ausgabe]');
  chk(/Service Worker: aktiv, steuert Seite/.test(d) && /Version: v\d+/.test(d) && /Manifest: 200/.test(d) && !/FEHLER/.test(d), 'Diagnose: alles in Ordnung');
  await page.screenshot({ path: path.join(ROOT, 'screenshots', 'start-erwachsene.png'), fullPage: true });

  // 7. Offline spielen
  await page.goto(BASE + 'zehnerweg/'); await page.waitForTimeout(800);
  await page.goto(BASE + 'garten/'); await page.waitForTimeout(300);
  await ctx.setOffline(true);
  await page.goto(BASE + 'zehnerweg/?probe'); await page.waitForTimeout(1200);
  chk(await page.locator('#f-start .given').textContent() !== '', 'Offline: Zehnerweg startet (mit ?probe)');
  await schreibe(page, '#f-ten', 10); await page.waitForTimeout(900);
  chk(/erkannt: 10/.test(await page.locator('#f-ten + .tag').textContent()), 'Offline: Zahlenerkennung funktioniert (Modell aus dem Speicher)');
  chk(await page.evaluate(() => document.fonts.check('800 20px Grandstander')), 'Offline: Schriften geladen');
  await page.goto(BASE + 'garten/'); await page.waitForTimeout(500);
  chk(await page.locator('.g-snail').count() >= 3, 'Offline: Garten öffnet');
  await page.goto(BASE); await page.waitForTimeout(300);
  chk(await page.locator('.kachel').count() >= 2, 'Offline: Startseite öffnet');
  await ctx.setOffline(false);

  chk(!probleme.length, 'Keine Fehler/CSP-Verstöße ' + probleme.join(' | '));
  chk(!fremd.length, 'Keine Anfragen an fremde Server ' + fremd.join(' '));
  await b.close();
  console.log(fehler ? `${fehler} FEHLER` : 'ALLES OK');
  process.exit(fehler ? 1 : 0);
})();
