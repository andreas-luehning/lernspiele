// Prüft die Burgen (Probe-Version): Kachel nur im Probe-Modus, vier Stufen, andere Fragen, Tuch, „Zeig mir's“,
// Statistik je Stufe, Speicher, Layout. Aufruf: python3 -m http.server 8123 (im Projektordner), dann: node tests/burgen-browser.js
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8123/';
const SHOTS = process.env.SHOTS || '/tmp';

(async () => {
  const b = await chromium.launch();
  let fehler = 0; const chk = (c, m) => { console.log((c ? 'ok     ' : 'FEHLER ') + m); if (!c) fehler++; };

  for (const [name, viewport] of [['hoch', { width: 820, height: 1180 }], ['quer', { width: 1280, height: 800 }], ['handy', { width: 390, height: 844 }]]) {
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

    // Was gerade gefragt ist und die richtige Antwort (aus dem Bild gezählt)
    const lage = () => p.evaluate(() => {
      const f = document.querySelector('#frage'), teile = [...document.querySelectorAll('#tisch .burg-svg > .teil')];
      const zahl = b => teile.filter(t => t.dataset.bereich === b).length;
      const art = f.dataset.art;
      const antwort = art === 'turm' ? zahl('0') : art === 'farbe' ? teile.filter(t => t.dataset.farbe === f.dataset.farbe).length : teile.length;
      return { art, antwort, n: teile.length, l: zahl('0'), m: zahl('1'), r: zahl('2'), tuch: !!document.querySelector('.burg-svg .tuch'),
        fleck: !!f.querySelector('.farbfleck'), text: f.textContent };
    });
    const stat = () => p.evaluate(() => ['s-geloest', 's-gleich', 's-hilfe', 's-fehler'].map(id => +document.getElementById(id).textContent));
    const stufe = async i => { await p.click(`#stufen [data-stufe="${i}"]`); await p.waitForTimeout(250); };

    // Stufe 1 Klein (Standard)
    let L = await lage();
    chk(await p.getAttribute('#stufen [data-stufe="0"]', 'aria-pressed') === 'true' && L.n >= 6 && L.n <= 10 && L.l === L.r, `${name}: Klein ist Standard, 6–10 Teile, Türme gleich (${L.l}+${L.m}+${L.r})`);
    const info = await p.evaluate(() => ({
      schein: document.querySelectorAll('.lichtschein .teil').length, scheinDa: document.querySelectorAll('.lichtschein > g').length,
      platte: !!document.querySelector('#tisch .platte + .burg-svg'),
    }));
    chk(!info.schein && info.scheinDa === L.n && info.platte, `${name}: Lichtschein pro Teil zählt nicht als Teil, Burg auf der Milchglas-Platte`);
    const opts = await p.$$eval('.opt', o => o.map(x => +x.textContent));
    chk(opts.length === 4 && opts.filter(o => o === L.antwort).length === 1, `${name}: vier Antworten, eine richtig ${opts}`);
    const lay = await p.evaluate(() => {
      const r = s => document.querySelector(s).getBoundingClientRect();
      const knoepfe = [...document.querySelectorAll('button, a.info-btn')].filter(k => k.offsetParent);
      return { tisch: Math.round(Math.min(r('#tisch').width, r('#tisch').height)), kl: knoepfe.some(k => k.getBoundingClientRect().height < 44),
        raus: knoepfe.some(k => k.getBoundingClientRect().bottom > innerHeight + 1 || k.getBoundingClientRect().right > innerWidth + 1),
        scroll: document.documentElement.scrollHeight > innerHeight + 1 || document.documentElement.scrollWidth > innerWidth + 1 };
    });
    chk(lay.tisch >= (name === 'handy' ? 300 : 380) && !lay.kl && !lay.raus && !lay.scroll, `${name}: Tisch groß, alles sichtbar, Knöpfe ≥ 44 px ${JSON.stringify(lay)}`);

    // Falsch, dann „Zeig mir's“, dann richtig
    await p.click(`.opt:not([data-wert="${L.antwort}"])`); await p.waitForTimeout(200);
    chk((await stat())[3] === 1 && !new RegExp('=\\s*' + L.antwort + '\\b').test(await p.textContent('#hinweis')), `${name}: falsch zählt einen Fehlversuch, verrät nichts`);
    await p.click('#b-hilfe'); await p.waitForTimeout(250 + L.n * 560 + 1500);
    const hilfe = await p.evaluate(() => ({ zahlen: document.querySelectorAll('.zaehl').length, ringe: document.querySelectorAll('.zaehl-ring').length,
      frei: !document.querySelector('#b-hilfe').disabled, text: document.querySelector('#hinweis').textContent }));
    if (L.art === 'alle') chk(hilfe.zahlen === L.n && /\?/.test(hilfe.text) && hilfe.frei, `${name}: Zeig mir's zählt alle ${L.n} Teile, Ergebnis offen`);
    else chk(hilfe.ringe === L.antwort && hilfe.zahlen === 0 && hilfe.frei, `${name}: Zeig mir's (${L.art}) umkreist ${L.antwort} Teile ohne Zahlen`);
    await p.click(`.opt[data-wert="${L.antwort}"]`); await p.waitForTimeout(200);
    chk(await p.$eval('#tisch', t => t.classList.contains('jubel')) && /Stimmt/.test(await p.textContent('#hinweis')), `${name}: richtig, Tisch leuchtet auf`);
    chk(JSON.stringify(await stat()) === '[1,0,1,1]', `${name}: Statistik Klein: gelöst 1, mit Hilfe 1, Fehlversuch 1`);

    // Andere Fragen in Klein: ein Turm und eine Farbe kommen vor und lassen sich lösen
    const gesehen = new Set();
    for (let i = 0; i < 60 && gesehen.size < 3; i++) {
      await p.click('#b-neu'); await p.waitForTimeout(80);
      L = await lage();
      if (gesehen.has(L.art)) continue;
      gesehen.add(L.art);
      if (L.art === 'farbe') chk(L.fleck && /Wie viele \S+ Bausteine\?/.test(L.text), `${name}: Farbfrage mit Farbfleck („${L.text}“)`);
      if (L.art === 'turm') chk(/ein Turm/.test(L.text), `${name}: Frage nach einem Turm`);
      await p.click(`.opt[data-wert="${L.antwort}"]`); await p.waitForTimeout(150);
      chk(/Stimmt/.test(await p.textContent('#hinweis')), `${name}: Frage „${L.art}“ richtig beantwortet (${L.antwort})`);
      if (L.art === 'farbe') await p.screenshot({ path: `${SHOTS}/burgen-farbe-${name}.png` });
    }
    chk(gesehen.has('turm') && gesehen.has('farbe'), `${name}: in Klein kommen auch andere Fragen vor ${[...gesehen]}`);

    // Stufe 2 Groß
    await stufe(1); L = await lage();
    chk(L.n >= 10 && L.n <= 20 && L.l === L.r && !L.tuch && JSON.stringify(await stat()) === '[0,0,0,0]', `${name}: Groß 10–20 Teile, Türme gleich, eigene Statistik (${L.l}+${L.m}+${L.r})`);
    // Stufe 3 Ungleich
    await stufe(2); L = await lage();
    chk(L.n >= 8 && L.n <= 15 && L.l !== L.r && L.art === 'alle', `${name}: Ungleich 8–15 Teile, Türme verschieden (${L.l}+${L.m}+${L.r})`);
    await p.click(`.opt[data-wert="${L.antwort}"]`); await p.waitForTimeout(150);
    chk(JSON.stringify(await stat()) === '[1,1,0,0]', `${name}: Ungleich gleich richtig gezählt`);
    // Stufe 4 Versteckt: Tuch, Zeig mir's ohne den versteckten Turm, richtig → Tuch weg
    await stufe(3); L = await lage();
    chk(L.tuch && L.l === L.r && L.art === 'versteckt' && /versteckt/.test(L.text), `${name}: Versteckt: ein Turm unter dem Tuch (${L.l}+${L.m}+?)`);
    const tuchDeckt = await p.evaluate(() => {
      const t = document.querySelector('.tuch').getBBox();
      return [...document.querySelectorAll('.burg-svg > .teil[data-bereich="2"]')].every(e => { const b = e.getBBox(); return b.x >= t.x && b.x + b.width <= t.x + t.width && b.y >= t.y && b.y + b.height <= t.y + t.height; });
    });
    chk(tuchDeckt, `${name}: das Tuch deckt den Turm ganz ab`);
    await p.screenshot({ path: `${SHOTS}/burgen-versteckt-${name}.png` });
    await p.click('#b-hilfe'); await p.waitForTimeout(250 + L.n * 400 + 1800);
    const h2 = await p.evaluate(() => ({ zahlen: document.querySelectorAll('.zaehl').length, text: document.querySelector('#hinweis').textContent }));
    chk(h2.zahlen === L.l + L.m && /Tuch/.test(h2.text) && (h2.text.match(/\?/g) || []).length >= 2, `${name}: Zeig mir's zählt nur, was man sieht; versteckter Turm bleibt ?`);
    await p.click(`.opt[data-wert="${L.antwort}"]`); await p.waitForTimeout(900);
    chk(!(await p.$('.burg-svg .tuch')) && /Stimmt/.test(await p.textContent('#hinweis')), `${name}: richtig: das Tuch wird weggezogen`);
    await p.screenshot({ path: `${SHOTS}/burgen-versteckt-geloest-${name}.png` });

    // Speicher: Stufe und Statistik je Stufe, nur im Probe-Speicher, bleibt nach Neuladen, wird bereinigt
    const sp = await p.evaluate(() => ({ probe: JSON.parse(localStorage.getItem('lernspiele:probe:burgen')), echt: localStorage.getItem('lernspiele:burgen') }));
    chk(sp.echt === null && sp.probe?.stufe === 3 && sp.probe.stat.klein.geloest >= 3 && sp.probe.stat.ungleich.geloest === 1 && sp.probe.stat.versteckt.geloest === 1, `${name}: Stufe und Statistik je Stufe im Probe-Speicher`);
    await p.reload(); await p.waitForTimeout(300);
    chk(await p.getAttribute('#stufen [data-stufe="3"]', 'aria-pressed') === 'true' && (await stat())[0] === 1, `${name}: Stufe und Statistik bleiben nach Neuladen`);
    await p.evaluate(() => localStorage.setItem('lernspiele:probe:burgen', JSON.stringify({ version: 1, stufe: '<img src=x onerror=alert(1)>', stat: { klein: { geloest: '<b>x</b>', fehlversuche: -3 } } })));
    await p.reload(); await p.waitForTimeout(300);
    chk(await p.getAttribute('#stufen [data-stufe="0"]', 'aria-pressed') === 'true' && JSON.stringify(await stat()) === '[0,0,0,0]' && !(await p.$('#statistik b, img')), `${name}: manipulierter Speicher wird bereinigt`);

    chk(!probleme.length, `${name}: keine Fehler/CSP-Verstöße ${probleme.join(' | ')}`);
    chk(!fremd.length, `${name}: keine Anfragen an fremde Server ${fremd.join(' ')}`);
    await ctx.close();
  }
  await b.close();
  console.log(fehler ? `${fehler} FEHLER` : 'ALLES OK');
  process.exit(fehler ? 1 : 0);
})();
