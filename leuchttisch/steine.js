// Edelsteine und Amulett als SVG, aus festen Formen gebaut (kein innerHTML).

const NS = 'http://www.w3.org/2000/svg';
export function svg(tag, attrs = {}, kinder = []) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  for (const c of kinder) e.append(c);
  return e;
}

// Edelsteine mit Schliff: Umriss, darin Ringe von Facetten und eine Tafel (die flache Fläche oben).
// Jede Facette bekommt Licht von links oben: zum Licht hin heller, abgewandt dunkler. Dazu ein Funkeln.
// Formen im Bereich -42 … 42, Mitte 0/0.

const kreisPunkte = (n, rx, ry = rx, start = -90) => Array.from({ length: n }, (_, i) => {
  const a = (start + i * 360 / n) * Math.PI / 180; return [rx * Math.cos(a), ry * Math.sin(a)];
});
// Kissen: Quadrat mit runden Ecken (Superellipse)
const kissen = (n, r) => Array.from({ length: n }, (_, i) => {
  const a = (-90 + 22.5 + i * 360 / n) * Math.PI / 180, c = Math.cos(a), si = Math.sin(a);
  return [r * Math.sign(c) * Math.abs(c) ** 0.5, r * Math.sign(si) * Math.abs(si) ** 0.5];
});

export const STEIN_ART = {
  rubin:    { name: 'Rubin',    farbe: '#e8193c', hell: '#ff9aac', dunkel: '#7d0a20',
              umriss: kreisPunkte(16, 39), ringe: [{ s: 0.86, versetzt: true }, { s: 0.66 }] },
  saphir:   { name: 'Saphir',   farbe: '#1f6fe5', hell: '#9ccfff', dunkel: '#0a347f',
              umriss: [[0, -43], [12, -31], [20, -16], [23, 0], [20, 16], [12, 31], [0, 43], [-12, 31], [-20, 16], [-23, 0], [-20, -16], [-12, -31]],
              ringe: [{ s: 0.86, versetzt: true }, { s: 0.64 }] },
  smaragd:  { name: 'Smaragd',  farbe: '#14a85a', hell: '#8af2b8', dunkel: '#08502c',
              umriss: [[-17, -38], [17, -38], [27, -28], [27, 28], [17, 38], [-17, 38], [-27, 28], [-27, -28]],
              ringe: [{ s: 0.82 }, { s: 0.78 }] },
  amethyst: { name: 'Amethyst', farbe: '#8b4fe8', hell: '#dcc6ff', dunkel: '#43208a',
              umriss: kreisPunkte(6, 39), ringe: [{ s: 0.92, versetzt: true }, { s: 0.62 }] },
  citrin:   { name: 'Citrin',   farbe: '#ff8a1a', hell: '#ffd49a', dunkel: '#9c4300',
              umriss: kissen(16, 35), ringe: [{ s: 0.86, versetzt: true }, { s: 0.68 }] },
  topas:    { name: 'Topas',    farbe: '#f2b800', hell: '#fff3a8', dunkel: '#8a6000',
              umriss: [[0, -40], [11, -23], [37, 28], [20, 31], [-20, 31], [-37, 28], [-11, -23]].map(([x, y]) => [x, y - 2]),
              ringe: [{ s: 0.86, versetzt: true }, { s: 0.6 }] },
};

