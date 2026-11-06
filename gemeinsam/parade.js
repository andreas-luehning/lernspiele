// Schneckenparade: Anzeige in den Spielen (Paradestreifen, Blatt-Plätze, Uhr, Rückblick).
// Namen und Texte immer mit textContent, SVG nur aus parade-bilder.js.

import { SCALE, STAGES, DECO, describe } from './parade-logik.js';
import { snailSVG, decoSVG, LEAF, HUT_ANZEIGE, svgElement } from './parade-bilder.js';

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

/** Drei Blatt-Plätze und die Hut-Anzeige. */
export function zeigeBlaetter(box, z) {
  if (!box.childElementCount) {
    for (let i = 0; i < 3; i++) { const s = el('span', 'slot'); s.append(svgElement(LEAF)); box.append(s); }
    box.append(svgElement(HUT_ANZEIGE));
  }
  [...box.querySelectorAll('.slot')].forEach((s, i) => {
    const an = i < z.leaves;
    if (an && !s.classList.contains('on')) { s.classList.add('on'); }
    else if (!an) s.classList.remove('on');
  });
  box.querySelector('.hatmark').classList.toggle('off', !z.cleanLeaves);
  box.setAttribute('aria-label', `${z.leaves} von 3 Salatblättern${z.cleanLeaves ? ', nächste Schnecke mit Hut' : ''}`);
}

/** Rückblick nach der Runde als Dialog. */
export function rueckblick({ neu, gewachsen, deko }, { gartenUrl }) {
  const d = el('dialog', 'rueckblick');
  d.append(el('h2', null, 'Für heute geschafft!'));
  const n = neu.length;
  d.append(el('p', null, n ? (n === 1 ? 'Ein neues Tier ist in den Garten gezogen.' : `${n} neue Tiere sind in den Garten gezogen.`) : 'Heute ist niemand Neues dazugekommen, aber deine Begleiter waren dabei.'));
  if (n) {
    const row = el('div', 'row');
    for (const t of neu) { const f = el('figure'); f.append(svgElement(snailSVG(t)), el('figcaption', null, t.name)); f.setAttribute('aria-label', describe(t)); row.append(f); }
    d.append(row);
  }
  if (gewachsen.length) {
    d.append(el('p', null, 'Gewachsen: ' + gewachsen.map(s => `${s.name} ist jetzt ${s.stage >= 3 ? 'eine Glitzerschnecke' : STAGES[s.stage]}`).join(', ') + '.'));
  }
  if (deko) {
    const row = el('div', 'row'); row.append(svgElement(decoSVG(deko))); d.append(row);
    d.append(el('p', null, `Für 5 Übungstage gibt es neu im Garten: ${DECO[deko]}.`));
  }
  d.append(el('p', 'note', 'Morgen geht die Parade weiter.'));
  const knoepfe = el('div', 'knoepfe');
  const garten = el('a', 'btn primary', 'Zum Garten'); garten.href = gartenUrl;
  const weiter = el('button', 'btn', 'Weiter üben'); weiter.type = 'button';
  weiter.addEventListener('click', () => { d.close(); d.remove(); });
  knoepfe.append(garten, weiter); d.append(knoepfe);
  document.body.append(d);
  d.showModal();
  return d;
}
