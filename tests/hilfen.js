// Hilfen für die Browser-Tests: Ziffern als Striche auf ein Feld schreiben (mit der Maus).
const D = {
  0: [[[.5,0],[.15,.2],[.1,.5],[.15,.8],[.5,1],[.85,.8],[.9,.5],[.85,.2],[.5,0]]],
  1: [[[.25,.25],[.55,0],[.55,1]]],
  2: [[[.1,.25],[.3,.02],[.7,.02],[.88,.25],[.8,.5],[.1,1],[.95,1]]],
  3: [[[.1,.1],[.5,0],[.85,.15],[.85,.35],[.45,.5],[.9,.65],[.9,.88],[.5,1],[.1,.9]]],
  4: [[[.6,0],[.08,.65],[.92,.65]],[[.65,.3],[.65,1]]],
  5: [[[.85,0],[.2,0],[.15,.45],[.55,.38],[.88,.6],[.85,.88],[.5,1],[.12,.9]]],
  6: [[[.75,0],[.3,.3],[.12,.7],[.3,.98],[.7,.98],[.85,.72],[.6,.5],[.2,.65]]],
  7: [[[.05,0],[.95,0],[.4,1]]],
  8: [[[.5,.5],[.15,.3],[.25,.05],[.75,.05],[.85,.3],[.5,.5],[.12,.72],[.25,.97],[.75,.97],[.88,.72],[.5,.5]]],
  9: [[[.85,.3],[.65,.05],[.3,.05],[.15,.3],[.35,.5],[.8,.4],[.85,.3],[.75,1]]],
};
async function schreibe(page, sel, zahl) {
  const box = await page.locator(sel).boundingBox();
  const ziff = String(zahl).split('');
  const breite = box.width * (ziff.length === 1 ? 0.3 : 0.24), hoehe = box.height * 0.5;
  for (let k = 0; k < ziff.length; k++) {
    const x0 = box.x + box.width * (ziff.length === 1 ? 0.35 : 0.2 + k * 0.34), y0 = box.y + box.height * 0.2;
    for (const st of D[ziff[k]]) {
      await page.mouse.move(x0 + st[0][0] * breite, y0 + st[0][1] * hoehe); await page.mouse.down();
      for (let i = 1; i < st.length; i++) await page.mouse.move(x0 + st[i][0] * breite, y0 + st[i][1] * hoehe, { steps: 6 });
      await page.mouse.up();
    }
  }
}

/** Lösungen der aktuellen Zehnerweg-Aufgabe aus der Gleichung oben ablesen. */
async function loesungen(page) {
  const eq = await page.textContent('#eq'); const m = eq.match(/(\d+)\s*([+−])\s*(\d+)/);
  const a = +m[1], op = m[2], b = +m[3], p1 = op === '+' ? 10 - a : a - 10;
  return { part1: p1, ten: 10, part2: b - p1, goal: op === '+' ? a + b : a - b };
}

/** Eine Aufgabe komplett lösen. */
async function loese(page) {
  const ans = await loesungen(page);
  for (const id of ['part1', 'ten', 'part2', 'goal']) { await schreibe(page, '#f-' + id, ans[id]); await page.waitForTimeout(750); }
  await page.waitForTimeout(300);
  return page.evaluate(() => document.getElementById('stage').classList.contains('done'));
}

module.exports = { D, schreibe, loesungen, loese };
