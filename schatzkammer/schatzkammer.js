// Schatzkammer: angefangenes Amulett, alle fertigen Amulette, Sammelalbum aller Modelle (Form × Material).
// Liest den Leuchttisch-Speicher nur (über speicher.js, geprüft mit zustandPruefen) und verändert nichts.
import { lesen } from '../gemeinsam/speicher.js';
import { PROBE } from '../gemeinsam/probe.js';
import { STANDARD, STUFEN, FASSUNGEN, FORMEN, MATERIALIEN, MODELLE, gefundeneModelle, zustandPruefen } from '../leuchttisch/aufgaben.js';
import { amulett, defsEinbauen, FORM, MATERIAL } from '../leuchttisch/steine.js';

const $ = id => document.getElementById(id);
const el = (tag, klasse, text) => { const e = document.createElement(tag); if (klasse) e.className = klasse; if (text != null) e.textContent = text; return e; };
const z = zustandPruefen(lesen('leuchttisch', STANDARD));
window.addEventListener('pageshow', e => { if (e.persisted) location.reload(); }); // nie mit veraltetem Stand

defsEinbauen();
if (PROBE) $('b-spiel').href = '../leuchttisch/?probe';
const modellName = m => `${FORM[m.form].name}, ${MATERIAL[m.material].name}`;

// Angefangenes Amulett
$('jetzt').append(amulett(z.fassung, FASSUNGEN, z.modell));
const fehlt = FASSUNGEN - z.fassung.length;
$('jetzt-text').textContent = `${modellName(z.modell)}. ${fehlt === 1 ? 'Noch 1 Stein' : `Noch ${fehlt} Steine`}, dann ist es fertig.`;

// Fertige Amulette, neueste zuerst
const n = z.amulette.length;
$('anzahl').textContent = n === 0 ? 'Noch keine Amulette' : n === 1 ? '1 Amulett' : `${n} Amulette`;
const box = $('amulette');
if (!n) box.append(el('p', 'leer', 'Hier kommen deine fertigen Amulette hin. Jede richtige Antwort am Leuchttisch bringt einen Stein.'));
for (const a of [...z.amulette].reverse()) {
  const k = el('figure', 'karte');
  k.append(amulett(a.steine, a.steine.length, a), el('figcaption', null, modellName(a)));
  box.append(k);
}

// Album: alle Modelle, gefundene in Farbe, fehlende als Umriss
const da = gefundeneModelle(z.amulette);
$('album-zahl').textContent = `${da.size} von ${MODELLE.length} gefunden`;
$('album-balken').style.width = (da.size / MODELLE.length * 100) + '%';
// Eine Reihe pro Material, beschriftet mit der Stufe, aus der es kommt
const album = $('album');
for (const material of MATERIALIEN) {
  const stufe = STUFEN.find(s => s.material === material);
  album.append(el('h3', 'reihe', `${MATERIAL[material].name}${stufe ? ' · ' + stufe.name : ''}`));
  for (const form of FORMEN) {
    const hat = da.has(form + ':' + material);
    const k = el('figure', 'karte' + (hat ? '' : ' fehlt'));
    k.append(amulett([], FASSUNGEN, { form, material, umriss: !hat }), el('figcaption', null, hat ? FORM[form].name : '?'));
    album.append(k);
  }
}
