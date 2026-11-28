// Burgen: Stufen, Generator, Fragen, Anordnung, Antworten und Speicher, ohne DOM (direkt in Node testbar).
// Anordnung und Antworten aus prototypen/burgen.html (renderCastle, makeOptions). Der Generator ist seit 28.11.
// erweitert: Stufen, mehr Abwechslung, kein Muster aus den letzten 5 Burgen, keine „Raketen“. Regeln: docs/burgen.md.

export const PAL = ['#FF3D9A', '#22C973', '#2E9BFF', '#FFC400', '#FF6B1A', '#00C8C8'];
export const ROOF = '#FF3D5A';
export const B = 27, G = 1.5, CELL = B + G;
export const MERKEN = 5;                       // so viele letzte Muster kommen nicht wieder
export const UEBERRAGEN = 2;                   // die Mitte ist höchstens so viele Reihen höher als der höchste Turm

/** Stufen (Reihenfolge = Knöpfe oben). gleich: beide Türme gleich; fragen: ab und zu andere Fragen; versteckt: ein Turm unter einem Tuch. */
export const STUFEN = [
  { id: 'klein',     name: 'Klein',     min: 6,  max: 10, turm: [2, 3], mitte: [1, 4], gleich: true,  fragen: true },
  { id: 'gross',     name: 'Groß',      min: 10, max: 20, turm: [3, 6], mitte: [2, 8], gleich: true,  fragen: true },
  { id: 'ungleich',  name: 'Ungleich',  min: 8,  max: 15, turm: [2, 5], mitte: [1, 6], gleich: false },
  { id: 'versteckt', name: 'Versteckt', min: 8,  max: 16, turm: [2, 5], mitte: [1, 6], gleich: true,  versteckt: true },
];
/** Farben für die Frage „Wie viele … Bausteine?“ (Rosa nicht: zu nah am Rot der Dächer). */
export const FARBWORT = { '#22C973': 'grüne', '#2E9BFF': 'blaue', '#FFC400': 'gelbe', '#FF6B1A': 'orange', '#00C8C8': 'türkise' };

const rand = (a, b, r) => Math.floor(r() * (b - a + 1)) + a;
const shuffle = (a, r) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const istDach = t => ['dach', 'keil', 'keilV', 'dachW', 'keilW', 'kugel'].includes(t);
export const reihen = liste => liste.reduce((s, p) => s + p.rows, 0);

/** Turm aus k Teilen: unten beliebige Körper (höchstens zwei hohe), oben Dach, Keil oder Kugel. */
function turm(k, r) {
  const list = [];
  let hohe = 0;
  for (let i = 0; i < k - 1; i++) {
    const x = r();
    if (hohe < 2 && x < 0.5) { hohe++; list.push({ t: x < 0.22 ? 'zylinder' : x < 0.38 ? 'quaderV' : 'platteV', rows: 2 }); }
    else list.push({ t: 'wuerfel', rows: 1 });
  }
  const d = r();
  if (d < 0.35) list.push({ t: 'dach', rows: 1 });
  else if (d < 0.55) list.push({ t: 'keil', rows: 1, flip: r() < 0.5 });
  else if (d < 0.75) list.push({ t: 'keilV', rows: 2, flip: r() < 0.5 });
  else list.push({ t: 'kugel', rows: 1 });
  return list;
}
/**
 * Mitte aus k Teilen, höchstens maxRows Reihen hoch: unten Tor oder Quader, darüber Quader, Platten, Fenster;
 * oft ein breites Dach oder ein Keil. Wird es zu hoch, kommen flache Platten.
 */
