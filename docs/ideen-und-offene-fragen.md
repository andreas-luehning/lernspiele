# Ideen und offene Fragen

## Fahrplan (Stand 08.11.2026, von der Lehrkraft)

1. **Aktuelle Fassung testen** (Zehnerweg mit Schneckenparade, Leuchttisch, Schatzkammer; Branch `leuchttisch-mit-belohnung`) und als Pull Request nach `main` übernehmen. Danach nur noch kleine Fehler.
2. **Numi einbauen:** Die Numi-App ist fertig und soll als eigene Welt dazukommen (eigene Sammlung, gemeinsame Lernzeit, siehe Grundsatz 7).
3. **Burgen** als Variante im Leuchttisch (Vorlage `prototypen/burgen.html`).
4. **Zehnerweg, höhere Stufe:** Zehnerübergang mit größeren Zahlen, z. B. 70 + 8, 55 + 7 (über den nächsten Zehner).
5. **Zahlenmauern auf dem Leuchttisch:** Die Steine liegen als Zahlenmauer auf dem Tisch, das Kind beschriftet die Mauer direkt auf dem Leuchttisch (Schreibfelder in den Mauersteinen).


## Rückmeldungen vom Tablet-Test (11.11.2026, noch nicht umgesetzt)

1. **Ziffer 9:** Wird nur in amerikanischer Schreibweise erkannt, die deutsche 9 klappt noch nicht zuverlässig.
2. **Einstellung „7 mit Querstrich“** soll zu einem Schalter **„Deutsche Schreibschrift“** werden, der alles auf deutsch umstellt (7 mit Querstrich, deutsche 1 und 9). Persönlicher Eindruck der Lehrkraft: Die 1 als einfacher Strich ist angenehm, eine 7 ohne Querstrich fühlt sich komisch an.
3. **Zweimal Bommelmütze im Probe-Modus:** Prüfen, ob Fehler oder Zufall (doppelte Kopfbedeckungen sind bisher erlaubt).
4. **Wachstumsstufen Baby, Klein, Groß:** Niedlichere Wörter suchen.
5. **Straße im Zehnerweg:** Fahrbahnmarkierung hat merkwürdige Lücken, Pfeilspitzen sitzen nicht klar.
6. **Belohnung, wenn der Zehnerweg über 20 geht** (höhere Stufe): Wie geht es dann weiter? Ideen: Fantasie-Kopfbedeckungen wie Einhornhorn und Feenflügel, Halloween-Kostüme (vielleicht nur im Oktober). Weitere lustige Kopfbedeckungen: Blaulicht mit Polizeisirene, Satellitenantenne, Bauarbeiterhelm. Oder besondere Schnecken-Arten als Belohnung (z. B. Tigerschnecke, Rennschnecke mit Streifen).



Beide stammen von Leuchttisch-Materialien aus dem Unterricht. Prototypen, Übergaben und der Abgleich mit diesem Projekt stehen jetzt in `leuchttisch.md` (neue Richtung: Amulette statt Numi). Die folgenden Notizen sind der alte Stand.

### Burgen (Leuchttisch)
- Ziel: Mengen schnell erfassen und zählen.
- Mögliche Umsetzung: Eine Burg (mit Türmen, Fenstern, Fahnen o. Ä.) blitzt kurz auf, das Kind schreibt die Anzahl. Die Zeigedauer passt sich an. *(Überholt: Der Prototyp zeigt die Burg ohne Zeitlimit, siehe `leuchttisch.md`.)*
- Offen: Was genau wird gezählt? Wie lange ist das Bild sichtbar? Gibt es Stufen?

### Gegenstände (Leuchttisch)
- Ziel: Gegenstände schnell zählen und Mengen zerlegen (z. B. 7 = 5 + 2).
- Mögliche Umsetzung: Gegenstände liegen auf einer leuchtenden Fläche; das Kind zählt, dann teilt es sie in zwei Gruppen (Schreibfelder wie bei den kleinen Kreisen im Zehnerweg).
- Offen: Welche Gegenstände? Wird nur gezählt oder auch verschoben?

Beide Spiele nutzen dieselbe Zahlenerkennung, dieselbe 5-Minuten-Runde und dieselbe gemeinsame Lernzeit pro Tag. Als Belohnung bekommt der Leuchttisch eine **eigene Sammlung: Amulette** (statt Schnecken), damit die Welten getrennt und übersichtlich bleiben.

## Ideen für alle Spiele

- **Malblatt für die Schnecken:** Ein eigener Platz zum Malen (z. B. im Garten nach der Runde), damit die Lust zu malen nicht in den Rechenfeldern landet. Bilder nur auf dem Gerät, nicht speichern oder nur bis zum Schließen.
- **Startseite** mit großen Kacheln für jedes Spiel und dem Garten.
- **Stufen:** erst mit Hilfe, dann ohne.
- **Fehler-Aufgaben kommen wieder,** bis sie zweimal sicher sitzen.
- **Elternansicht** hinter einer kleinen Rechenaufgabe für Erwachsene: Übungstage, Aufgaben pro Tag, schwierige Aufgaben.
- **Vorlesen** von Aufgabe und Tipp.
- **Korrektur per Antippen,** wenn die Zahlenerkennung falsch liegt.
- ~~**Offline und installierbar** als Web-App.~~ Umgesetzt (Startseite → „Für Erwachsene“).

## Numi

Numi (`andreas-luehning/numi`) bleibt eine **eigene Welt** mit eigener Belohnung (Numis Freunde). Idee: Auf der Startseite eine Kachel für Numi und eine für Numis Freunde, so wie Zehnerweg und Schneckengarten. Vorlesen wird nicht gebraucht. Schriften müssen nicht von Google kommen und werden lokal eingebunden. Vor dem Zusammenführen klären: gleiche Adresse (gemeinsamer Speicher, ein Service Worker) oder nur verlinkt.

## Offene Fragen

- Welche Tablets werden genutzt (Größe, Stift)?
- Fotos der Arbeitsblätter: entschieden, sie bleiben lokal und kommen nicht ins Git.
- Mehrere Kinder pro Tablet?
- Zehnerweg: Aufgaben, bei denen Ergebnis und eine andere Stelle vorgegeben sind? (siehe `zehnerweg.md`, Offene Punkte)
- ~~Mehr als eine Runde pro Tag~~ Umgesetzt: Einstellung „Runden pro Tag“, Standard 3, und Pause, wenn niemand schreibt.
