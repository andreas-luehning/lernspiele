# Burgen (Leuchttisch)

Stand: 27.11.2026. **Probe-Version**, nur für Erwachsene sichtbar.

## Entscheidungen (27.11.)

- **Eigene Kachel „Burgen“** mit eigenem Ordner `burgen/` und später **eigener Belohnung** (ähnlich wie die Amulette, eigene Sammlung nach Grundsatz 7). Später lassen sich die Leuchttisch-Kacheln vielleicht zusammenlegen.
- **Erst nur im Probe-Modus:** Die Kachel erscheint auf der Startseite nur, wenn unter „Für Erwachsene“ der Probe-Modus läuft. Kinder sehen sie noch nicht.
- **Noch keine Belohnung**, stattdessen eine **kleine Statistik** für Erwachsene. Sie wird später durch die Belohnung ersetzt.
- Noch nicht angeschlossen an Runde und Lernzeit (keine Uhr). Das kommt mit der Belohnung.

## Regeln (aus `prototypen/burgen.html`, unverändert übernommen)

| Was | Regel |
|---|---|
| Aufbau | Turm · Mitte · Turm, symmetrisch. Dach, Keil oder Kugel ist immer der oberste Stein; nichts schwebt. |
| Teile | 8–13 Bauteile. **Jedes Teil zählt als 1**, auch lange Quader, Platten und Zylinder. |
| Bauteile | Generator und Formen genau wie im Prototyp (Würfel, Quader, Zylinder, Platte, Dach, Keil, steiler Keil, Kugel, Tor- und Fensterbogen, breites Dach und breiter Keil). Die Formen werden nicht verändert. |
| Farben | Turm und Mitte je eine Farbe aus dem Prototyp, Dächer rot. Acryl-Look (durchscheinend, farbige Kante, leichtes Glühen). |
| Frage | „Wie viele Bausteine hat die Burg?“ Vier Antworten zum Tippen, eine stimmt. |
| Richtig | Der Tisch leuchtet einmal auf. „Stimmt! Zusammen N.“ mit der Rechnung Turm + Mitte + Turm = N. Weiter mit „Neue Burg“. |
| Falsch | Sanftes Wackeln, die Rechnung mit **?** als Denkhilfe, beliebig oft probieren. Kein Abzug. |
| „Zeig mir's“ | Zählt die Teile einzeln durch (linker Turm, Mitte, rechter Turm), dann „Zwei gleiche Türme und die Mitte:“ mit der Rechnung und **?**. Das Ergebnis wird nie verraten. |
| Kein Zeitdruck | Keine Uhr, kein Blitzblick (Übergabe, Entscheidung 7). |

## Auf dem Leuchttisch

Dieselbe Platte wie bei den Edelsteinen (Rahmen, Milchglas, Aufleuchten bei richtiger Antwort), siehe `docs/leuchttisch.md`.

- **Lichtschein von unten:** Unter jedem Bauteil ein weicher Schein in seiner Farbe, leicht nach rechts unten versetzt, stark verwischt. Er liegt unter der ganzen Burg und darf nie wie ein zusätzliches Teil aussehen.
- **Funkeln:** Ab und zu (alle 4–8 Sekunden) funkelt **sehr subtil** ein kleiner Stern auf einem Bauteil. Nicht bei „Zeig mir's“, nicht nach der richtigen Antwort (damit es nicht wie das Aufleuchten wirkt). Bei „Bewegung reduzieren“ am Gerät kein Funkeln.
- Die Formen und Umrisse der Bauteile bleiben wie im Prototyp.

## Statistik (vorläufig, statt Belohnung)

Unter dem Tisch, klein, für Erwachsene beim Ausprobieren:

- **Burgen gelöst**
- **gleich richtig** (ohne Fehlversuch und ohne „Zeig mir's“)
- **mit „Zeig mir's“**
- **Fehlversuche** (falsche Antworten insgesamt)

Gespeichert unter `lernspiele:burgen` (im Probe-Modus `lernspiele:probe:burgen`): `{ version: 1, geloest, gleichRichtig, mitHilfe, fehlversuche }`, nur Zahlen. „Probe zurücksetzen“ auf der Startseite löscht sie.

## Offene Fragen (an die Lehrkraft)

1. **Schwierigkeit:** Die Burg hat 8–13 Teile, also mehr als „bis 10“, aber mit Struktur (zwei gleiche Türme = verdoppeln). Ist sie eher zwischen „bis 10“ und „bis 20“ oder ein eigener Weg neben den Steinen? Braucht sie Stufen (z. B. kleinere Burgen 5–8 zum Einstieg)?
2. **Belohnung:** Eine eigene Sammlung, z. B. eine **Schatzburg**, die mit jeder Burg ein Stück wächst (Turm, Fahne, Tor), oder eigene Wappen/Fahnen?
3. **Antwort:** Nur tippen wie im Prototyp, oder auch schreiben wie bei den Steinen?
4. **Weiter:** Nach der richtigen Antwort selbst „Neue Burg“ tippen (wie im Prototyp) oder automatisch weiter (wie bei den Steinen)?