const pkt = ps => ps.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
const LICHT = -135 * Math.PI / 180;           // Licht von links oben
/** Fläche mit Licht schattieren: Richtung der Fläche vom Mittelpunkt aus. */
function facette(ps) {
  const mx = ps.reduce((a, p) => a + p[0], 0) / ps.length, my = ps.reduce((a, p) => a + p[1], 0) / ps.length;
  const h = Math.cos(Math.atan2(my, mx) - LICHT) * Math.min(1, Math.hypot(mx, my) / 20);
  return h > 0
    ? svg('polygon', { points: pkt(ps), fill: '#ffffff', 'fill-opacity': (0.05 + 0.5 * h).toFixed(2), stroke: '#ffffff', 'stroke-opacity': '0.22', 'stroke-width': '0.6' })
    : svg('polygon', { points: pkt(ps), fill: '#000000', 'fill-opacity': (0.06 + 0.5 * -h).toFixed(2), stroke: '#ffffff', 'stroke-opacity': '0.12', 'stroke-width': '0.6' });
}
const sorteOk = sorte => (sorte in STEIN_ART ? sorte : 'rubin');
/** Umriss-Maße einer Sorte (für Glanzlicht und Innenkante). */
function masse(art) {
  const xs = art.umriss.map(p => p[0]), ys = art.umriss.map(p => p[1]);
  return { x0: Math.min(...xs), y0: Math.min(...ys), b: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}

/**
 * Ein Edelstein als <g>, Mitte (x, y), Größe g (Breite in Einheiten), Drehung in Grad.
 * licht: Der Stein liegt auf dem Leuchttisch; das Licht von unten scheint durch (Mitte heller in der Steinfarbe).
 * Plastisch gezeichnet: kräftiger Körper, zum Rand dunkler, Facetten, Durchlicht, Glanzlicht, feine Innenkante.
 * Größe und Umriss sind für alle Steine einer Sorte gleich (wichtig fürs Zählen).
 */
export function stein(sorte, x, y, g, dreh = 0, { licht = false } = {}) {
  const id = sorteOk(sorte), art = STEIN_ART[id], s = g / 84, m = masse(art);
  const gr = svg('g', { transform: `translate(${x} ${y}) rotate(${dreh}) scale(${s})`, class: 'stein', 'data-sorte': sorte });
  const k = svg('g', { 'stroke-linejoin': 'round' });
  // Schmaler Schein direkt am Rand (der versetzte Lichtfleck auf dem Tisch kommt extra, siehe lichtfleck)
  k.append(svg('polygon', { points: pkt(art.umriss.map(([a, b]) => [a * 1.1, b * 1.1])), fill: licht ? art.farbe : art.hell, 'fill-opacity': licht ? '0.35' : '0.5', filter: 'url(#schein)' }));
  // Körper: Mitte heller, zum Rand dunkler; darüber Licht von links oben
  k.append(svg('polygon', { points: pkt(art.umriss), fill: `url(#koerper-${id})` }));
  k.append(svg('polygon', { points: pkt(art.umriss), fill: 'url(#seitenlicht)' }));
  // Ringe von außen nach innen; s ist relativ zum vorigen Ring.
  // versetzt: Die inneren Ecken liegen zwischen den äußeren, das ergibt Dreiecke wie beim Brillanten.
  let aussen = art.umriss;
  for (const ring of art.ringe) {
    const n = aussen.length, nach = i => aussen[(i + 1) % n];
    const innen = ring.versetzt
      ? aussen.map((p, i) => [(p[0] + nach(i)[0]) / 2 * ring.s, (p[1] + nach(i)[1]) / 2 * ring.s])
      : aussen.map(([x, y]) => [x * ring.s, y * ring.s]);
    for (let i = 0; i < n; i++) {
      if (ring.versetzt) k.append(facette([aussen[i], nach(i), innen[i]]), facette([innen[(i - 1 + n) % n], aussen[i], innen[i]]));
      else k.append(facette([aussen[i], nach(i), innen[(i + 1) % n], innen[i]]));
    }
    aussen = innen;
  }
  // Durchlicht: Das Licht des Tisches scheint von unten durch die Mitte, in einem hellen Ton der Steinfarbe
  if (licht) k.append(svg('polygon', { points: pkt(art.umriss), fill: `url(#durchlicht-${id})` }));
  // Tafel
  k.append(svg('polygon', { points: pkt(aussen), fill: art.hell, 'fill-opacity': '0.22', stroke: '#ffffff', 'stroke-opacity': '0.5', 'stroke-width': '1' }));
  // Innenkante (Dicke des Steins) und dunkle Randlinie
  k.append(svg('polygon', { points: pkt(art.umriss.map(([a, b]) => [a * 0.93, b * 0.93])), fill: 'none', stroke: '#ffffff', 'stroke-opacity': '0.28', 'stroke-width': '1.3' }));
  k.append(svg('polygon', { points: pkt(art.umriss), fill: 'none', stroke: art.dunkel, 'stroke-width': '2.4' }));
  // Glanzlicht links oben: weich, im Umriss abgeschnitten (den harten Lichtpunkt gibt das große Funkeln)
  const gx = m.x0 + m.b * 0.34, gy = m.y0 + m.h * 0.3, gb = Math.min(m.b, m.h);
  const glanz = svg('g', { 'clip-path': `url(#umriss-${id})` });
  glanz.append(svg('ellipse', { cx: gx.toFixed(1), cy: gy.toFixed(1), rx: (gb * 0.2).toFixed(1), ry: (gb * 0.085).toFixed(1), transform: `rotate(-35 ${gx.toFixed(1)} ${gy.toFixed(1)})`, fill: '#ffffff', 'fill-opacity': '0.6', filter: 'url(#weich)' }));
  k.append(glanz);
  // Funkeln: ein großes, ein kleines (wird bei richtiger Antwort und bei bewegtem Licht animiert)
  k.append(svg('path', { class: 'funkeln', d: 'M14 10 l1.2 3.8 l3.8 1.2 l-3.8 1.2 l-1.2 3.8 l-1.2 -3.8 l-3.8 -1.2 l3.8 -1.2 Z', fill: '#ffffff', 'fill-opacity': '0.6' }));
  k.append(svg('path', { class: 'funkeln', d: 'M-13 -27 l2.2 6.8 l6.8 2.2 l-6.8 2.2 l-2.2 6.8 l-2.2 -6.8 l-6.8 -2.2 l6.8 -2.2 Z', fill: '#ffffff', 'fill-opacity': '0.8' }));
  gr.append(k);
  return gr;
}

/**
 * Farbiges Licht, das durch einen Stein auf die Platte fällt: weicher Fleck in der Steinfarbe, ohne Kante,
 * leicht nach rechts unten versetzt (Licht von links oben). Bewusst kein .stein, blass und stark verwischt,
 * damit er nie wie ein zusätzlicher Stein aussieht. Gehört unter alle Steine.
 */
export function lichtfleck(sorte, x, y, g, dreh = 0) {
  const id = sorteOk(sorte), art = STEIN_ART[id], s = g / 84;
  const gr = svg('g', { transform: `translate(${(x + g * 0.13).toFixed(1)} ${(y + g * 0.18).toFixed(1)}) rotate(${dreh}) scale(${s})`, class: 'lichtfleck', 'data-sorte': sorte });
  gr.append(svg('polygon', { points: pkt(art.umriss), fill: art.farbe, 'fill-opacity': '0.6', filter: 'url(#fleck)' }));
  gr.append(svg('polygon', { points: pkt(art.umriss.map(([a, b]) => [a * 0.55, b * 0.55])), fill: art.hell, 'fill-opacity': '0.45', filter: 'url(#fleck)' }));
  return gr;
}

/** Milchglas-Platte: feine, ruhige Körnung (SVG-Rauschen), liegt über dem bewegten Licht und unter den Steinen. */
export function platte() {
  const f = svg('filter', { id: 'koernung', x: '0', y: '0', width: '100%', height: '100%' });
  f.append(svg('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.85', numOctaves: '3', stitchTiles: 'stitch', seed: '3' }),
    svg('feColorMatrix', { type: 'matrix', values: '1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1' }));
  return svg('svg', { class: 'platte', 'aria-hidden': 'true', focusable: 'false' }, [svg('defs', {}, [f]),
    svg('rect', { width: '100%', height: '100%', filter: 'url(#koernung)' })]);
}

