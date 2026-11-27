// 5-Minuten-Runde. Verbindet die Uhr mit der Schneckenparade und der gemeinsamen Lernzeit (lernzeit.js).
// Die Zeit läuft nach der Uhrzeit (Date.now), nicht nach gezählten Sekunden: So stimmt sie auch,
// wenn der Browser im Hintergrund Timer verlangsamt oder die Seite neu geladen wird.
// Die Uhr hält an, wenn die App verlassen wird oder eine Minute niemand schreibt; der nächste Strich setzt fort.
// Eine neue Runde beginnt nur, wenn heute noch Lernzeit übrig ist. Sonst ist freies Üben ohne Belohnung.

import {
  ladeParade, speichereParade, rundeStarten, rundeBeenden, restzeit, pausieren, fortsetzen, pausiert,
  heute, RUNDE_MS, NACHSPIEL_MS,
} from './parade-logik.js';
import { lernzeitRest, lernzeitZaehlen, lernzeitUm } from './lernzeit.js';
import { PROBE } from './probe.js';
export { PROBE };
// Probe-Modus (siehe probe.js): Runde 1 Minute, Nachspiel 30 s, Pause nach 20 s, Lernzeit fünfmal kürzer.
const RUHE_MS = PROBE ? 20 * 1000 : 60 * 1000; // so lange ohne Strich, dann Pause
const PARADE_SPEICHER = { laden: ladeParade, speichern: speichereParade, beenden: rundeBeenden };

export class Runde {
  /**
   * @param {{onTick?:(rest:number, dauer:number, pause:boolean)=>void, onZeitUm?:()=>void, onEnde?:(ergebnis:object)=>void, onPause?:()=>void, darfEnden?:()=>boolean,
   *   speicher?:{laden:()=>object, speichern:(z:object)=>void, beenden:(z:object, tag:string)=>object}}} opt
   * speicher: Wo der Rundenstand liegt und was am Ende passiert. Standard ist die Schneckenparade (eine Schnecke pro Runde).
   * Andere Spielwelten (z. B. der Leuchttisch) geben ihren eigenen Speicher mit; die Lernzeit ist für alle dieselbe.
   * darfEnden: Ist die Zeit um, endet die Runde erst, wenn das stimmt (z. B. genug richtige Aufgaben für die Schnecke);
   * spätestens nach dem Nachspiel endet sie trotzdem, dann ohne Belohnung.
   */
  constructor({ onTick, onZeitUm, onEnde, onPause, darfEnden, speicher = PARADE_SPEICHER } = {}) {
    this.sp = speicher;
    this.darfEnden = darfEnden || (() => true);
    this.dauer = PROBE ? 60 * 1000 : RUNDE_MS;
    this.nachspiel = PROBE ? 30 * 1000 : NACHSPIEL_MS;
    this.onTick = onTick || (() => {}); this.onZeitUm = onZeitUm || (() => {}); this.onEnde = onEnde || (() => {}); this.onPause = onPause || (() => {});
    this.z = this.sp.laden();
    this.letzteAktivitaet = Date.now();
    this.gezaehltBis = Date.now(); // bis wann die Übungszeit schon zur Lernzeit gerechnet ist
    this.timer = setInterval(() => this.tick(), 500);
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.anhalten(); else this.tick(); });
    window.addEventListener('pagehide', () => this.anhalten());
    // Kommt die Seite aus dem Zwischenspeicher des Browsers zurück (z. B. „Zurück“ aus dem Garten),
    // könnte der Stand veraltet sein (Hut im Garten geändert). Dann frisch laden statt alten Stand zu speichern.
    window.addEventListener('pageshow', e => { if (e.persisted) location.reload(); });
  }

  speichern() { this.sp.speichern(this.z); }
  get laeuft() { return !!this.z.runde; }
  get pausiert() { return pausiert(this.z); }
  /** Kann eine neue Runde beginnen (heute noch Lernzeit übrig)? */
  get heuteMoeglich() { return this.laeuft || !lernzeitUm(); }
  get lernzeitUm() { return lernzeitUm(); }
  get rest() { return this.laeuft ? restzeit(this.z) : (this.heuteMoeglich ? this.dauer : 0); }

  /** Laufende Übungszeit seit dem letzten Mal zur Lernzeit rechnen (nur bis zum Ende der 5 Minuten, nicht in der Pause). */
  zaehlen() {
    const r = this.z.runde, jetzt = Date.now();
    if (r && r.pause == null) {
      const bis = Math.min(jetzt, r.ende);
      if (bis > this.gezaehltBis) lernzeitZaehlen(bis - this.gezaehltBis);
    }
    this.gezaehltBis = jetzt;
  }

  /** Jemand schreibt: Runde beginnen (falls Lernzeit übrig) oder nach einer Pause fortsetzen. */
  aktivitaet() {
    this.letzteAktivitaet = Date.now();
    if (this.laeuft) {
      if (fortsetzen(this.z, Date.now(), heute())) { this.gezaehltBis = Date.now(); this.speichern(); this.tick(); return 'weiter'; }
      return 'laeuft';
    }
    if (lernzeitUm()) return null; // freies Üben
    // Ist weniger als eine ganze Runde übrig, wird die Runde entsprechend kürzer
    rundeStarten(this.z, Date.now(), Math.min(this.dauer, lernzeitRest()), heute());
    this.gezaehltBis = Date.now();
    this.speichern(); this.tick();
    return 'neu';
  }

  anhalten() {
    this.zaehlen();
    if (pausieren(this.z)) { this.speichern(); this.onTick(this.rest, this.dauer, true); this.onPause(); }
  }

  tick() {
    this.zaehlen();
    const r = this.z.runde;
    if (r && r.pause == null) {
      if (!r.zeitUm && Date.now() - this.letzteAktivitaet > RUHE_MS) this.anhalten();
      else if (!r.zeitUm && Date.now() >= r.ende) { r.zeitUm = true; this.speichern(); this.onZeitUm(); }
      else if (r.zeitUm && Date.now() >= r.ende + this.nachspiel) return this.beenden();
    }
    this.onTick(this.rest, this.dauer, this.pausiert);
  }

  /** Eine Aufgabe ist abgeschlossen. War die Zeit schon um, endet jetzt die Runde. */
  aufgabeFertig() { if (this.z.runde && this.z.runde.zeitUm && this.darfEnden()) this.beenden(); }

  beenden() {
    if (!this.z.runde) return;
    this.zaehlen();
    const ergebnis = this.sp.beenden(this.z, heute());
    this.speichern();
    ergebnis.lernzeitUm = lernzeitUm();
    this.onTick(this.rest, this.dauer, false);
    this.onEnde(ergebnis);
  }
}

/** Restzeit als "4:59". */
export const uhrText = ms => { const s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
