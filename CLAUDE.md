# Lernspiele

Kleine Tablet-Lernspiele für Mathematik in Klasse 2 (Rechnen bis 20). Die Spiele bauen echte Arbeitsblätter und Materialien aus dem Unterricht nach, damit die Kinder zu Hause genauso üben wie in der Schule. Alles läuft als statische Website auf GitHub Pages; jedes Spiel hat einen eigenen Ordner und damit eine eigene Adresse.

## Für wen

- **Kinder** mit etwa 7–8 Jahren, auf einem Tablet, mit Finger oder Stift. Sie lesen noch nicht sicher.
- **Erwachsene** (Eltern, Lehrkraft) stellen ein und schauen sich den Fortschritt an.

## Grundsätze

1. **Kurz üben, Medienzeit begrenzen:** Eine Runde dauert 5 Minuten. Erwachsene stellen eine **gemeinsame Lernzeit pro Tag für alle Spiele** ein (15–30 Minuten, Standard 20). Gezählt wird nur echte Übungszeit; die Uhr pausiert, wenn niemand schreibt. Danach bleibt freies Üben ohne Belohnung möglich; die App erinnert freundlich, die Pause bestimmen die Erwachsenen.
2. **Nah am Arbeitsblatt:** Anordnung, Symbole (Herz, Hand, Straße) und Rechenweg wie auf Papier. Die Fotos liegen lokal in `docs/arbeitsblaetter/` (nicht im Git).
3. **Fehler kosten nichts:** Es gibt Tipps statt Strafen. Nichts Gesammeltes geht verloren.
4. **Hell und freundlich:** Pastellfarben, große Schreibfelder, Knöpfe mindestens 48 px, wenig Text. Hell ist Standard, Nachtmodus ist umschaltbar. Schriften: Grandstander (Überschriften, Zahlen) und Andika (Fließtext, für Leseanfänger gemacht).
5. **Für alle Kinder:** Motive neutral halten (Schnecken, Tiere), keine Klischees wie „Autos für Jungen“.
6. **Datenschutz und Sicherheit:** Alles bleibt auf dem Gerät. Keine Konten, kein Tracking, kein Server, keine Werbung, keine Anfragen an fremde Server (auch keine Schriften oder Bibliotheken von CDNs). Die Zahlenerkennung läuft im Browser. Details und Checkliste: `docs/datenschutz-und-sicherheit.md`.
7. **Belohnung fair trennen:** Durchhalten (eine fertige Runde) bringt die Hauptbelohnung, Richtigrechnen bringt Extras. Jede Spielwelt hat ihre eigene Sammlung (Schnecken, später Amulette am Leuchttisch, Numis Freunde); gekoppelt sind die Spiele nur über die gemeinsame Lernzeit.

## Technik

- Reines HTML, CSS und JavaScript (ES-Module), **kein Build-Schritt**, damit GitHub Pages die Dateien direkt ausliefern kann.
- Ziel-Geräte: iPad (Safari) und Android-Tablets (Chrome), Hoch- und Querformat.
- Speicher: `localStorage` mit dem Präfix `lernspiele:` und einer Versionsnummer im gespeicherten Objekt, immer über `gemeinsam/speicher.js` (prüft und bereinigt beim Lesen). Alle Zugriffe in `try/catch`. Weil alle Spiele unter derselben Adresse laufen, teilen sie sich den Speicher; so gibt es einen gemeinsamen Schneckengarten.
- **Installierbar und offline** (`manifest.webmanifest`, `sw.js`, `gemeinsam/app.js`): Als App startet es im Vollbild und geht ohne Internet. Der Service Worker lädt immer zuerst frisch aus dem Netz und nimmt nur offline den gespeicherten Stand. **Bei jeder Änderung an ausgelieferten Dateien `VERSION` in `sw.js` erhöhen; neue Dateien in `DATEIEN` eintragen** (`tests/app-browser.js` prüft die Liste).

### Struktur

