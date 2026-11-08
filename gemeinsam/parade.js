// Schneckenparade: Anzeige in den Spielen (Paradestreifen, Blatt-Plätze, Uhr, Rückblick).
// Namen und Texte immer mit textContent, SVG nur aus parade-bilder.js.

import { SCALE, STAGES, DECO, describe, BLAETTER_PRO_HUT } from './parade-logik.js';
import { snailSVG, decoSVG, hatSVG, LEAF, svgElement } from './parade-bilder.js';

/** Kopfbedeckung als kleines Bild (Ausschnitt um den Hut). */
export const hutBild = h => svgElement(`<svg viewBox="26 -10 56 40" aria-hidden="true">${hatSVG(h)}</svg>`);

const el = (tag, klasse, text) => { const e = document.createElement(tag); if (klasse) e.className = klasse; if (text != null) e.textContent = text; return e; };

/** Der Streifen mit den laufenden Schnecken und einer Sprechblase. */
export class ParadeStreifen {
  constructor(track) {
    this.track = track; this.els = new Map(); this.tiere = [];
    this.bubble = el('div', 'bubble'); this.bubble.setAttribute('aria-live', 'polite');
    track.append(this.bubble);
    new ResizeObserver(() => this.platzieren(false)).observe(track);
  }

  /** Tiere zeigen; neue kriechen von links herein. */
  zeige(tiere, animiert = true) {
    const ids = new Set(tiere.map(t => t.id));
    for (const [id, e] of this.els) if (!ids.has(id)) { e.remove(); this.els.delete(id); }
    this.tiere = tiere;
    this.platzieren(animiert);
  }

  platzieren(animiert) {
    const n = this.tiere.length, tw = this.track.clientWidth, th = this.track.clientHeight;
    if (!tw) return;
    const base = Math.min(th * 1.15, Math.max(48, 96 - Math.max(0, n - 6) * 5));
    const lead = tw - base - 12;
    const step = n > 1 ? Math.min(base * 0.9, (lead - 8) / (n - 1)) : 0;
    let x = lead;
    this.tiere.forEach((t, i) => {
      const w = base * (t.special === 'kaefer' ? 0.7 : SCALE[t.stage || 0]);
      let e = this.els.get(t.id);
      if (!e) {
        e = el('div', 'walker'); e.append(svgElement(snailSVG(t))); this.track.append(e); this.els.set(t.id, e);
        e.style.left = (-w - 10) + 'px'; void e.offsetWidth;
      }
      e.style.setProperty('--w', w + 'px'); e.style.zIndex = String(n - i);
      if (animiert) { e.classList.add('moving'); clearTimeout(e._t); e._t = setTimeout(() => e.classList.remove('moving'), 2400); }
      e.style.left = Math.max(4, x + (base - w)) + 'px';
      x -= step;
    });
  }

  sag(text) {
    this.bubble.textContent = text;
    this.bubble.classList.remove('pop'); void this.bubble.offsetWidth; this.bubble.classList.add('pop');
  }

  /** Alle ziehen nach rechts aus dem Bild (Ende der Runde). */
  ausziehen() {
    this.tiere.forEach((t, i) => {
      const e = this.els.get(t.id); if (!e) return;
      e.classList.add('moving'); e.style.transitionDelay = (i * 0.12) + 's'; e.style.left = (this.track.clientWidth + 40) + 'px';
    });
  }

  /** Ein Salatblatt fliegt vom Rechenweg zu den Blatt-Plätzen. */
  blattFliegt(vonEl, zuEl) {
    if (!vonEl || !zuEl || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const a = vonEl.getBoundingClientRect(), b = zuEl.getBoundingClientRect();
    const f = el('div', 'flyleaf'); f.append(svgElement(LEAF));
    f.style.left = (a.left + a.width / 2 - 17) + 'px'; f.style.top = (a.top + a.height / 2 - 17) + 'px';
    document.body.append(f);
    requestAnimationFrame(() => requestAnimationFrame(() => { f.style.left = b.left + 'px'; f.style.top = b.top + 'px'; f.style.opacity = '0.2'; }));
    setTimeout(() => f.remove(), 1000);
  }
}

/** Fünf Blatt-Plätze: Sind alle voll, kommt eine Kopfbedeckung in die Hutschachtel. */
export function zeigeBlaetter(box, z) {
  if (box.querySelectorAll('.slot').length !== BLAETTER_PRO_HUT) {
    box.replaceChildren();
    for (let i = 0; i < BLAETTER_PRO_HUT; i++) { const s = el('span', 'slot'); s.append(svgElement(LEAF)); box.append(s); }
  }
  [...box.querySelectorAll('.slot')].forEach((s, i) => s.classList.toggle('on', i < z.leaves));
  box.setAttribute('aria-label', `${z.leaves} von ${BLAETTER_PRO_HUT} Salatblättern bis zur nächsten Kopfbedeckung`);
}

/** Rückblick nach der Runde als Dialog. */
export function rueckblick({ neu, gewachsen, deko, huete = [], lernzeitUm = false }, { gartenUrl }) {
  const d = el('dialog', 'rueckblick');
  d.append(el('h2', null, 'Runde geschafft!'));
  const n = neu.length;
  d.append(el('p', null, n === 1 ? 'Für deine 5 Minuten kommt eine neue Schnecke in den Garten.' : `Für deine 5 Minuten kommen ${n} neue Tiere in den Garten.`));
  if (n) {
    const row = el('div', 'row');
    for (const t of neu) { const f = el('figure'); f.append(svgElement(snailSVG(t)), el('figcaption', null, t.name)); f.setAttribute('aria-label', describe(t)); row.append(f); }
    d.append(row);
  }
  if (huete.length) {
    const row = el('div', 'row huete');
    for (const h of huete) { const f = el('span', 'hut-bild'); f.append(hutBild(h)); row.append(f); }
    d.append(row);
    d.append(el('p', null, huete.length === 1 ? 'Für deinen Salat gibt es eine Kopfbedeckung. Sie liegt in der Hutschachtel im Garten.' : `Für deinen Salat gibt es ${huete.length} Kopfbedeckungen. Sie liegen in der Hutschachtel im Garten.`));
  }
  if (gewachsen.length) {
    d.append(el('p', null, 'Gewachsen: ' + gewachsen.map(s => `${s.name} ist jetzt ${s.stage >= 3 ? 'eine Glitzerschnecke' : STAGES[s.stage]}`).join(', ') + '.'));
  }
  if (deko) {
    const row = el('div', 'row'); row.append(svgElement(decoSVG(deko))); d.append(row);
    d.append(el('p', null, `Neu im Garten: ${DECO[deko]}.`));
  }
  d.append(el('p', 'note', lernzeitUm ? 'Deine Lernzeit für heute ist um. Schau doch mal in deinen Garten!' : 'Willst du noch eine Runde? Schreib einfach weiter.'));
  const knoepfe = el('div', 'knoepfe');
  const garten = el('a', 'btn primary', 'Zum Garten'); garten.href = gartenUrl;
  const weiter = el('button', 'btn', lernzeitUm ? 'Weiter üben' : 'Noch eine Runde'); weiter.type = 'button';
  weiter.addEventListener('click', () => { d.close(); d.remove(); });
  knoepfe.append(garten, weiter); d.append(knoepfe);
  document.body.append(d);
  d.showModal();
  return d;
}
