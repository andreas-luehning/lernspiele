// Tag/Nacht für alle Seiten. Absichtlich ein klassisches Skript (kein Modul), das im <head>
// geladen wird: So steht das Thema fest, bevor die Seite gezeichnet wird, und nichts flackert.
// Gespeichert unter "lernspiele:einstellungen" { version: 1, thema: "hell" | "dunkel" }.
// Knöpfe mit dem Attribut data-thema-knopf schalten um.
(function () {
  'use strict';
  var KEY = 'lernspiele:einstellungen';
  var SUN = '<svg viewBox="0 0 24 24" class="sun" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>';

  function lesen() {
    try {
      var o = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (o && o.version === 1 && (o.thema === 'hell' || o.thema === 'dunkel')) return o;
    } catch (e) {}
    // Einmalige Übernahme aus dem Prototyp
    var alt = null; try { alt = localStorage.getItem('zehnerweg-theme'); } catch (e) {}
    return { version: 1, thema: alt === 'dark' ? 'dunkel' : 'hell' };
  }
  function speichern(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }

  var einst = lesen();
  function anwenden() {
    document.documentElement.setAttribute('data-theme', einst.thema === 'dunkel' ? 'dark' : 'light');
    var knoepfe = document.querySelectorAll('[data-thema-knopf]');
    for (var i = 0; i < knoepfe.length; i++) {
      knoepfe[i].innerHTML = einst.thema === 'dunkel' ? SUN : MOON; // feste, eigene SVG-Texte
      knoepfe[i].setAttribute('aria-label', einst.thema === 'dunkel' ? 'Tagmodus einschalten' : 'Nachtmodus einschalten');
    }
  }
  anwenden();
  document.addEventListener('DOMContentLoaded', function () {
    anwenden();
    document.addEventListener('click', function (e) {
      var k = e.target.closest && e.target.closest('[data-thema-knopf]');
      if (!k) return;
      einst.thema = einst.thema === 'dunkel' ? 'hell' : 'dunkel';
      speichern(einst); anwenden();
    });
  });
})();