```
index.html              Startseite mit allen Spielen (startseite.css), Bereich „Für Erwachsene“: Installieren, Vollbild, Diagnose
manifest.webmanifest    App-Beschreibung (Name, Symbole, Vollbild)
sw.js                   Service Worker (offline, Updates)
gemeinsam/
  theme.css             Farb-Tokens (hell/dunkel), Schriften, Knöpfe
  thema.js              Tag/Nacht (klassisches Skript im <head>, damit nichts flackert)
  app.js                Service Worker anmelden, Installieren, Vollbild, Diagnose (auf jeder Seite)
  icons/                App-Symbole (SVG-Vorlagen, PNGs per werkzeuge/icons.js)
  schriften/            Andika und Grandstander als woff2, mit OFL-Lizenz
  ziffern.js            Zahlenerkennung (Modell laden, Striche → Zahl)
  ziffern-modell.json   Gewichte, siehe werkzeuge/ziffern-modell/
  schreibfeld.js        Schreibfeld mit robuster Stift-/Finger-Eingabe
  speicher.js           localStorage mit Präfix, Version, try/catch, Bereinigen, Zurücksetzen
  probe.js              Probe-Modus für Erwachsene: eigener Speicher lernspiele:probe:…, bleibt im Tab an
  einstellungen.js      Einstellungen für Erwachsene (7 mit Querstrich, Lernzeit pro Tag)
  lernzeit.js           Gemeinsame Lernzeit pro Tag für alle Spiele (zählt nur echte Übungszeit)
  runde.js              5-Minuten-Runde, Pause bei Inaktivität, meldet Übungszeit an lernzeit.js
  parade-logik.js       Schneckenparade: Regeln, Zustand, Prüfen der Gartendaten (ohne DOM)
  parade-bilder.js      Schnecken, Hüte, Käfer, Deko als SVG
  parade.js, parade.css Paradestreifen, Blatt-Plätze, Rückblick
garten/                 Schneckengarten mit Reitern: Garten (Tiere, Begleiter wählen, Hutschachtel) und Sammelalbum (Sticker in Bildern)
zehnerweg/              Spiel 1: Zehnerübergang nach Arbeitsblatt
  index.html, zehnerweg.css, zehnerweg.js (Seite)
  aufgaben.js           Aufgaben, Tipps, Bewertung (ohne DOM, direkt testbar)
leuchttisch/            Spiel 2 (Entwurf): Edelsteine zählen und zerlegen, Amulette sammeln; später Burg
  index.html, leuchttisch.css, leuchttisch.js (Seite)
  aufgaben.js           Aufgaben, Streuen, Amulett-Regeln (ohne DOM, direkt testbar)
  steine.js             Edelsteine und Amulett (Formen, Materialien) als SVG
schatzkammer/           Amulette ansehen: angefangenes Amulett, fertige Amulette, Album aller Modelle (Form × Material)
docs/                   Beschreibungen, Regeln, Fotos der Arbeitsblätter
  leuchttisch.md        Leuchttisch: Regeln, Abgleich mit den Prototypen, offene Fragen
  uebergaben/           Gelieferte Aufträge zu den Leuchttisch-Prototypen (nicht verändern)
prototypen/             Die Prototypen aus der Ideenphase (nicht verändern, nur als Vorlage)
werkzeuge/              Trainingsskript für das Ziffern-Modell, icons.js (App-Symbole erzeugen)
tests/                  logik.mjs, parade-logik.mjs (Node); browser.js, parade-browser.js, ziffern-browser.js, app-browser.js, layout-browser.js (Playwright, Server auf Port 8123)
```

## Stand

- **Schritt 1 erledigt:** Der Zehnerweg ist aus dem Prototyp in `zehnerweg/` und `gemeinsam/` aufgeteilt, mit Startseite. Verhalten wie im Prototyp (noch mit Sternen). Speicher: `lernspiele:zehnerweg` (Sterne, Spiegeln, Rechenart) und `lernspiele:einstellungen` (Tag/Nacht); alte Prototyp-Werte werden einmalig übernommen.
- **Schritt 2 (Branch `schneckenparade`):** Die Schneckenparade ersetzt die Sterne: 5-Minuten-Runde, Salatblätter, neue Schnecken, Rückblick, Garten-Seite mit Begleiter-Wahl und Album. Entscheidungen siehe `docs/schneckenparade.md`.
- **Belohnungsmodell (Branch `belohnung-neu`):** eine fertige 5-Minuten-Runde = eine Schnecke, 5 Salatblätter = eine Kopfbedeckung in der Hutschachtel (14 Arten, frei aufsetzen), Wachsen einmal pro Tag, Deko alle 5 Übungstage, gemeinsame Lernzeit pro Tag (Standard 20 Min). Tempo-Simulation in `docs/schneckenparade.md`.
- **Leuchttisch (Entwurf, Branch `leuchttisch-mit-belohnung`):** Edelsteine zählen und zerlegen (Stufen 2–6, bis 7, bis 10, bis 20), Antwort tippen oder schreiben, Amulette als eigene Sammlung, Licht ruhig/bewegt. Angeschlossen an Runde und Lernzeit (`gemeinsam/runde.js` mit eigenem Speicher, keine Schnecke); Steine nur während einer Runde. Amulette werden automatisch gefüllt; Material nach Stufe (Ton, Bronze, Silber, Gold), Form wechselt; Schatzkammer mit Album. Offen: Hauptbelohnung für eine fertige Runde, Steine umsetzen. Regeln: `docs/leuchttisch.md`. Vorlagen: `prototypen/burgen.html`, `prototypen/leuchttisch.html` (mit Numi-Thema und Google Fonts, nicht verändern).
- **Danach:** Rundenbelohnung am Leuchttisch, Burg als Variante, später Profile für mehrere Kinder, Numi als eigene Welt.
- `prototypen/zehnerweg.html` ist ein funktionierender Prototyp in einer Datei (Modell eingebettet). `prototypen/zehnerweg.quelle.html` ist dieselbe Datei mit dem Platzhalter `__MODEL__` statt der Gewichte; die Gewichte liegen in `werkzeuge/ziffern-modell/model.json`.
- `prototypen/schneckenparade.html` ist eine Probe der Belohnung. Die Aufgaben werden dort per Knopf simuliert.
- Genaue Regeln: `docs/zehnerweg.md`, `docs/schneckenparade.md`. Ideen und offene Fragen: `docs/ideen-und-offene-fragen.md`.

