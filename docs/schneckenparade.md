# Schneckenparade

Gemeinsame Belohnung für alle Spiele. Probe: `../prototypen/schneckenparade.html` (Aufgaben dort per Knopf simuliert).

## Idee

Das Kind hat einen Garten voller Schnecken. Jeden Tag geht es mit bis zu drei Schnecken auf einen 5-Minuten-Ausflug über die Straße. Richtige Aufgaben bringen Salatblätter, und für Salat kommen neue Schnecken dazu. Wer mitläuft, wächst. Der Garten wird mit der Zeit schöner.

Ziel ist, dass jede neue Schnecke ein kleines Ereignis bleibt. Deshalb nicht eine Schnecke pro Aufgabe, sondern eine pro 3 Blätter.

## Regeln

| Wann | Was passiert |
|---|---|
| Runden am Tag | Eine Runde dauert 5 Minuten. Die gewählten Begleiter (bis zu 3) stehen am Anfang der Straße. Wie viele Runden es am Tag gibt, stellen Erwachsene ein (1, 2, 3 oder unbegrenzt; Standard 3). Danach ist für heute Schluss; der Garten bleibt offen. |
| Vor der Runde | Das Kind tippt im Garten bis zu 3 Begleiter an. Ohne Wahl laufen die vom letzten Mal mit. |
| Richtige Aufgabe | Ein Salatblatt fliegt zur Parade. Anzeige: 3 Blatt-Plätze. |
| 3 Salatblätter | Eine neue Babyschnecke kriecht in die Parade. Hausfarbe und Muster zufällig; in 20 % der Fälle bewusst ein Haus, das im Sammelalbum noch fehlt. Blätter zählen neu. |
| Mehr als 3 neue Schnecken am Tag? | Nein, höchstens **3 neue Schnecken pro Tag**. Danach wandern volle Blattreihen in den **Salatkorb** (Platz für 2). Am nächsten Tag schlüpfen sie zu Beginn der ersten Runde („Aus deinem Salatkorb sind 2 Schnecken geschlüpft!“) und zählen für diesen Tag mit. Ist der Korb voll, gibt es trotzdem Lob. |
| 3 Blätter ohne Fehler dazwischen | Die neue Schnecke trägt einen Hut; in 20 % der Fälle bewusst einen, der im Sammelalbum fehlt. Anzeige: kleiner Hut neben den Blättern, der bei einem Fehler blass wird. |
| Falsche Aufgabe | Kein Blatt. Nichts geht verloren. Nur der Hut für die laufenden 3 Blätter fällt weg. |
| Ende der 5 Minuten | Die angefangene Aufgabe darf fertig werden. Die Parade zieht ins Ziel. Jeder Begleiter, der von Anfang an dabei war, zählt einen Ausflug, **jede Schnecke höchstens einmal am Tag**. Wer in der nächsten Runde andere Begleiter mitnimmt, lässt auch diese wachsen. Rückblick: neue Schnecken, gewachsene Schnecken, neue Deko. |
| Wachsen | Baby (0), Klein (ab 2 Ausflügen), Groß (ab 5), Glitzerhaus (ab 10). Neue Schnecken starten als Baby. |
| Alle 5 Übungstage | Neue Garten-Deko, in dieser Reihenfolge: Pilz, Blume, Teich, Bank, Gießkanne, Schneckenhotel. |
| Selten | Etwa jede 15. neue Schnecke hat ein Regenbogenhaus. Jede 10. neue Schnecke bringt einen Marienkäfer als Gast mit (läuft mit, wächst nicht). |
| Blätter vom Vortag | Bleiben stehen. Wer gestern 2 Blätter hatte, braucht heute nur noch eins. |

Übungstage zählen nur, wenn eine Runde gespielt wurde, und jeder Tag nur einmal, auch bei mehreren Runden. Verpasste Tage haben keine Folgen. Jede Schnecke zählt höchstens einen Ausflug am Tag.

