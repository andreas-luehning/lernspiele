# Lernspiele

Kleine Tablet-Lernspiele für Mathematik in Klasse 2 (Rechnen bis 20). Die Spiele bauen Arbeitsblätter aus dem Unterricht nach, damit Kinder zu Hause genauso üben wie in der Schule. Eine Runde dauert 5 Minuten, eine Runde pro Tag.

## Spiele

| Spiel | Inhalt | Stand |
|---|---|---|
| **Zehnerweg** | Zehnerübergang, Plus und Minus bis 20, Rechenweg über die 10 | Prototyp: `prototypen/zehnerweg.html` |
| **Schneckenparade** | Gemeinsame Belohnung für alle Spiele: Salatblätter sammeln, Schnecken bekommen | Probe: `prototypen/schneckenparade.html` |
| Burgen, Gegenstände | Leuchttisch-Spiele: schnell zählen und zerlegen | Idee, siehe `docs/ideen-und-offene-fragen.md` |

## Ausprobieren

Die Seiten sind reines HTML, CSS und JavaScript ohne Build-Schritt. Wegen der ES-Module und des Modell-Downloads braucht man einen kleinen lokalen Server:

```
python3 -m http.server 8000
```

Dann `http://localhost:8000/` im Browser öffnen. Die Prototypen funktionieren auch per Doppelklick.

Veröffentlicht wird über GitHub Pages vom Branch `main`. Jedes Spiel hat eine eigene Adresse, z. B. `…/lernspiele/zehnerweg/`.

## Aufbau

| Ordner | Inhalt |
|---|---|
| `docs/` | Regeln der Spiele, Ideen und offene Fragen |
| `prototypen/` | Prototypen aus der Ideenphase (werden nicht verändert) |
| `werkzeuge/ziffern-modell/` | Zahlenerkennung: Modell und Trainingsskript |

Hinweise für die Entwicklung mit Claude Code stehen in `CLAUDE.md`.

## Datenschutz

Die Spiele speichern alles nur auf dem Gerät (`localStorage`). Es gibt keine Konten, kein Tracking, keinen Server und keine Werbung. Die Zahlenerkennung läuft im Browser.
