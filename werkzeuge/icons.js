// Erzeugt die PNG-App-Symbole aus den SVG-Vorlagen in gemeinsam/icons/.
// Aufruf im Projektordner: node werkzeuge/icons.js   (braucht Playwright mit Chromium)
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const DIR = path.join(__dirname, '..', 'gemeinsam', 'icons');
const AUFTRAEGE = [
  ['icon.svg', 'icon-192.png', 192],
  ['icon.svg', 'icon-512.png', 512],
  ['icon-maskable.svg', 'icon-512-maskable.png', 512],
  ['icon-maskable.svg', 'apple-touch-icon.png', 180], // iPad/iPhone runden die Ecken selbst ab
];
(async () => {
  const b = await chromium.launch();
  for (const [quelle, ziel, groesse] of AUFTRAEGE) {
    const p = await b.newPage({ viewport: { width: groesse, height: groesse }, deviceScaleFactor: 1 });
    const svg = fs.readFileSync(path.join(DIR, quelle), 'utf8');
    await p.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${groesse}px;height:${groesse}px}</style>${svg}`);
    await p.screenshot({ path: path.join(DIR, ziel), omitBackground: true });
    await p.close();
    console.log('geschrieben:', ziel, groesse + '×' + groesse);
  }
  await b.close();
})();
