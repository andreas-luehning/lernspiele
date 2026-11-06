# Lernspiele

Kleine Tablet-Lernspiele für Mathematik in Klasse 2 (Rechnen bis 20). Die Spiele bauen Arbeitsblätter aus dem Unterricht nach, damit Kinder zu Hause genauso üben wie in der Schule. Eine Runde dauert 5 Minuten, eine Runde pro Tag.

## Spiele

| Spiel | Inhalt | Stand |
|---|---|---|
| **Zehnerweg** | Zehnerübergang, Plus und Minus bis 20, Rechenweg über die 10 | spielbar: `zehnerweg/` |
| **Schneckenparade** | Gemeinsame Belohnung für alle Spiele: Salatblätter sammeln, Schnecken bekommen | im Zehnerweg eingebaut, Garten: `garten/`. Zum Ausprobieren `?probe` anhängen (Runde 1 Minute, „Nächster Tag“ im Garten) |
| Burgen, Gegenstände | Leuchttisch-Spiele: schnell zählen und zerlegen | Idee, siehe `docs/ideen-und-offene-fragen.md` |

## Ausprobieren

Die Seiten sind reines HTML, CSS und JavaScript ohne Build-Schritt. Wegen der ES-Module und des Modell-Downloads braucht man einen kleinen lokalen Server:

```
python3 -m http.server 8000
```

Dann `http://localhost:8000/` im Browser öffnen. Die Prototypen funktionieren auch per Doppelklick.

Prüfen (Playwright, bei laufendem Server auf Port 8123):

```
node tests/logik.mjs
node tests/parade-logik.mjs
node tests/browser.js
node tests/parade-browser.js
node tests/ziffern-browser.js
node tests/app-browser.js
```

## Als App installieren

Auf der Startseite unter **„Für Erwachsene“**: In Chrome (Android, Rechner) gibt es den Knopf „Installieren“. Auf iPad und iPhone in Safari: Teilen-Symbol → „Zum Home-Bildschirm“. Als App startet es im Vollbild und funktioniert auch ohne Internet. Bei Problemen hilft dort die „Diagnose“.

Veröffentlicht wird über GitHub Pages vom Branch `main`. Jedes Spiel hat eine eigene Adresse, z. B. `…/lernspiele/zehnerweg/`.

## Aufbau

| Ordner | Inhalt |
|---|---|
| `index.html` | Startseite mit allen Spielen |
| `zehnerweg/` | Spiel 1 |
| `garten/` | Schneckengarten |
| `gemeinsam/` | Gemeinsame Teile: Aussehen, Schriften, Zahlenerkennung, Schreibfeld, Speicher |
| `docs/` | Regeln der Spiele, Datenschutz und Sicherheit, Ideen und offene Fragen |
| `tests/` | Automatische Prüfungen (Logik und Browser) |
| `prototypen/` | Prototypen aus der Ideenphase (werden nicht verändert) |
| `werkzeuge/ziffern-modell/` | Zahlenerkennung: Modell und Trainingsskript |

Hinweise für die Entwicklung mit Claude Code stehen in `CLAUDE.md`.

## Datenschutz

Die Spiele speichern alles nur auf dem Gerät (`localStorage`). Es gibt keine Konten, kein Tracking, keinen Server und keine Werbung, und die Seiten laden nichts von fremden Servern. Die Zahlenerkennung läuft im Browser, Handschrift wird nicht gespeichert. Details: `docs/datenschutz-und-sicherheit.md`.