/** Verläufe, Umrisse und Filter für alle Steine; einmal pro Seite in ein verstecktes SVG. */
export function defsEinbauen() {
  if (document.getElementById('stein-defs')) return;
  const defs = svg('defs');
  for (const [id, art] of Object.entries(STEIN_ART)) {
    // Körper: Mitte heller, Rand dunkel (Licht bricht am Rand weg wie bei echten Edelsteinen)
    const k = svg('radialGradient', { id: 'koerper-' + id, cx: '0.45', cy: '0.45', r: '0.62' });
    k.append(svg('stop', { offset: '0', 'stop-color': art.hell }), svg('stop', { offset: '0.45', 'stop-color': art.farbe }),
      svg('stop', { offset: '0.85', 'stop-color': art.farbe }), svg('stop', { offset: '1', 'stop-color': art.dunkel }));
    // Durchlicht von unten: helle Steinfarbe in der Mitte, etwas nach unten verschoben
    const d = svg('radialGradient', { id: 'durchlicht-' + id, cx: '0.52', cy: '0.58', r: '0.42' });
    d.append(svg('stop', { offset: '0', 'stop-color': art.hell, 'stop-opacity': '0.75' }), svg('stop', { offset: '0.55', 'stop-color': art.hell, 'stop-opacity': '0.25' }),
      svg('stop', { offset: '1', 'stop-color': art.hell, 'stop-opacity': '0' }));
    defs.append(k, d, svg('clipPath', { id: 'umriss-' + id }, [svg('polygon', { points: pkt(art.umriss) })]));
  }
  const sl = svg('linearGradient', { id: 'seitenlicht', x1: '0', y1: '0', x2: '1', y2: '1' });
  sl.append(svg('stop', { offset: '0', 'stop-color': '#ffffff', 'stop-opacity': '0.35' }), svg('stop', { offset: '0.45', 'stop-color': '#ffffff', 'stop-opacity': '0' }),
    svg('stop', { offset: '0.6', 'stop-color': '#000000', 'stop-opacity': '0' }), svg('stop', { offset: '1', 'stop-color': '#000000', 'stop-opacity': '0.3' }));
  defs.append(sl);
  const blur = (id, sd) => { const f = svg('filter', { id, x: '-50%', y: '-50%', width: '200%', height: '200%' }); f.append(svg('feGaussianBlur', { stdDeviation: sd })); return f; };
  defs.append(blur('schein', '4'), blur('fleck', '8'), blur('weich', '1.6'));
  document.body.append(svg('svg', { id: 'stein-defs', class: 'svg-defs', width: '0', height: '0', 'aria-hidden': 'true', focusable: 'false' }, [defs]));
}

