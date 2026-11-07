// App-Funktionen für alle Seiten: Service Worker anmelden, Installieren, Vollbild, Diagnose.
// Knöpfe werden über Attribute gefunden:
//   data-vollbild-knopf      schaltet Vollbild um (nur wo der Browser es erlaubt)
//   data-installieren-knopf  zeigt Chromes Installationsdialog (Android, Chrome/Edge am Rechner)
//   data-install-hinweis     Text: installiert? installierbar? Anleitung fürs iPad
//   data-diagnose-knopf / data-diagnose-ausgabe   Prüfung zum Abfotografieren bei Problemen
// Datenschutz: Nichts davon sendet Daten weg; die Diagnose zeigt nur Angaben dieses Geräts an.

import { einstellungen, setzeEinstellung } from './einstellungen.js';
import { PROBE, probeStarten, probeBeenden } from './probe.js';
import { alleLoeschen } from './speicher.js';

const SW_URL = new URL('../sw.js', import.meta.url);
const SCOPE = new URL('../', import.meta.url);
const alle = sel => document.querySelectorAll(sel);

export const istInstalliert = () =>
  matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const istApple = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/* ---------- Service Worker ---------- */
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register(SW_URL, { scope: SCOPE.pathname }).catch(() => {}));
}

/* ---------- Installieren ---------- */
let installEvent = null, installSignal = false;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvent = e; installSignal = true; installAnzeige(); });
window.addEventListener('appinstalled', () => { installEvent = null; installAnzeige('Installiert. Die App liegt jetzt auf dem Startbildschirm.'); });

function installAnzeige(text) {
  let t = text, knopf = false;
  if (!t) {
    if (istInstalliert()) t = 'Läuft als installierte App.';
    else if (installEvent) { t = 'Kann als App installiert werden. Dann startet sie im Vollbild und geht auch ohne Internet.'; knopf = true; }
    else if (istApple()) t = 'iPad/iPhone: In Safari unten oder oben auf das Teilen-Symbol (Quadrat mit Pfeil) tippen, dann „Zum Home-Bildschirm“. Die App startet dann ohne Browserleiste.';
    else t = 'Der Browser hat (noch) kein Installationssignal gegeben. In Chrome: Menü ⋮ → „App installieren“ oder „Zum Startbildschirm hinzufügen“. Sonst hilft die Diagnose.';
  }
  alle('[data-install-hinweis]').forEach(e => { e.textContent = t; });
  alle('[data-installieren-knopf]').forEach(e => { e.hidden = !knopf; });
}

document.addEventListener('click', async e => {
  if (e.target.closest('[data-installieren-knopf]')) {
    if (!installEvent) return;
    installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    installEvent = null;
    installAnzeige(outcome === 'accepted' ? 'Installation gestartet …' : 'Installation abgebrochen. Später geht es über das Browsermenü.');
  }
  if (e.target.closest('[data-vollbild-knopf]')) vollbildUmschalten();
  if (e.target.closest('[data-diagnose-knopf]')) diagnose();
  if (e.target.closest('[data-probe-knopf]')) {
    if (PROBE) probeBeenden(); else probeStarten();
    location.href = location.pathname; // ohne ?probe neu laden
  }
  if (e.target.closest('[data-probe-zuruecksetzen]')) {
    alleLoeschen(true); location.href = location.pathname;
  }
  if (e.target.closest('[data-alles-zuruecksetzen]')) {
    if (!confirm('Alles zurücksetzen? Garten, Schnecken, Runden und Einstellungen auf diesem Gerät werden gelöscht.')) return;
    if (!confirm('Wirklich? Das lässt sich nicht rückgängig machen.')) return;
    alleLoeschen(false); location.href = location.pathname;
  }
});

/* ---------- Vollbild ----------
   Im Browser endet das Vollbild beim Wechsel auf eine andere Seite (z. B. Startseite → Zehnerweg).
   Dauerhaftes Vollbild gibt es nur als installierte App. */