function mitte(k, r, maxRows = 99) {
  const dach = k >= 2 && r() < 0.65, n = k - (dach ? 1 : 0), tor = r() < 0.4;
  const list = [tor ? { t: 'bogen', rows: 1, flip: false } : { t: 'quaderH', rows: 1 }];
  while (list.length < n) {
    const vor = list.at(-1).t, x = r();
    const platz = maxRows - reihen(list) - (dach ? 1 : 0) - (n - list.length - 1) * 0.5;   // was noch passt
    let teil;
    if (x < 0.2 && vor === 'quaderH') teil = { t: 'bogen', rows: 1, flip: true };                  // Fenster: Öffnung oben
    else if (x < 0.38 && vor !== 'platteH') teil = { t: 'platteH', rows: 0.5 };
    else teil = { t: 'quaderH', rows: 1 };
    list.push(teil.rows > platz ? { t: 'platteH', rows: 0.5 } : teil);
  }
  if (dach) list.push(r() < 0.7 ? { t: 'dachW', rows: 1 } : { t: 'keilW', rows: 1, flip: r() < 0.5 });
  const style = tor ? 'tor' : list.some(p => p.t === 'bogen') ? 'fenster' : 'mauer';
  return { style, list };
}
export const muster = c => c.parts.join('-');
/** Alle möglichen Muster (Turm links, Mitte, Turm rechts) einer Stufe. */
export function alleMuster(stufe) {
  const st = STUFEN[stufe] || STUFEN[0], liste = [];
  for (let tl = st.turm[0]; tl <= st.turm[1]; tl++) for (let tr = st.turm[0]; tr <= st.turm[1]; tr++) {
    if (st.gleich ? tl !== tr : tl === tr) continue;
    for (let m = st.mitte[0]; m <= st.mitte[1]; m++) {
      const total = tl + m + tr;
      if (total >= st.min && total <= st.max && m <= Math.max(tl, tr) + 3) liste.push({ tl, m, tr, total });   // sonst wird die Mitte zu hoch
    }
  }
  return liste;
}
export const merkLaenge = stufe => Math.min(MERKEN, Math.floor(alleMuster(stufe).length / 2));

/**
 * Neue Burg für eine Stufe: jede Anzahl der Stufe gleich wahrscheinlich.
 * verlauf: die bisherigen Burgen (neueste zuletzt). Kein Muster aus den letzten 5, nie zweimal dieselbe Anzahl hintereinander.
 */
export function neueBurg(stufe = 0, r = Math.random, verlauf = []) {
  const st = STUFEN[stufe] || STUFEN[0];
  // Merken: höchstens 5, bei wenigen Mustern (Stufe „Klein“ hat 7) die Hälfte, damit immer etwas übrig bleibt
  const letzte = verlauf.at(-1)?.total, alt = new Set(verlauf.slice(-merkLaenge(stufe)).map(muster));
  const suche = mitVerlauf => alleMuster(stufe).filter(x => !mitVerlauf || (x.total !== letzte && !alt.has(`${x.tl}-${x.m}-${x.tr}`)));
  let moeglich = suche(true);
  if (!moeglich.length) moeglich = suche(false);
  const anzahlen = [...new Set(moeglich.map(x => x.total))];
  const ziel = anzahlen[Math.floor(r() * anzahlen.length)];
  const passend = moeglich.filter(x => x.total === ziel);
  const { tl, m, tr, total } = passend[Math.floor(r() * passend.length)];
  const turmL = turm(tl, r), turmR = st.gleich ? turmL : turm(tr, r);
  const mid = mitte(m, r, Math.max(reihen(turmL), reihen(turmR)) + UEBERRAGEN);
  const [cT, cM] = shuffle(PAL, r).slice(0, 2);
  const mirror = r() < 0.6;                                 // Keile rechts gespiegelt = Spiegelsymmetrie
  return { stufe: st.id, turmL, turmR, mid, cT, cM, total, mirror, parts: [tl, m, tr], versteckt: !!st.versteckt };
}

/**
 * Frage zur Burg. Meist die ganze Burg; in Stufen mit fragen etwa jede vierte Burg „ein Turm“ oder „eine Farbe“.
 * Gibt { art: 'alle' | 'turm' | 'farbe', antwort, farbe?, wort? } zurück.
 */
