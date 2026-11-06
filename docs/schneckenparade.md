# Schneckenparade

Gemeinsame Belohnung für alle Spiele. Probe: `../prototypen/schneckenparade.html` (Aufgaben dort per Knopf simuliert).

## Idee

Das Kind hat einen Garten voller Schnecken. Jeden Tag geht es mit bis zu drei Schnecken auf einen 5-Minuten-Ausflug über die Straße. Richtige Aufgaben bringen Salatblätter, und für Salat kommen neue Schnecken dazu. Wer mitläuft, wächst. Der Garten wird mit der Zeit schöner.

Ziel ist, dass jede neue Schnecke ein kleines Ereignis bleibt. Deshalb nicht eine Schnecke pro Aufgabe, sondern eine pro 3 Blätter.

## Regeln

| Wann | Was passiert |
|---|---|
| Einmal am Tag | Eine Runde dauert 5 Minuten. Die gewählten Begleiter (bis zu 3) stehen am Anfang der Straße. Danach ist für heute Schluss; der Garten bleibt offen. |
| Vor der Runde | Das Kind tippt im Garten bis zu 3 Begleiter an. Ohne Wahl laufen die vom letzten Mal mit. |
| Richtige Aufgabe | Ein Salatblatt fliegt zur Parade. Anzeige: 3 Blatt-Plätze. |
| 3 Salatblätter | Eine neue Babyschnecke kriecht in die Parade. Hausfarbe und Muster zufällig, bevorzugt eine Kombination, die noch fehlt. Blätter zählen neu. |
| 3 Blätter ohne Fehler dazwischen | Die neue Schnecke trägt einen Hut, bevorzugt einen, der im Album fehlt. Anzeige: kleiner Hut neben den Blättern, der bei einem Fehler blass wird. |
| Falsche Aufgabe | Kein Blatt. Nichts geht verloren. Nur der Hut für die laufenden 3 Blätter fällt weg. |
| Ende der 5 Minuten | Die angefangene Aufgabe darf fertig werden. Die Parade zieht ins Ziel. Jeder Begleiter, der von Anfang an dabei war, zählt einen Ausflug. Rückblick: neue Schnecken, gewachsene Schnecken, neue Deko. |
| Wachsen | Baby (0), Klein (ab 2 Ausflügen), Groß (ab 5), Glitzerhaus (ab 10). Neue Schnecken starten als Baby. |
| Alle 5 Übungstage | Neue Garten-Deko, in dieser Reihenfolge: Pilz, Blume, Teich, Bank, Gießkanne, Schneckenhotel. |
| Selten | Etwa jede 15. neue Schnecke hat ein Regenbogenhaus. Jede 10. neue Schnecke bringt einen Marienkäfer als Gast mit (läuft mit, wächst nicht). |
| Blätter vom Vortag | Bleiben stehen. Wer gestern 2 Blätter hatte, braucht heute nur noch eins. |

Übungstage zählen nur, wenn eine Runde gespielt wurde. Verpasste Tage haben keine Folgen.

## Eine typische Woche

5 Übungstage × etwa 5 Aufgaben = etwa 25 Blätter, also etwa 8 neue Schnecken, 1 Stück Deko und 3 Begleiter, die je einen Ausflug weiter wachsen. Mit 6 Hausfarben × 6 Mustern × 8 Hüten (288 Kombinationen) reicht das Album für viele Monate.

## Bausteine

- **Hausfarben:** Rosa, Gelb, Mint, Himmelblau, Lila, Orange
- **Muster:** Einfarbig, Punkte, Streifen, Sterne, Herzen, Wellen
- **Hüte:** Krone, Zylinder, Blumenkranz, Piratenhut, Zipfelmütze, Partyhut, Schleife, Kochmütze
- **Besonderes:** Glitzerhaus (durch Wachsen), Regenbogenhaus (selten), Marienkäfer (Gast)
- **Namen:** zufällig aus einer Liste, gemischt (Lotti, Paul, Frieda, Kurt, …), ohne Doppelte. Später kann das Kind umbenennen.

Alle Figuren werden als SVG aus Teilen gezeichnet (Körper, Haus, Muster, Hut, Glitzer); die Funktionen `snailSVG`, `hatSVG`, `patternSVG`, `bugSVG`, `decoSVG` im Prototyp können übernommen werden.

## Daten

Gespeichert unter `lernspiele:parade` in `localStorage`:

```json
{
  "version": 1,
  "garden": [
    { "id": 8, "name": "Max", "color": "lila", "pattern": "streifen", "hat": "blumen",
      "special": null, "runs": 0, "stage": 0, "born": "2026-11-06", "spiel": "zehnerweg" }
  ],
  "walkers": [1, 2, 3],
  "leaves": 1,
  "cleanLeaves": true,
  "lastRoundDay": "2026-11-06",
  "practiceDays": 4,
  "deco": ["pilz"],
  "newCount": 2,
  "nextId": 9
}
```

- `special`: `null`, `"regenbogen"`, `"kaefer"`. Glitzer ergibt sich aus `stage` 3.
- `spiel`: in welchem Spiel die Schnecke verdient wurde (für die Elternansicht).
- Tage als Datum (`YYYY-MM-DD`, lokale Zeit). Die Probe zählt Tage nur simuliert hoch.

## In den Spielen

- Die Parade läuft auf der Straße des Zehnerwegs, hinter dem Rechenweg oder am Rand, ohne die Schreibfelder zu verdecken.
- Ein „richtig“ entsteht, wenn die App eine Aufgabe komplett grün prüft. Ein „falsch“ zählt einmal pro Aufgabe, nicht pro Feld.
- Seitenleiste: Uhr (Sanduhr), 3 Blatt-Plätze, Hut-Anzeige.
- Garten als eigener Bildschirm hinter einem Knopf; dort auch Begleiter wählen.
- Nach der Runde: Rückblick, dann „Für heute geschafft! Morgen geht die Parade weiter.“ Das Spiel selbst bleibt zum freien Üben offen, bringt aber keine Blätter mehr (offene Frage, siehe unten).

## Offene Fragen

- Darf man nach der Tagesrunde ohne Belohnung weiterüben, oder ist dann ganz Schluss?
- Soll die Runde pausieren können (Toilette, Klingel)?
- Mehrere Kinder an einem Tablet: Profile mit eigenem Garten?
- Elternansicht: Übungstage, gelöste Aufgaben, schwierige Aufgaben.