// Amulette im Stil der Schnecken: schmaler Rahmen in einer flachen Materialfarbe, dicke Kontur,
// ein großer Stein, der sich mit jeder richtigen Antwort von unten mit Farbe füllt (5 Schritte).
// Bewusst wenig Details, damit es kindlich wirkt und auch klein klar bleibt.

// Materialien (eins pro Stufe, siehe aufgaben.js MATERIALIEN). glitzer: zweiter Funkelstern (höchste Stufe).
export const MATERIAL = {
  bronze:   { name: 'Bronze',   farbe: '#e9a56b' },
  silber:   { name: 'Silber',   farbe: '#e3e8f0' },
  gold:     { name: 'Gold',     farbe: '#ffd45e' },
  kristall: { name: 'Kristall', farbe: '#d6efff', glitzer: true },
};
const kreis = (n, rf) => Array.from({ length: n }, (_, i) => { const t = i / n * 2 * Math.PI - Math.PI / 2, r = rf(t); return [r * Math.cos(t), r * Math.sin(t)]; });
// Rahmenformen um die Mitte 0/0 (Radius etwa 36); der Stein hat etwa Radius 27, so bleibt ein schmaler Rand
export const FORM = {
  rund:     { name: 'Rund',     umriss: () => kreis(64, () => 36) },
  sechseck: { name: 'Sechseck', umriss: () => kreis(6, () => 40) },
  sonne:    { name: 'Sonne',    umriss: () => kreis(20, t => (Math.round((t + Math.PI / 2) / (Math.PI / 10)) % 2 ? 34 : 40)) },
  bluete:   { name: 'Blüte',    umriss: () => kreis(72, t => 35 + 4 * Math.cos(6 * (t + Math.PI / 2))) },
  schild:   { name: 'Schild',   umriss: () => [[-32, -30], [32, -30], [35, -27], [35, 6], [26, 24], [0, 39], [-26, 24], [-35, 6], [-35, -27]] },
  kissen:   { name: 'Kissen',   umriss: () => kreis(48, t => 35 / Math.pow(Math.pow(Math.abs(Math.cos(t)), 4) + Math.pow(Math.abs(Math.sin(t)), 4), 0.25)) },
};
let clipNr = 0;
const funkelstern = (x, y, g) => `M${x} ${y - 7 * g} L${x + 2 * g} ${y - 2 * g} L${x + 7 * g} ${y} L${x + 2 * g} ${y + 2 * g} L${x} ${y + 7 * g} L${x - 2 * g} ${y + 2 * g} L${x - 7 * g} ${y} L${x - 2 * g} ${y - 2 * g} Z`;