const vollbildElement = () => document.fullscreenElement || document.webkitFullscreenElement;
const vollbildMoeglich = () => !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
function vollbildUmschalten() {
  try {
    if (vollbildElement()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else {
      const el = document.documentElement;
      const r = (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
      if (r && r.catch) r.catch(() => {});
    }
  } catch (err) { /* nicht unterstützt */ }
}
function vollbildAnzeige() {
  const an = !!vollbildElement();
  alle('[data-vollbild-knopf]').forEach(k => {
    k.hidden = !vollbildMoeglich() || (istInstalliert() && !an);
    k.setAttribute('aria-pressed', String(an));
    const t = k.querySelector('[data-text]') || (k.childElementCount ? null : k);
    if (t) t.textContent = an ? 'Vollbild aus' : 'Vollbild';
    if (!t) k.setAttribute('aria-label', an ? 'Vollbild beenden' : 'Vollbild');
  });
}
document.addEventListener('fullscreenchange', vollbildAnzeige);
document.addEventListener('webkitfullscreenchange', vollbildAnzeige);

/* ---------- Diagnose ---------- */
function bildGroesse(src) {
  return new Promise(res => { const i = new Image(); i.onload = () => res(i.naturalWidth + '×' + i.naturalHeight); i.onerror = () => res('FEHLER'); i.src = src; });
}
async function diagnose() {
  const aus = document.querySelector('[data-diagnose-ausgabe]'); if (!aus) return;
  aus.hidden = false; const zeilen = [];
  const add = (k, v) => { zeilen.push(k + ': ' + v); aus.textContent = zeilen.join('\n'); };
  add('Adresse', location.origin + location.pathname);
  add('Browser', (navigator.userAgent.match(/(CriOS|Chrome|SamsungBrowser|Firefox|FxiOS|EdgA?|OPR|Version)\/[\d.]+/g) || ['?']).join(' '));
  add('Gerät', istApple() ? 'Apple (iPad/iPhone)' : (navigator.userAgent.match(/Android [\d.]+/) || ['anderes'])[0]);
  add('Modus', istInstalliert() ? 'installierte App' : 'Browser-Tab');
  add('Installationssignal', installSignal ? 'ja' : 'nein');
  add('HTTPS', location.protocol === 'https:' ? 'ja' : (location.hostname === 'localhost' ? 'localhost' : 'NEIN'));
  add('Vollbild möglich', vollbildMoeglich() ? 'ja' : 'nein');
  try {
    const reg = await navigator.serviceWorker.getRegistration(SCOPE.pathname);
    add('Service Worker', reg ? (reg.active ? 'aktiv' : 'registriert, nicht aktiv') + (navigator.serviceWorker.controller ? ', steuert Seite' : ', steuert Seite noch nicht') : 'KEINER');
    if (navigator.serviceWorker.controller) {
      const v = await new Promise(res => {
        const t = setTimeout(() => res('?'), 1500);
        navigator.serviceWorker.addEventListener('message', function h(ev) { if (ev.data && ev.data.version) { clearTimeout(t); navigator.serviceWorker.removeEventListener('message', h); res(ev.data.version); } });
        navigator.serviceWorker.controller.postMessage('version');
      });
      add('Version', v);
    }
  } catch (err) { add('Service Worker', 'FEHLER ' + err.message); }
  try {
    const link = document.querySelector('link[rel="manifest"]');
    const r = await fetch(link.href, { cache: 'no-store' });
    add('Manifest', r.status + ' ' + (r.headers.get('content-type') || ''));
    const m = await r.json();
    add('  display', m.display + ' (' + (m.display_override || []).join(', ') + ')');
    for (const ic of m.icons || []) add('  Symbol ' + ic.sizes + (ic.purpose ? ' ' + ic.purpose : ''), await bildGroesse(new URL(ic.src, link.href).href));
  } catch (err) { add('Manifest', 'FEHLER ' + err.message); }
}

/* ---------- Einstellungen (Schalter und Auswahl mit data-einstellung="name") ---------- */
function einstellungenAnzeigen() {
  const e = einstellungen();
  alle('[data-einstellung]').forEach(i => {
    const k = i.dataset.einstellung; if (!(k in e)) return;
    if (i.type === 'checkbox') { i.checked = !!e[k]; const t = i.nextElementSibling; if (t) t.textContent = i.checked ? 'an' : 'aus'; }
    else i.value = String(e[k]);
  });
}
document.addEventListener('change', e => {
  const i = e.target.closest && e.target.closest('[data-einstellung]');
  if (!i) return;
  const k = i.dataset.einstellung, alt = einstellungen();
  if (!(k in alt)) return;
  const wert = typeof alt[k] === 'boolean' ? i.checked : parseInt(i.value, 10);
  if (typeof wert === 'number' && !Number.isInteger(wert)) return;
  setzeEinstellung({ [k]: wert }); einstellungenAnzeigen();
});

/* ---------- Probe-Modus sichtbar machen ---------- */
function probeAnzeige() {
  document.documentElement.classList.toggle('probe', PROBE);
  if (PROBE && !document.querySelector('.probe-schild')) {
    const s = document.createElement('div'); s.className = 'probe-schild'; s.textContent = 'Probe-Modus'; s.setAttribute('role', 'status');
    document.body.append(s);
  }
  alle('[data-probe-knopf]').forEach(k => { k.textContent = PROBE ? 'Probe beenden' : 'Probe-Modus starten'; });
  alle('[data-probe-zuruecksetzen]').forEach(k => { k.hidden = !PROBE; });
  alle('[data-nur-echt]').forEach(k => { k.hidden = PROBE; });
}

/* ---------- Start ---------- */
const start = () => { installAnzeige(); vollbildAnzeige(); einstellungenAnzeigen(); probeAnzeige(); };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