## Tempo (simuliert, 5 Aufgaben je Runde, 30 % mit Fehler)

| | 1 Runde/Tag | 3 Runden/Tag |
|---|---|---|
| Neue Tiere pro Tag | etwa 1,7 | höchstens 3 (plus seltene Marienkäfer) |
| Alle 36 Häuser | etwa 6 Wochen | etwa 4 Wochen |
| Alle 8 Hüte | etwa 4 Wochen | etwa 2 Wochen |
| Ganzes Sammelalbum (53) | etwa 6 Wochen | etwa 4–5 Wochen (Deko alle 5 Übungstage bremst) |

Neu zu sammeln später denkbar: Freischaltungen über andere Spiele (z. B. eine Deko oder ein Hut, den es nur im Leuchttisch-Spiel gibt).

## Sammelalbum

Die Garten-Seite hat zwei Reiter: **Garten** (wer bei dir wohnt: jede Schnecke einzeln mit Namen, Größe, Ausflügen; hier werden die Begleiter gewählt) und **Sammelalbum** (was schon entdeckt ist: jede Art nur einmal). Mit `#album` an der Adresse öffnet sich gleich das Album.

Das Album ist ein Stickeralbum **ganz in Bildern**, weil die Kinder noch nicht sicher lesen: 36 Häuser (6 Farben × 6 Muster, jede Zeile eine Farbe), 8 Hüte, 3 Besonderheiten (Glitzerhaus, Regenbogenhaus, Marienkäfer) und 6 Deko-Stücke, zusammen 53. Gefundenes sitzt leicht schräg wie eingeklebt, Fehlendes ist ein gestricheltes „?“-Feld. Oben ein Fortschrittsbalken „x von 53 entdeckt“, die Zahl steht auch am Reiter. Namen gibt es nur für Vorlese-Hilfen (`aria-label`).

## Eine typische Woche

