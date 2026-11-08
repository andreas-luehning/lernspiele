# Lernspiele

Kleine Tablet-Lernspiele für Mathematik in Klasse 2 (Rechnen bis 20). Die Spiele bauen Arbeitsblätter aus dem Unterricht nach, damit Kinder zu Hause genauso üben wie in der Schule. Eine Runde dauert 5 Minuten, eine Runde pro Tag.

## Spiele

| Spiel | Inhalt | Stand |
|---|---|---|
| **Zehnerweg** | Zehnerübergang, Plus und Minus bis 20, Rechenweg über die 10 | spielbar: `zehnerweg/` (noch mit Sternen statt Schnecken) |
| **Schneckenparade** | Gemeinsame Belohnung für alle Spiele: Salatblätter sammeln, Schnecken bekommen | als Nächstes; Probe: `prototypen/schneckenparade.html` |
| **Leuchttisch** | Edelsteine zählen und zerlegen, Amulette sammeln; später Burg und Zahlenmauer | erster Entwurf: `leuchttisch/` (noch ohne 5-Minuten-Runde), Regeln: `docs/leuchttisch.md` |

## Ausprobieren

Die Seiten sind reines HTML, CSS und JavaScript ohne Build-Schritt. Wegen der ES-Module und des Modell-Downloads braucht man einen kleinen lokalen Server:

```
python3 -m http.server 8000
```

Dann `http://localhost:8000/` im Browser öffnen. Die Prototypen funktionieren auch per Doppelklick.

Prüfen (Playwright, bei laufendem Server auf Port 8123):

```
node tests/logik.mjs
node tests/browser.js
```

Veröffentlicht wird über GitHub Pages vom Branch `main`. Jedes Spiel hat eine eigene Adresse, z. B. `…/lernspiele/zehnerweg/`.

## Aufbau

| Ordner | Inhalt |
|---|---|
| `index.html` | Startseite mit allen Spielen |
| `zehnerweg/` | Spiel 1 |
| `leuchttisch/` | Spiel 2 (Entwurf) |
| `gemeinsam/` | Gemeinsame Teile: Aussehen, Schriften, Zahlenerkennung, Schreibfeld, Speicher |
| `docs/` | Regeln der Spiele, Datenschutz und Sicherheit, Ideen und offene Fragen |
| `tests/` | Automatische Prüfungen (Logik und Browser) |
| `prototypen/` | Prototypen aus der Ideenphase (werden nicht verändert) |
| `werkzeuge/ziffern-modell/` | Zahlenerkennung: Modell und Trainingsskript |

Hinweise für die Entwicklung mit Claude Code stehen in `CLAUDE.md`.

## Datenschutz

Die Spiele speichern alles nur auf dem Gerät (`localStorage`). Es gibt keine Konten, kein Tracking, keinen Server und keine Werbung, und die Seiten laden nichts von fremden Servern. Die Zahlenerkennung läuft im Browser, Handschrift wird nicht gespeichert. Details: `docs/datenschutz-und-sicherheit.md`.
