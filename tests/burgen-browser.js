// Prüft die Burgen (Probe-Version): Kachel nur im Probe-Modus, Zählen, „Zeig mir's“, Statistik, Speicher, Layout.
// Aufruf: python3 -m http.server 8123 (im Projektordner), dann: node tests/burgen-browser.js
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8123/';
const SHOTS = process.env.SHOTS || '/tmp';

(async () => {
  const b = await chromium.launch();
  let fehler = 0; const chk = (c, m) => { console.log((c ? 'ok     ' : 'FEHLER ') + m); if (!c) fehler++; };

  for (const [name, viewport] of [['hoch', { width: 820, height: 1180 }], ['quer', { width: 1280, height: 800 }]]) {
    const ctx = await b.newContext({ viewport });
    const p = await ctx.newPage();
    const probleme = [], fremd = [];
    p.on('console', m => { if (m.type() === 'error') probleme.push(m.text()); });
    p.on('pageerror', e => probleme.push(e.message));
    p.on('request', r => { if (!r.url().startsWith(BASE)) fremd.push(r.url()); });

    // Kachel nur im Probe-Modus
    await p.goto(BASE); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(300);
    chk(!(await p.isVisible('.kachel[href="burgen/"]')), `${name}: ohne Probe-Modus keine Burgen-Kachel`);
    await p.goto(BASE + '?probe'); await p.waitForTimeout(300);
    chk(await p.isVisible('.kachel[href="burgen/"]'), `${name}: im Probe-Modus ist die Burgen-Kachel da`);
    await p.click('.kachel[href="burgen/"]'); await p.waitForURL(/burgen/); await p.waitForTimeout(500);

    const zahl = async () => p.$$eval('#tisch .burg-svg > .teil', t => t.length);
    const n = await zahl();
    const info = await p.evaluate(() => ({
      schein: document.querySelectorAll('.lichtschein .teil').length, scheinDa: document.querySelectorAll('.lichtschein > g').length,
      scheinUnten: [...document.querySelector('.burg-svg').children].findIndex(k => k.classList.contains('lichtschein')) <
        [...document.querySelector('.burg-svg').children].findIndex(k => k.classList.contains('teil')),
      platte: !!document.querySelector('#tisch .platte + .burg-svg'),
    }));
    chk(n >= 8 && n <= 13, `${name}: Burg mit 8–13 Teilen (${n})`);
    chk(!info.schein && info.scheinDa === n && info.scheinUnten, `${name}: Lichtschein pro Teil, unter der Burg, zählt nicht als Teil`);
    chk(info.platte, `${name}: Burg liegt auf der Milchglas-Platte`);
    const opts = await p.$$eval('.opt', o => o.map(x => +x.textContent));
    chk(opts.length === 4 && opts.filter(o => o === n).length === 1, `${name}: vier Antworten, eine richtig ${opts}`);

    const lay = await p.evaluate(() => {
      const r = s => document.querySelector(s).getBoundingClientRect();
      const knoepfe = [...document.querySelectorAll('button, a.info-btn')].filter(k => k.offsetParent);
      return { tisch: Math.round(Math.min(r('#tisch').width, r('#tisch').height)), kl: knoepfe.some(k => k.getBoundingClientRect().height < 44),
        raus: knoepfe.some(k => k.getBoundingClientRect().bottom > innerHeight + 1), scroll: document.documentElement.scrollHeight > innerHeight + 1 };
    });
    chk(lay.tisch >= 380 && !lay.kl && !lay.raus && !lay.scroll, `${name}: Tisch groß, alles sichtbar, Knöpfe ≥ 44 px ${JSON.stringify(lay)}`);

    // Falsch: Rechnung mit ?, Ergebnis nicht verraten, Fehlversuch gezählt
    await p.click(`.opt:not([data-wert="${n}"])`); await p.waitForTimeout(200);
    let h = await p.textContent('#hinweis');
    chk(/\?/.test(h) && !new RegExp('=\\s*' + n + '\\b').test(h) && await p.textContent('#s-fehler') === '1', `${name}: falsch zeigt Turm + Mitte + Turm = ?, Fehlversuch gezählt`);

    // Zeig mir's: alle Teile durchgezählt, Ergebnis bleibt offen
    await p.click('#b-hilfe'); await p.waitForTimeout(400 * 13 + 420 * 3 + 800);
    h = await p.textContent('#hinweis');
    chk(await p.$$eval('.zaehl', z => z.length) === n && /\?/.test(h) && !(await p.isDisabled('#b-hilfe')), `${name}: Zeig mir's zählt alle ${n} Teile, Ergebnis bleibt offen`);

    // Richtig: Tisch leuchtet, Statistik (mit Hilfe, nicht gleich richtig)
    await p.click(`.opt[data-wert="${n}"]`); await p.waitForTimeout(200);
    chk(await p.$eval('#tisch', t => t.classList.contains('jubel')) && /Stimmt/.test(await p.textContent('#hinweis')), `${name}: richtig, Tisch leuchtet auf`);
    chk(await p.textContent('#s-geloest') === '1' && await p.textContent('#s-hilfe') === '1' && await p.textContent('#s-gleich') === '0', `${name}: Statistik gelöst 1, mit Hilfe 1`);
    await p.screenshot({ path: `${SHOTS}/burgen-${name}.png` });

    // Neue Burg, gleich richtig
    await p.click('#b-neu'); await p.waitForTimeout(200);
    const n2 = await zahl(); await p.click(`.opt[data-wert="${n2}"]`); await p.waitForTimeout(200);
    chk(await p.textContent('#s-geloest') === '2' && await p.textContent('#s-gleich') === '1', `${name}: gleich richtig gezählt`);

    // Speicher: nur im Probe-Speicher, bleibt nach Neuladen, manipulierte Werte werden bereinigt
    const sp = await p.evaluate(() => ({ probe: JSON.parse(localStorage.getItem('lernspiele:probe:burgen')), echt: localStorage.getItem('lernspiele:burgen') }));
    chk(sp.probe?.geloest === 2 && sp.echt === null, `${name}: Statistik nur im Probe-Speicher`);
    await p.reload(); await p.waitForTimeout(300);
    chk(await p.textContent('#s-geloest') === '2', `${name}: Statistik bleibt nach Neuladen`);
    await p.evaluate(() => localStorage.setItem('lernspiele:probe:burgen', JSON.stringify({ version: 1, geloest: '<img src=x onerror=alert(1)>', fehlversuche: -3 })));
    await p.reload(); await p.waitForTimeout(300);
    chk(await p.textContent('#s-geloest') === '0' && await p.textContent('#s-fehler') === '0' && !(await p.$('#statistik img')), `${name}: manipulierter Speicher wird bereinigt`);

    chk(!probleme.length, `${name}: keine Fehler/CSP-Verstöße ${probleme.join(' | ')}`);
    chk(!fremd.length, `${name}: keine Anfragen an fremde Server ${fremd.join(' ')}`);
    await ctx.close();
  }
  await b.close();
  console.log(fehler ? `${fehler} FEHLER` : 'ALLES OK');
  process.exit(fehler ? 1 : 0);
})();
