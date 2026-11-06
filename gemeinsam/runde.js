// 5-Minuten-Runde, mehrere pro Tag (Einstellung für Erwachsene). Verbindet die Uhr mit dem Zustand der Schneckenparade.
// Die Zeit läuft nach der Uhrzeit (Date.now), nicht nach gezählten Sekunden: So stimmt sie auch,
// wenn der Browser im Hintergrund Timer verlangsamt oder die Seite neu geladen wird.
// Die Uhr hält an, wenn die App verlassen wird oder eine Minute niemand schreibt; der nächste Strich setzt fort.

import {
  ladeParade, speichereParade, rundeStarten, rundeBeenden, restzeit, kannHeuteSpielen, nochRunden,
  pausieren, fortsetzen, pausiert, heute, RUNDE_MS, NACHSPIEL_MS,
} from './parade-logik.js';
import { einstellungen } from './einstellungen.js';

/** Probe-Modus für Erwachsene: ?probe an der Adresse → Runde 1 Minute, Nachspiel 30 s, Pause nach 20 s. */
export const PROBE = new URLSearchParams(location.search).has('probe');
const RUHE_MS = PROBE ? 20 * 1000 : 60 * 1000; // so lange ohne Strich, dann Pause

export class Runde {
  /**
   * @param {{onTick?:(rest:number, dauer:number, pause:boolean)=>void, onZeitUm?:()=>void, onEnde?:(ergebnis:object)=>void, onPause?:()=>void}} opt
   */
  constructor({ onTick, onZeitUm, onEnde, onPause } = {}) {
    this.dauer = PROBE ? 60 * 1000 : RUNDE_MS;
    this.nachspiel = PROBE ? 30 * 1000 : NACHSPIEL_MS;
    this.onTick = onTick || (() => {}); this.onZeitUm = onZeitUm || (() => {}); this.onEnde = onEnde || (() => {}); this.onPause = onPause || (() => {});
    this.z = ladeParade();
    this.letzteAktivitaet = Date.now();
    this.timer = setInterval(() => this.tick(), 500);
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.anhalten(); else this.tick(); });
    window.addEventListener('pagehide', () => this.anhalten());
  }

  get max() { return einstellungen().rundenProTag; }
  speichern() { speichereParade(this.z); }
  get laeuft() { return !!this.z.runde; }
  get pausiert() { return pausiert(this.z); }
  get heuteMoeglich() { return kannHeuteSpielen(this.z, heute(), this.max); }
  /** Runden, die heute nach der laufenden noch gehen */
  get nochRunden() { return nochRunden(this.z, heute(), this.max) - (this.laeuft ? 1 : 0); }
  get rest() { return this.laeuft ? restzeit(this.z) : (this.heuteMoeglich ? this.dauer : 0); }

  /** Jemand schreibt: Runde beginnen (falls heute noch eine geht) oder nach einer Pause fortsetzen. */
  aktivitaet() {
    this.letzteAktivitaet = Date.now();
    if (this.laeuft) { if (fortsetzen(this.z)) { this.speichern(); this.tick(); return 'weiter'; } return 'laeuft'; }
    if (!rundeStarten(this.z, Date.now(), this.dauer, heute(), this.max)) return null;
    this.speichern(); this.tick();
    return 'neu';
  }

  anhalten() {
    if (pausieren(this.z)) { this.speichern(); this.onTick(this.rest, this.dauer, true); this.onPause(); }
  }

  tick() {
    const r = this.z.runde;
    if (r) {
      // Runde vom Vortag, die nie beendet wurde: jetzt abschließen
      if (r.tag && r.tag !== heute() && (r.pause != null || Date.now() > r.ende)) return this.beenden();
      if (r.pause == null) {
        if (!r.zeitUm && Date.now() - this.letzteAktivitaet > RUHE_MS) this.anhalten();
        else if (!r.zeitUm && Date.now() >= r.ende) { r.zeitUm = true; this.speichern(); this.onZeitUm(); }
        else if (r.zeitUm && Date.now() >= r.ende + this.nachspiel) return this.beenden();
      }
    }
    this.onTick(this.rest, this.dauer, this.pausiert);
  }

  /** Eine Aufgabe ist abgeschlossen. War die Zeit schon um, endet jetzt die Runde. */
  aufgabeFertig() { if (this.z.runde && this.z.runde.zeitUm) this.beenden(); }

  beenden() {
    if (!this.z.runde) return;
    const ergebnis = rundeBeenden(this.z, heute());
    this.speichern();
    ergebnis.nochRunden = this.nochRunden;
    this.onTick(this.rest, this.dauer, false);
    this.onEnde(ergebnis);
  }
}

/** Restzeit als "4:59". */
export const uhrText = ms => { const s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