export function frageWaehlen(c, r = Math.random) {
  const st = STUFEN.find(s => s.id === c.stufe) || STUFEN[0];
  if (st.fragen && r() < 0.25) {
    if (r() < 0.5) return { art: 'turm', antwort: c.parts[0] };
    const farben = [c.cT, c.cM].filter(f => FARBWORT[f]);
    if (farben.length) {
      const farbe = farben[Math.floor(r() * farben.length)];
      return { art: 'farbe', farbe, wort: FARBWORT[farbe], antwort: farbeZaehlen(c, farbe) };
    }
  }
  return { art: 'alle', antwort: c.total };
}
/** Wie viele Teile haben diese Farbe? (Dächer sind immer rot und zählen nicht mit.) */
export function farbeZaehlen(c, farbe) {
  return anordnen(c).teile.filter(t => t.farbe === farbe).length;
}

/**
 * Anordnung wie renderCastle im Prototyp: jedes Teil mit Lage (x, y, w, h), Farbe und Bereich
 * (0 = linker Turm, 1 = Mitte, 2 = rechter Turm), in Zählreihenfolge (links unten nach oben, Mitte, rechts).
 */
export function anordnen(c) {
  const rows = Math.max(reihen(c.turmL), reihen(c.turmR), reihen(c.mid.list));
  const gap = 6, midW = 2 * CELL - G;
  const W = 12 + B + gap + midW + gap + B + 12;
  const H = Math.ceil(rows * CELL) + 36, groundY = H - 6;   // +36: Kopffreiheit für Zählplaketten
  const teile = [];
  const stapel = (liste, x, w, farbe, bereich, spiegeln) => {
    let rr = 0;
    for (const p of liste) {
      const y = groundY - (rr + p.rows) * CELL + G, h = p.rows * CELL - G;
      const flip = spiegeln && (p.t === 'keil' || p.t === 'keilV') ? !p.flip : p.flip;
      teile.push({ t: p.t, x, y, w, h, flip: !!flip, farbe: istDach(p.t) ? ROOF : farbe, bereich });
      rr += p.rows;
    }
  };
  stapel(c.turmL, 12, B, c.cT, 0, false);
  stapel(c.mid.list, 12 + B + gap, midW, c.cM, 1, false);
  stapel(c.turmR, 12 + B + gap + midW + gap, B, c.cT, 2, c.mirror);   // rechter Turm: Keile gespiegelt
  return { W, H, groundY, teile };
}

/** Vier Antworten wie makeOptions im Prototyp: die richtige und nahe Nachbarn, alle mindestens 1. */
export function antworten(total, r = Math.random) {
  const set = new Set([total]);
  for (const c of shuffle([total + 1, total - 1, total + 2, total - 2, total + 3], r)) { if (set.size >= 4) break; if (c > 0) set.add(c); }
  while (set.size < 4) set.add(rand(6, 20, r));
  return shuffle([...set], r);
}

/* ---------- Speicher: gewählte Stufe und Statistik je Stufe (vorläufig statt Belohnung) ---------- */
export const STANDARD = { geloest: 0, gleichRichtig: 0, mitHilfe: 0, fehlversuche: 0 };
export const SPEICHER_STANDARD = { stufe: 0, stat: {} };
/** Nur nicht-negative ganze Zahlen übernehmen. */
export function statistikPruefen(z) {
  const aus = {};
  for (const k of Object.keys(STANDARD)) aus[k] = Number.isInteger(z?.[k]) && z[k] >= 0 ? z[k] : 0;
  return aus;
}
/** Gespeicherten Zustand prüfen: gültige Stufe, für jede Stufe eine saubere Statistik, sonst nichts. */
export function zustandPruefen(z) {
  const stufe = Number.isInteger(z?.stufe) && z.stufe >= 0 && z.stufe < STUFEN.length ? z.stufe : 0;
  const stat = {};
  for (const st of STUFEN) stat[st.id] = statistikPruefen(z?.stat && typeof z.stat === 'object' ? z.stat[st.id] : null);
  return { stufe, stat };
}
/** Eine Burg gelöst: gleich richtig nur ohne Fehlversuch und ohne „Zeig mir's“. */
export function geloestZaehlen(stat, { fehler, hilfe }) {
  stat.geloest++;
  if (hilfe) stat.mitHilfe++;
  if (!fehler && !hilfe) stat.gleichRichtig++;
  return stat;
}
