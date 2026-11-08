// Schneckenparade: Figuren als SVG aus Teilen (Körper, Haus, Muster, Hut, Glitzer), Käfer, Deko, Salatblatt.
// Übernommen aus prototypen/schneckenparade.html. Die SVG-Texte enthalten nur feste Formen und Werte aus den
// Listen in parade-logik.js, nie Namen oder andere freie Texte (die werden immer mit textContent gesetzt).

import { COLORS, DECO } from './parade-logik.js';

let uid = 0;
const L = '#1d2747';
const STAR = 'M0 -6 L1.8 -1.9 L6 -1.9 L2.6 0.8 L3.8 5 L0 2.5 L-3.8 5 L-2.6 0.8 L-6 -1.9 L-1.8 -1.9Z';
const HEART = 'M0 4 C-6 0 -6 -5 -3 -5 C-1.5 -5 0 -4 0 -2.5 C0 -4 1.5 -5 3 -5 C6 -5 6 0 0 4Z';

export const LEAF = `<svg viewBox="0 0 30 30" aria-hidden="true"><path class="lf" d="M5 25 C4 13 12 4 26 4 C26 18 17 26 5 25Z"/><path d="M6 24 L20 10" stroke="${L}" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>`;

function patternSVG(p) {
  const W = 'fill="#fff" fill-opacity=".75"';
  if (p === 'punkte') return [[40, 36], [62, 32], [72, 52], [44, 62], [60, 70], [32, 52], [54, 48]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.2" ${W}/>`).join('');
  if (p === 'streifen') return [28, 44, 60, 76].map(x => `<rect x="${x}" y="20" width="7" height="70" ${W} transform="rotate(18 54 52)"/>`).join('');
  if (p === 'sterne') return [[40, 36], [66, 38], [70, 62], [40, 64], [54, 52]].map(([x, y]) => `<path d="${STAR}" transform="translate(${x} ${y})" ${W}/>`).join('');
  if (p === 'herzen') return [[40, 38], [66, 36], [70, 62], [40, 64], [54, 52]].map(([x, y]) => `<path d="${HEART}" transform="translate(${x} ${y}) scale(1.1)" ${W}/>`).join('');
  if (p === 'wellen') return [32, 44, 56, 68].map(y => `<path d="M20 ${y} q8 -6 16 0 t16 0 t16 0 t16 0 t16 0" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="3.5"/>`).join('');
  return '';
}

export function hatSVG(h) {
  const S = `stroke="${L}" stroke-width="2" stroke-linejoin="round"`;
  const g = s => `<g transform="translate(54 25)">${s}</g>`;
  switch (h) {
    case 'krone': return g(`<path d="M-16 1 L-16 -16 L-8 -7 L0 -21 L8 -7 L16 -16 L16 1Z" fill="#ffcc33" ${S}/><circle cx="0" cy="-6" r="2.6" fill="#ff4f87"/>`);
    case 'zylinder': return g(`<rect x="-11" y="-26" width="22" height="24" rx="2" fill="#333a55" ${S}/><rect x="-11" y="-9" width="22" height="5" fill="#ff4f87"/><rect x="-19" y="-3" width="38" height="5" rx="2.5" fill="#333a55" ${S}/>`);
    case 'blumen': return g([[-19, -1, '#ff6f9b'], [-10, -7, '#ffd447'], [0, -9, '#7cc8ff'], [10, -7, '#b79bff'], [19, -1, '#ff9ec4']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="5.5" fill="${c}" ${S}/><circle cx="${x}" cy="${y}" r="1.8" fill="#fff"/>`).join(''));
    case 'pirat': return g(`<path d="M-24 0 Q-12 -24 0 -20 Q12 -24 24 0 Q0 -8 -24 0Z" fill="#2a2f45" ${S}/><circle cx="0" cy="-11" r="3.4" fill="#fff"/>`);
    case 'zipfel': return g(`<path d="M-16 1 Q-6 -10 8 -30 Q12 -12 16 1Z" fill="#e5484d" ${S}/><rect x="-18" y="-3" width="36" height="6" rx="3" fill="#fff" ${S}/><circle cx="8" cy="-30" r="5" fill="#fff" ${S}/>`);
    case 'party': return g(`<path d="M-12 1 L0 -30 L12 1Z" fill="#7cc8ff" ${S}/><circle cx="-3" cy="-9" r="2.2" fill="#ffd447"/><circle cx="4" cy="-16" r="2.2" fill="#ff6f9b"/><circle cx="0" cy="-3" r="2.2" fill="#fff"/><circle cx="0" cy="-31" r="4" fill="#ffd447" ${S}/>`);
    case 'schleife': return g(`<path d="M0 -8 L-18 -18 L-18 2 Z M0 -8 L18 -18 L18 2Z" fill="#ff6f9b" ${S}/><circle cx="0" cy="-8" r="5" fill="#ff9ec4" ${S}/>`);
    case 'koch': return g(`<rect x="-11" y="-12" width="22" height="13" fill="#fff" ${S}/><circle cx="-9" cy="-16" r="8" fill="#fff" ${S}/><circle cx="9" cy="-16" r="8" fill="#fff" ${S}/><circle cx="0" cy="-21" r="9" fill="#fff" ${S}/><rect x="-10" y="-11" width="20" height="10" fill="#fff"/>`);
    case 'bommel': return g(`<path d="M-16 1 Q-16 -21 0 -21 Q16 -21 16 1Z" fill="#4cc26a" ${S}/><path d="M-8 -19 L-8 -4 M0 -21 L0 -4 M8 -19 L8 -4" stroke="#3aa65a" stroke-width="2"/><rect x="-18" y="-5" width="36" height="7" rx="3" fill="#fff" ${S}/><circle cx="0" cy="-24" r="5.5" fill="#fff" ${S}/>`);
    case 'sonne': return g(`<ellipse cx="0" cy="-1" rx="27" ry="6" fill="#f2c189" ${S}/><path d="M-12 -2 Q-12 -17 0 -17 Q12 -17 12 -2Z" fill="#f2c189" ${S}/><rect x="-12" y="-7" width="24" height="4" fill="#ff6f9b"/><circle cx="9" cy="-6" r="3" fill="#ffd447" ${S}/>`);
    case 'zauber': return g(`<ellipse cx="0" cy="0" rx="20" ry="4" fill="#6b5bd6" ${S}/><path d="M-13 -1 L5 -33 L13 -1Z" fill="#6b5bd6" ${S}/><path d="${STAR}" transform="translate(3 -15) scale(.75)" fill="#ffd447"/><circle cx="-4" cy="-6" r="1.6" fill="#ffd447"/>`);
    case 'kapitaen': return g(`<path d="M-15 -2 Q-16 -19 0 -19 Q16 -19 15 -2Z" fill="#fff" ${S}/><rect x="-15" y="-6" width="30" height="5" fill="#2a2f45"/><path d="M-4 0 Q8 4 19 -1 L18 2 Q8 7 -4 3Z" fill="#2a2f45" ${S}/><path d="M0 -15 L0 -9 M-3 -12 L3 -12 M-3 -9 Q0 -7 3 -9" stroke="#ffcc33" stroke-width="1.6" fill="none" stroke-linecap="round"/>`);
    case 'kopfhoerer': return g(`<path d="M-18 4 Q-19 -23 0 -23 Q19 -23 18 4" fill="none" stroke="#1d2747" stroke-width="4" stroke-linecap="round"/><rect x="-25" y="-4" width="11" height="15" rx="5" fill="#ff6f9b" ${S}/><rect x="14" y="-4" width="11" height="15" rx="5" fill="#ff6f9b" ${S}/>`);
    case 'cowboy': return g(`<path d="M-27 -2 Q-22 5 0 4 Q22 5 27 -2 Q24 6 0 8 Q-24 6 -27 -2Z" fill="#a66b3a" ${S}/><path d="M-13 2 Q-15 -18 -6 -17 Q0 -12 6 -17 Q15 -18 13 2Z" fill="#c98a4b" ${S}/><rect x="-13" y="-4" width="26" height="3" fill="#7a4a24"/>`);
  }
  return '';
}

export function bugSVG() {
  return `<svg viewBox="0 0 130 100" aria-hidden="true">
  <path d="M100 48 L110 28 M108 52 L122 36" stroke="${L}" stroke-width="2.4" stroke-linecap="round"/><circle cx="110" cy="27" r="3.5" fill="${L}"/><circle cx="122" cy="35" r="3.5" fill="${L}"/>
  <circle cx="98" cy="62" r="15" fill="${L}"/><circle cx="102" cy="58" r="3.5" fill="#fff"/><circle cx="103" cy="58" r="1.6" fill="${L}"/>
  <ellipse cx="60" cy="62" rx="36" ry="27" fill="#e5484d" stroke="${L}" stroke-width="2.6"/>
  <path d="M60 35 L60 89" stroke="${L}" stroke-width="2.4"/>
  ${[[44, 52, 6], [46, 73, 5], [76, 52, 6], [74, 73, 5], [34, 63, 4], [86, 63, 4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${L}"/>`).join('')}
  <path d="M40 88 l-4 6 M60 89 l0 7 M80 88 l4 6" stroke="${L}" stroke-width="2.4" stroke-linecap="round"/></svg>`;
}

export function snailSVG(s) {
  if (s.special === 'kaefer') return bugSVG();
  const id = 'sn' + (uid++);
  const col = COLORS[s.color].fill;
  const glitter = s.stage >= 3;
  let defs = `<clipPath id="c${id}"><circle cx="54" cy="52" r="29"/></clipPath>`, fill = col, extra = '';
  if (s.special === 'regenbogen') {
    defs += `<linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1">${['#ff6f9b', '#ffad66', '#ffd447', '#7fe0b8', '#7cc8ff', '#b79bff'].map((c, i) => `<stop offset="${i / 5}" stop-color="${c}"/>`).join('')}</linearGradient>`;
    fill = `url(#g${id})`;
  } else if (glitter) {
    defs += `<radialGradient id="g${id}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="${col}"/><stop offset="1" stop-color="${col}"/></radialGradient>`;
    fill = `url(#g${id})`;
  }
  if (glitter) extra = [[30, 26, .8], [84, 34, 1], [80, 74, .7], [24, 70, .9]].map(([x, y, k]) => `<path d="${STAR}" transform="translate(${x} ${y}) scale(${k})" fill="#ffd447" stroke="${L}" stroke-width=".8"/>`).join('');
  return `<svg viewBox="0 0 130 100" aria-hidden="true"><defs>${defs}</defs>
  <path class="sn-body" d="M8 86 Q6 76 20 76 L92 76 Q100 76 102 66 L104 50 Q106 36 116 37 Q127 39 125 54 L121 72 Q117 89 96 89 L16 89 Q8 89 8 86Z" stroke="${L}" stroke-width="2.4"/>
  <path d="M111 41 L105 17 M119 42 L123 19" stroke="${L}" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="105" cy="15" r="5.5" fill="#fff" stroke="${L}" stroke-width="2"/><circle cx="123" cy="17" r="5.5" fill="#fff" stroke="${L}" stroke-width="2"/>
  <circle cx="106.5" cy="15.5" r="2.4" fill="${L}"/><circle cx="124.5" cy="17.5" r="2.4" fill="${L}"/>
  <path d="M112 58 Q117 63 122 57" fill="none" stroke="${L}" stroke-width="2.2" stroke-linecap="round"/>
  <circle class="sn-cheek" cx="110" cy="53" r="3.2"/>
  <circle cx="54" cy="52" r="29" fill="${fill}" stroke="${L}" stroke-width="2.6"/>
  <g clip-path="url(#c${id})">${patternSVG(s.pattern)}</g>
  <path d="M54 52 a4 4 0 1 1 6 3 a9 9 0 1 1 -14 -9 a15 15 0 1 1 22 16 a21 21 0 1 1 -31 -24" fill="none" stroke="${L}" stroke-opacity=".35" stroke-width="2.6" stroke-linecap="round"/>
  ${extra}${s.hat ? hatSVG(s.hat) : ''}</svg>`;
}

export function decoSVG(d) {
  const S = `stroke="${L}" stroke-width="2" stroke-linejoin="round"`;
  const v = b => `<svg viewBox="0 0 60 60" aria-label="${DECO[d]}" role="img">${b}</svg>`;
  switch (d) {
    case 'pilz': return v(`<rect x="24" y="30" width="12" height="24" rx="5" fill="#fff4dc" ${S}/><path d="M6 32 Q8 8 30 8 Q52 8 54 32Z" fill="#e5484d" ${S}/><circle cx="20" cy="20" r="4" fill="#fff"/><circle cx="36" cy="16" r="3" fill="#fff"/><circle cx="42" cy="26" r="3.5" fill="#fff"/>`);
    case 'blume': return v(`<path d="M30 56 L30 28" stroke="#3aa65a" stroke-width="4"/><path d="M30 46 Q18 40 16 48 Q24 52 30 46Z" fill="#4cc26a" ${S}/>${[0, 72, 144, 216, 288].map(a => `<circle cx="${30 + 10 * Math.cos(a * Math.PI / 180)}" cy="${20 + 10 * Math.sin(a * Math.PI / 180)}" r="7" fill="#ff9ec4" ${S}/>`).join('')}<circle cx="30" cy="20" r="6" fill="#ffd447" ${S}/>`);
    case 'teich': return v(`<ellipse cx="30" cy="44" rx="27" ry="12" fill="#7cc8ff" ${S}/><path d="M18 42 a7 4 0 1 0 12 0 l-6 -1Z" fill="#4cc26a" ${S}/><circle cx="40" cy="44" r="3" fill="#ff9ec4"/>`);
    case 'bank': return v(`<rect x="6" y="26" width="48" height="8" rx="2" fill="#c98a4b" ${S}/><rect x="6" y="38" width="48" height="6" rx="2" fill="#c98a4b" ${S}/><path d="M12 44 L12 56 M48 44 L48 56" stroke="${L}" stroke-width="4"/>`);
    case 'kanne': return v(`<path d="M14 26 L40 26 L42 54 L12 54Z" fill="#7cc8ff" ${S}/><path d="M40 32 L56 18" stroke="${L}" stroke-width="5" stroke-linecap="round"/><path d="M40 32 L56 18" stroke="#7cc8ff" stroke-width="2.5" stroke-linecap="round"/><path d="M18 26 Q27 12 36 26" fill="none" ${S}/>`);
    case 'hotel': return v(`<path d="M8 28 L30 8 L52 28Z" fill="#e5484d" ${S}/><rect x="12" y="28" width="36" height="28" fill="#f2c189" ${S}/><circle cx="22" cy="38" r="4" fill="${L}"/><circle cx="38" cy="38" r="4" fill="${L}"/><circle cx="30" cy="50" r="4" fill="${L}"/>`);
  }
  return '';
}


/** SVG-Text als Element erzeugen (statt innerHTML auf bestehenden Elementen mit Text). */
export function svgElement(text) {
  const t = document.createElement('template'); t.innerHTML = text.trim();
  return t.content.firstElementChild;
}
