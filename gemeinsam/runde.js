// 5-Minuten-Runde, eine pro Tag. Verbindet die Uhr mit dem Zustand der Schneckenparade.
// Die Zeit läuft nach der Uhrzeit (Date.now), nicht nach gezählten Sekunden: So stimmt sie auch,
// wenn der Browser im Hintergrund Timer verlangsamt oder die Seite neu geladen wird.

import { ladeParade, speichereParade, rundeStarten, rundeBeenden, restzeit, kannHeuteSpielen, heute, RUNDE_MS, NACHSPIEL_MS } from './parade-logik.js';

/** Probe-Modus für Erwachsene: ?probe an der Adresse → Runde 1 Minute, Nachspiel 30 s. */
export const PROBE = new URLSearchParams(location.search).has('probe');

export class Runde {
  /**
   * @param {{onTick?:(rest:number, dauer:number)=>void, onZeitUm?:()=>void, onEnde?:(ergebnis:object)=>void}} opt
   */
  constructor({ onTick, onZeitUm, onEnde } = {}) {
    this.dauer = PROBE ? 60 * 1000 : RUNDE_MS;
    this.nachspiel = PROBE ? 30 * 1000 : NACHSPIEL_MS;
    this.onTick = onTick || (() => {}); this.onZeitUm = onZeitUm || (() => {}); this.onEnde = onEnde || (() => {});
    this.z = ladeParade();
    this.timer = setInterval(() => this.tick(), 500);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.tick(); });
  }

  speichern() { speichereParade(this.z); }
  get laeuft() { return !!this.z.runde; }
  get heuteMoeglich() { return kannHeuteSpielen(this.z, heute()); }
  get rest() { return this.laeuft ? restzeit(this.z) : (this.heuteMoeglich ? this.dauer : 0); }

  /** Erste Aktivität des Tages: Runde beginnen, falls heute noch keine war. */
  starten() {
    if (this.laeuft) return true;
    if (!rundeStarten(this.z, Date.now(), this.dauer, heute())) return false;
    this.speichern(); this.tick();
    return true;
  }

  tick() {
    const r = this.z.runde;
    if (r) {
      // Runde vom Vortag, die nie beendet wurde: jetzt abschließen
      if (r.tag && r.tag !== heute() && Date.now() > r.ende) return this.beenden();
      if (!r.zeitUm && Date.now() >= r.ende) { r.zeitUm = true; this.speichern(); this.onZeitUm(); }
      if (r.zeitUm && Date.now() >= r.ende + this.nachspiel) return this.beenden();
    }
    this.onTick(this.rest, this.dauer);
  }

  /** Eine Aufgabe ist abgeschlossen. War die Zeit schon um, endet jetzt die Runde. */
  aufgabeFertig() { if (this.z.runde && this.z.runde.zeitUm) this.beenden(); }

  beenden() {
    if (!this.z.runde) return;
    const ergebnis = rundeBeenden(this.z, heute());
    this.speichern();
    this.onTick(this.rest, this.dauer);
    this.onEnde(ergebnis);
  }
}

/** Restzeit als "4:59". */
export const uhrText = ms => { const s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