/**
 * Amulett: n Schritte bis voll; steine = schon gesammelte Steine (ihre Anzahl ist die Füllung).
 * form, material: das Modell (aufgaben.js MODELLE); stein: Sorte des großen Steins.
 * neu: gerade ein Stein dazugekommen (kleine Animation). umriss: nur gestrichelter Umriss (fehlendes Modell im Album).
 * viewBox -46 -58 92 100. Das SVG trägt data-fuellung (für Tests und Vorlesen).
 */
export function amulett(steine, n, { form = 'rund', material = 'gold', stein: sorte, neu = -1, klein = false, umriss = false } = {}) {
  const f = FORM[form] || FORM.rund, m = MATERIAL[material] || MATERIAL.gold;
  const fuellung = Math.min(n, steine.length);
  const s = svg('svg', { viewBox: '-46 -58 92 100', class: 'amulett' + (klein ? ' klein' : '') + (umriss ? ' umriss' : ''), 'aria-hidden': 'true', 'data-fuellung': String(fuellung) });
  const rahmen = f.umriss();
  if (umriss) {
    s.append(svg('polygon', { points: pkt(rahmen), fill: 'none', stroke: 'currentColor', 'stroke-width': '3', 'stroke-dasharray': '6 5', 'stroke-linejoin': 'round' }));
    return s;
  }
  const art = STEIN_ART[sorte] || STEIN_ART[steine[0]] || STEIN_ART.amethyst;
  // Band und Öse
  s.append(svg('path', { class: 'a-kontur', d: 'M-22 -58 Q0 -34 22 -58', fill: 'none', 'stroke-width': '2.2', 'stroke-linecap': 'round' }));
  s.append(svg('circle', { class: 'a-kontur', cx: 0, cy: -38, r: 4.5, fill: m.farbe, 'stroke-width': '2.5' }));
  // Rahmen
  s.append(svg('polygon', { class: 'a-kontur', points: pkt(rahmen), fill: m.farbe, 'stroke-width': '3', 'stroke-linejoin': 'round' }));
  // Großer Stein: blass, von unten mit Farbe gefüllt
  const g = art.umriss.map(([x, y]) => [x * 0.66, y * 0.66]);
  const gr = svg('g', { class: 'a-stein' + (neu >= 0 ? ' neu' : '') });
  gr.append(svg('polygon', { points: pkt(g), fill: '#ecebf3' }));
  if (fuellung > 0) {
    const id = 'fuell-' + (++clipNr);
    s.append(svg('clipPath', { id }, [svg('rect', { x: -32, y: (30 - 60 * fuellung / n).toFixed(1), width: 64, height: 64 })]));
    gr.append(svg('polygon', { points: pkt(g), fill: art.farbe, 'clip-path': `url(#${id})` }));
  }
  gr.append(svg('polygon', { points: pkt(g.map(([x, y]) => [x * 0.5, y * 0.5 - 2])), fill: '#ffffff', 'fill-opacity': '0.35' }));
  gr.append(svg('polygon', { class: 'a-kontur', points: pkt(g), fill: 'none', 'stroke-width': '3', 'stroke-linejoin': 'round' }));
  gr.append(svg('ellipse', { cx: -9, cy: -11, rx: 6, ry: 3.5, fill: '#ffffff', transform: 'rotate(-30 -9 -11)' }));
  s.append(gr);
  // Voll: Funkelstern (Kristall: zwei)
  if (fuellung >= n) {
    s.append(svg('path', { class: 'a-kontur funkeln', d: funkelstern(20, -17, 1), fill: '#ffffff', 'stroke-width': '1.2' }));
    if (m.glitzer) s.append(svg('path', { class: 'a-kontur funkeln', d: funkelstern(-22, 18, 0.7), fill: '#ffffff', 'stroke-width': '1' }));
  }
  return s;
}