5 Übungstage mit je einer Runde ≈ 25 Blätter ≈ 8 neue Schnecken, 1 Stück Deko, Begleiter wachsen je einen Ausflug pro Tag. Mit 3 Runden am Tag höchstens 3 neue Schnecken täglich; was darüber hinaus gesammelt wird, wartet im Salatkorb auf morgen.

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
      "special": null, "runs": 0, "stage": 0, "born": "2026-11-06", "spiel": "zehnerweg", "ausflug": "2026-11-06" }
  ],
  "walkers": [1, 2, 3],
  "leaves": 1,
  "cleanLeaves": true,
  "lastRoundDay": "2026-11-06",
  "rundenHeute": 1,
  "practiceDays": 4,
  "deco": ["pilz"],
  "neuHeuteTag": "2026-11-06",
  "neuHeute": 2,
  "korb": [true],
  "newCount": 2,
  "nextId": 9,
  "runde": { "ende": 1762430400000, "pause": null, "tag": "2026-11-06", "begleiter": [1, 2, 3], "neu": [8], "zeitUm": false }
}
```

- `special`: `null`, `"regenbogen"`, `"kaefer"`. Glitzer ergibt sich aus `stage` 3.
- `spiel`: in welchem Spiel die Schnecke verdient wurde (für die Elternansicht).
- `runde`: die laufende Runde oder `null`. `ende` ist der Zeitpunkt (ms), an dem die 5 Minuten um sind; so läuft die Runde nach dem Neuladen weiter. `pause` ist die Restzeit in ms, solange die Uhr angehalten ist, sonst `null`. `tag` ist der Tag, an dem sie begann; eine am Vortag nicht beendete Runde wird beim nächsten Öffnen für diesen Tag abgeschlossen und blockiert den neuen Tag nicht.
- Beim Lesen wird jede Schnecke geprüft (bekannte Farbe, Muster, Hut, Name höchstens 20 Zeichen). Ungültige Einträge werden verworfen, siehe `datenschutz-und-sicherheit.md`.
- Tage als Datum (`YYYY-MM-DD`, lokale Zeit). Die Probe zählt Tage nur simuliert hoch.

## In den Spielen

- Die Parade läuft auf der Straße des Zehnerwegs, hinter dem Rechenweg oder am Rand, ohne die Schreibfelder zu verdecken.
- Ein „richtig“ entsteht, wenn die App eine Aufgabe komplett grün prüft. Ein „falsch“ zählt einmal pro Aufgabe, nicht pro Feld.
- Seitenleiste: Uhr (Sanduhr), 3 Blatt-Plätze, Hut-Anzeige.
- Garten als eigener Bildschirm hinter einem Knopf; dort auch Begleiter wählen.
- Nach der Runde: Rückblick, dann „Für heute geschafft! Morgen geht die Parade weiter.“ Das Spiel selbst bleibt zum freien Üben offen, bringt aber keine Blätter mehr (offene Frage, siehe unten).

## Entscheidungen für die erste Umsetzung

- **Startgarten:** Ein neuer Garten beginnt mit 3 Babyschnecken ohne Hut. Sie sind die ersten Begleiter.
- **Rundenbeginn:** Die Runde beginnt mit dem ersten Strich in einem Feld, nicht schon beim Öffnen des Spiels.
- **Zeit um:** Die angefangene Aufgabe darf fertig werden. Die Runde endet, sobald diese Aufgabe gelöst ist oder „Neue Aufgabe“ gedrückt wird, spätestens 3 Minuten nach Ablauf.
- **Nach der Runde:** Rückblick „Runde geschafft!“. Sind heute noch Runden übrig, steht dort „Noch eine Runde“; die nächste beginnt mit dem nächsten Strich. Sonst „Für heute geschafft!“, und das Spiel bleibt zum freien Üben offen, ohne Blätter.
- **Uhr und Pause:** Die Uhr hält von selbst an, wenn die App verlassen oder das Tablet gesperrt wird oder eine Minute lang niemand schreibt. Beim nächsten Strich läuft sie weiter. So geht keine Zeit verloren, wenn das Kind die App vergisst. Ist die Zeit schon um und die angefangene Aufgabe wird nicht fertig, endet die Runde nach 3 Minuten.
- **Anzeige im Zehnerweg:** Ein schmaler Paradestreifen unter dem Rechenweg. Uhr, 3 Blatt-Plätze und Hut-Anzeige stehen oben bei der Aufgabe, ein Schnecken-Knopf führt zum Garten.
- **Garten:** eigene Seite `garten/` mit Deko, allen Tieren, Begleiter-Wahl und Sammelalbum.
- **Probe-Modus für Erwachsene:** Mit `?probe` an der Adresse oder dem Knopf „Probe-Modus“ unter „Für Erwachsene“ wird in einem **eigenen Probe-Speicher** gespielt (`lernspiele:probe:…`); der echte Garten des Kindes bleibt unberührt. Der Modus bleibt beim Wechsel zwischen den Seiten an, bis er beendet wird. Eine Runde dauert dann 1 Minute, die Pause kommt nach 20 Sekunden, im Garten gibt es „Nächster Tag“. Ein Band oben zeigt „Probe“ mit „Probe zurücksetzen“ und „Beenden“.
- **Zurücksetzen:** Unter „Für Erwachsene“ löscht „Alles zurücksetzen“ (mit zwei Rückfragen) Garten, Runden und Einstellungen auf diesem Gerät. Das Tag/Nacht-Thema bleibt.

## Offene Fragen

- Darf man nach der letzten Runde des Tages ohne Belohnung weiterüben, oder ist dann ganz Schluss? (Bisher: weiterüben ohne Blätter.)
- Mehrere Kinder an einem Tablet: Profile mit eigenem Garten?
- Elternansicht: Übungstage, gelöste Aufgaben, schwierige Aufgaben.
