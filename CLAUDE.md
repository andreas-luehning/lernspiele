# Lernspiele

Kleine Tablet-Lernspiele für Mathematik in Klasse 2 (Rechnen bis 20). Die Spiele bauen echte Arbeitsblätter und Materialien aus dem Unterricht nach, damit die Kinder zu Hause genauso üben wie in der Schule. Alles läuft als statische Website auf GitHub Pages; jedes Spiel hat einen eigenen Ordner und damit eine eigene Adresse.

## Für wen

- **Kinder** mit etwa 7–8 Jahren, auf einem Tablet, mit Finger oder Stift. Sie lesen noch nicht sicher.
- **Erwachsene** (Eltern, Lehrkraft) stellen ein und schauen sich den Fortschritt an.

## Grundsätze

1. **Kurz üben:** Eine Runde dauert 5 Minuten, eine Runde pro Tag. Danach ist Schluss, ohne schlechtes Gewissen.
2. **Nah am Arbeitsblatt:** Anordnung, Symbole (Herz, Hand, Straße) und Rechenweg wie auf Papier. Die Fotos liegen lokal in `docs/arbeitsblaetter/` (nicht im Git).
3. **Fehler kosten nichts:** Es gibt Tipps statt Strafen. Nichts Gesammeltes geht verloren.
4. **Hell und freundlich:** Pastellfarben, große Schreibfelder, Knöpfe mindestens 48 px, wenig Text. Hell ist Standard, Nachtmodus ist umschaltbar. Schriften: Grandstander (Überschriften, Zahlen) und Andika (Fließtext, für Leseanfänger gemacht).
5. **Für alle Kinder:** Motive neutral halten (Schnecken, Tiere), keine Klischees wie „Autos für Jungen“.
6. **Datenschutz:** Alles bleibt auf dem Gerät. Keine Konten, kein Tracking, kein Server, keine Werbung. Die Zahlenerkennung läuft im Browser.

## Technik

- Reines HTML, CSS und JavaScript (ES-Module), **kein Build-Schritt**, damit GitHub Pages die Dateien direkt ausliefern kann.
- Ziel-Geräte: iPad (Safari) und Android-Tablets (Chrome), Hoch- und Querformat.
- Speicher: `localStorage` mit dem Präfix `lernspiele:` und einer Versionsnummer im gespeicherten Objekt. Alle Zugriffe in `try/catch`. Weil alle Spiele unter derselben Adresse laufen, teilen sie sich den Speicher; so gibt es einen gemeinsamen Schneckengarten.
- Später: als Web-App installierbar und offline nutzbar (Manifest und Service Worker).

### Geplante Struktur

```
index.html              Startseite mit allen Spielen
gemeinsam/
  theme.css             Farb-Tokens (hell/dunkel), Schriften, Knöpfe
  ziffern.js            Zahlenerkennung (Modell laden, Striche → Zahl)
  ziffern-modell.json   Gewichte, siehe werkzeuge/ziffern-modell/
  schreibfeld.js        Schreibfeld mit robuster Stift-/Finger-Eingabe
  runde.js              5-Minuten-Runde, eine pro Tag
  parade.js             Schneckenparade: Logik, Zeichnen, Garten
  speicher.js           localStorage mit Präfix, Version, try/catch
zehnerweg/index.html    Spiel 1: Zehnerübergang nach Arbeitsblatt
burgen/                 Spiel 2 (Idee): Leuchttisch-Burgen, schnell zählen
gegenstaende/           Spiel 3 (Idee): Leuchttisch-Gegenstände, zählen und zerlegen
docs/                   Beschreibungen, Regeln, Fotos der Arbeitsblätter
prototypen/             Die Prototypen aus der Ideenphase (nicht verändern, nur als Vorlage)
werkzeuge/              Trainingsskript für das Ziffern-Modell
```

## Stand

- `prototypen/zehnerweg.html` ist ein funktionierender Prototyp in einer Datei (Modell eingebettet). `prototypen/zehnerweg.quelle.html` ist dieselbe Datei mit dem Platzhalter `__MODEL__` statt der Gewichte; die Gewichte liegen in `werkzeuge/ziffern-modell/model.json`.
- `prototypen/schneckenparade.html` ist eine Probe der Belohnung. Die Aufgaben werden dort per Knopf simuliert.
- Genaue Regeln: `docs/zehnerweg.md`, `docs/schneckenparade.md`. Ideen und offene Fragen: `docs/ideen-und-offene-fragen.md`.

## Was wir aus dem Prototyp gelernt haben

- **Schreibfelder groß machen.** Die ersten Felder waren für Kinderhände zu klein. Der Rechenweg soll den Bildschirm füllen; im Querformat stehen Aufgabe, Knöpfe und Sterne in einer Seitenleiste.
- **Erkannte Zahl nicht über die Schrift legen.** Der Hinweis „erkannt: 7“ steht unter dem Feld, zusammen mit dem Knopf × zum Löschen.
- **Eingabe robust machen.** Schreiben hing manchmal, bis die Seite neu geladen wurde. Ursachen: Nach einmaliger Stiftbenutzung wurden Finger dauerhaft ignoriert; Handballen oder ein zweiter Finger störten; Loslassen außerhalb des Feldes. Lösung im Prototyp: genau ein Zeiger pro Feld, Handflächen-Sperre nur 1,5 s nach einem Stift-Ereignis, `lostpointercapture` und `pointerup` am Fenster als Sicherheitsnetz, `touch-action: none` auf der Spielfläche, Kontextmenü und Zoom-Gesten aus. **Auf einem echten Tablet noch nicht bestätigt.**
- **Automatisch prüfen**, sobald alle Felder erkannt sind. Der Knopf „Prüfen“ bleibt zusätzlich.
- **Zweistellige Zahlen** gelingen am besten, wenn die Ziffern nebeneinander stehen und sich nicht berühren.

## Was nicht ins Git darf

- **Fotos der Arbeitsblätter** (`docs/arbeitsblaetter/`) und andere Fotos/Scans aus dem Unterricht. Sie sind per `.gitignore` ausgeschlossen und liegen nur lokal. Für die Umsetzung reicht die Beschreibung in `docs/`.
- **Keine persönlichen Daten:** keine Namen von Kindern, Lehrkräften oder Schule, keine E-Mail-Adressen, keine Fotos von Personen, keine Kinderschrift-Proben. Testdaten und Beispiele immer erfunden.
- Vor jedem Commit kurz `git status` prüfen; Bilddateien nur, wenn sie selbst erstellt sind (z. B. SVG-Grafiken der Spiele).

## Arbeitsweise

- In kleinen Schritten bauen, die man sofort auf dem Tablet ausprobieren kann. Nach jedem Schritt kurz sagen, was getestet werden soll.
- Texte für Kinder: Deutsch, Du-Form, kurze Sätze, freundlich, keine Ironie.
- Vor Änderungen an Regeln erst die passende Datei in `docs/` anpassen, dann den Code.
- Die Prototypen nicht verändern; Teile daraus in `gemeinsam/` und die Spielordner übernehmen.
- Mit Playwright (Chromium) im Hoch- und Querformat Tablet-Größen prüfen, z. B. iPad 820×1180 und Android 800×1280.