## Was wir aus dem Prototyp gelernt haben

- **Schreibfelder groß machen.** Die ersten Felder waren für Kinderhände zu klein. Der Rechenweg soll den Bildschirm füllen; im Querformat stehen Aufgabe, Knöpfe und Sterne in einer Seitenleiste.
- **Erkannte Zahl nicht über die Schrift legen.** Der Hinweis „erkannt: 7“ steht unter dem Feld, zusammen mit dem Knopf × zum Löschen.
- **Eingabe robust machen.** Schreiben hing manchmal, bis die Seite neu geladen wurde. Ursachen: Nach einmaliger Stiftbenutzung wurden Finger dauerhaft ignoriert; Handballen oder ein zweiter Finger störten; Loslassen außerhalb des Feldes. Lösung im Prototyp: genau ein Zeiger pro Feld, Handflächen-Sperre nur 1,5 s nach einem Stift-Ereignis, `lostpointercapture` und `pointerup` am Fenster als Sicherheitsnetz, `touch-action: none` auf der Spielfläche, Kontextmenü und Zoom-Gesten aus. **Auf einem echten Tablet noch nicht bestätigt.**
- **Automatisch prüfen**, sobald alle Felder erkannt sind. Der Knopf „Prüfen“ bleibt zusätzlich.
- **Zweistellige Zahlen** gelingen am besten, wenn die Ziffern nebeneinander stehen und sich nicht berühren.
- **Deutsche 9 (Bogen unten) wurde oft als 3 gelesen.** Formprüfung: geschlossene Schlaufe oben → 9 (`obenUmlauf` in `gemeinsam/ziffern.js`).
- **Seitenleiste im Querformat** passt bei Tablet-Höhen unter etwa 800 px nicht immer; die App prüft das und nimmt dann das Layout oben/unten (`tests/layout-browser.js` prüft 50 Größen).
- **Deutsche 1 wurde oft als 7 gelesen.** Das Modell kennt nur die amerikanische 1. Lösung: Regel „7 nur mit Querstrich“ wie in der Grundschule (abschaltbar), dazu eine Formprüfung (`gemeinsam/ziffern.js`, `gemeinsam/einstellungen.js`, Test `tests/ziffern-browser.js`).

## Was nicht ins Git darf

- **Fotos der Arbeitsblätter** (`docs/arbeitsblaetter/`) und andere Fotos/Scans aus dem Unterricht. Sie sind per `.gitignore` ausgeschlossen und liegen nur lokal. Für die Umsetzung reicht die Beschreibung in `docs/`.
- **Keine persönlichen Daten:** keine Namen von Kindern, Lehrkräften oder Schule, keine E-Mail-Adressen, keine Fotos von Personen, keine Kinderschrift-Proben. Testdaten und Beispiele immer erfunden.
- Vor jedem Commit kurz `git status` prüfen; Bilddateien nur, wenn sie selbst erstellt sind (z. B. SVG-Grafiken der Spiele).

## Sicherheit und Datenschutz (bei jeder Änderung mitdenken)

Die Nutzer sind Kinder. Bei jeder neuen Funktion kurz prüfen und in der Antwort erwähnen, was sie für Datenschutz und Sicherheit bedeutet. Feste Regeln:

- Jede HTML-Seite bekommt die Meta-Tags für CSP, Referrer und Robots (Vorlage: `zehnerweg/index.html`). Kein Inline-JavaScript, keine Inline-Styles im HTML.
- Gespeicherte Daten und Eingaben nie per `innerHTML` einfügen, sondern mit `textContent`.
- Gespeicherte Daten nur über `gemeinsam/speicher.js` lesen (Typprüfung gegen ein Standard-Objekt).
- Keine fremden Server: keine CDNs, keine Analyse, keine Online-Stimmen beim Vorlesen.
- Handschrift nie speichern oder übertragen.
- Playwright-Tests prüfen bei jeder Seite: keine Anfragen an fremde Server, keine CSP-Verstöße.
- Vor jedem Commit die Checkliste in `docs/datenschutz-und-sicherheit.md`.

## Arbeitsweise

- In kleinen Schritten bauen, die man sofort auf dem Tablet ausprobieren kann. Nach jedem Schritt kurz sagen, was getestet werden soll.
- Texte für Kinder: Deutsch, Du-Form, kurze Sätze, freundlich, keine Ironie.
- Vor Änderungen an Regeln erst die passende Datei in `docs/` anpassen, dann den Code.
- Die Prototypen nicht verändern; Teile daraus in `gemeinsam/` und die Spielordner übernehmen.
- Mit Playwright (Chromium) im Hoch- und Querformat Tablet-Größen prüfen, z. B. iPad 820×1180 und Android 800×1280.
- **Branch-Namen sprechend und eindeutig** (z. B. `leuchttisch-mit-belohnung`), damit die Lehrkraft in GitHub Pages den richtigen Branch auswählen kann. In der Antwort immer nennen, welcher Branch was enthält und welcher deployt werden soll.
