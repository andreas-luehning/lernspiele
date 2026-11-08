# Leuchttisch-Spiele: Unterlagen und Abgleich

Stand: 08.11.2026. **Noch nichts gebaut.** Diese Datei sammelt die Unterlagen, gleicht sie mit den Grundsätzen in `CLAUDE.md` ab und hält die neue Richtung fest.

## Unterlagen

| Datei | Inhalt |
|---|---|
| `prototypen/burgen.html` | Burgen-Testversion: Turm · Mitte · Turm aus Acryl-Bausteinen, 8–13 Teile, 4 Antworten, „Zeig mir's“ |
| `prototypen/leuchttisch.html` | Wurftisch auf dem Leuchttisch: Teile werden gestreut, 3 Stufen (Zählen 2–6, Zerlegen bis 7, bis 10), Schieber „Zwei Farben“ |
| `docs/uebergaben/burgen-auftrag.md` | Ursprünglicher Auftrag zur Burgen-Datei (aus dem Numi-Umfeld) |
| `docs/uebergaben/leuchttisch-uebergabe.md` | Übergabe zum Wurftisch: Entscheidungen, Parkliste, offene Fragen |

Die Prototypen und Übergaben bleiben unverändert, so wie sie geliefert wurden. Sie sind die Vorlage. Die beiden Spiele entsprechen den Ideen „Burgen“ und „Gegenstände“ in `ideen-und-offene-fragen.md`.

## Neue Richtung (Stand 08.11.2026)

### Was feststeht

- **Das Numi-Thema fällt weg.** Keine Numi-Figuren, keine Namen wie Numi, Blubbi, Wuschel; kein Bezug zur Numi-App und ihrem Speicher.
- **Ein Spiel „Leuchttisch“** (Ordner `leuchttisch/`) mit mehreren Varianten statt zwei getrennter Spiele. Reihenfolge: **erst Steine zählen und zerlegen, dann die Burg**, später weitere (z. B. Zahlenmauer).
- **Edelsteine statt Kringel, Blasen, Fussel.** Sechs Sorten, jede mit eigener Farbe **und** eigener Form. Es gibt kein Vorbild aus dem Unterricht; wir zeichnen sie selbst.
- **Amulette sind die Belohnung des Leuchttischs, ein eigenes System.** Die Schnecken bleiben beim Zehnerweg.
- **Ein Amulett hat vorläufig 5 Fassungen.** Jede richtige Aufgabe setzt einen Stein ein. Ein Amulett soll in einer Runde erreichbar sein; die Zahl wird nach dem Ausprobieren angepasst.
- **Antwort: tippen oder schreiben, die Eltern stellen es ein** (im Bereich für Erwachsene). Schreiben nutzt dieselbe Zahlenerkennung wie der Zehnerweg.
- **Medienzeit:** Eine Runde dauert 5 Minuten. Zusammen etwa **20 Minuten am Tag für alle Spiele**.
- **Vorbild Amulett** ist nur die Stimmung (ein magisches Amulett, das Steine sammelt). Keine Figuren, Namen oder Bilder aus Filmen und Serien. Motiv neutral halten (Schatz, Zauber, Forschen), nicht als „Prinzessinnen-Thema“ (Grundsatz 5).

### Edelsteine

| Stein | Farbe | Form |
|---|---|---|
| Rubin | Rot | Tropfen |
| Saphir | Blau | Raute |
| Smaragd | Grün | Achteck |
| Amethyst | Lila | Sechseck |
| Bernstein | Orange | Oval |
| Topas | Gelb | Dreieck |

### Regeln für den ersten Entwurf (Steine zählen und zerlegen)

| Wann | Was passiert |
|---|---|
| Stufe 1: Zählen | 2–6 Steine einer Sorte liegen verstreut. „Wie viele Steine sind es?“ |
| Stufe 2 und 3: Zerlegen | Zwei lockere Gruppen (links/rechts), 5–7 bzw. 7–10 Steine. „Wie viele sind es zusammen?“ Standard: zwei Sorten; die Eltern können auf eine Sorte umstellen. |
| Richtig | Ein Stein der Aufgabe wandert in die nächste freie Fassung des Amuletts. Kurz stehen lassen, dann kommen von selbst neue Steine. |
| Amulett voll | Es kommt in die Schatzkiste, ein neues leeres Amulett erscheint. |
| Falsch | Sanftes Wackeln, ein Tipp, beliebig oft probieren. Beim Zerlegen erscheint „a + b = ?“. Nichts geht verloren. |
| „Zeig mir's“ | Zählen: Die Steine werden nacheinander nummeriert. Zerlegen: Beide Gruppen werden umrandet, mit ihrer Anzahl, dann „a + b = ?“. Das Ergebnis wird nie verraten. |
| Angefangenes Amulett | Bleibt gespeichert, auch über Nacht (wie die Salatblätter). |

Gespeichert unter `lernspiele:leuchttisch`: `{ version: 1, stufe, eingabe: "tippen" | "schreiben", zweiSorten, fassung: [Steine], amulette: [[Steine], …] }`. Beim Lesen werden nur bekannte Steine übernommen.

Noch nicht im Entwurf: 5-Minuten-Runde und Tageszeit (kommt mit `gemeinsam/runde.js`), Burg, Schatzburg.

### Ideen zum Weiterdenken (noch nicht entschieden)

**Edelsteine:** 6 Sorten, jede mit eigener Form und Farbe, damit man sie auch ohne Farbsehen unterscheidet. Zum Beispiel Rubin (rot, Tropfen), Saphir (blau, Raute), Smaragd (grün, Achteck), Amethyst (lila, Sechseck), Bernstein (orange, Oval), Mondstein (hellblau, Kreis).

**Varianten im Spiel Leuchttisch:**

| Variante | Was das Kind tut | Kompetenz |
|---|---|---|
| Steine zählen | Gestreute Steine zählen (2–10) | Menge erfassen |
| Steine zerlegen | Zwei Sorten, zwei lockere Gruppen: „Wie viele zusammen?“ | Teil-Teil-Ganzes |
| Burg | Bausteine der Burg zählen (Turm · Mitte · Turm) | Strukturiert zählen, Verdoppeln |
| Zahlenmauer | Unten zwei Steinhaufen, oben die Summe; später fehlt ein Teil | Addieren, Ergänzen |
| Kette | Steine an einer Kette in Fünfergruppen | Bündeln, Zehnerübergang |
| Spiegel | Ein halbes Amulett, die andere Hälfte ist gespiegelt | Verdoppeln |

**Amulette sammeln (Vorschlag, angelehnt an die Schneckenparade):**
- Ein Amulett hat zum Beispiel 3 leere Fassungen. Jede richtige Aufgabe bringt einen Stein in eine Fassung.
- Ist das Amulett voll, kommt es in die Schatzkiste. Wie es aussieht, hängt von den Steinen ab.
- Bei einem Fehler geht nichts verloren. Der Stein kommt einfach bei der nächsten richtigen Aufgabe.
- Ab und zu ein seltenes Amulett (z. B. mit Regenbogenstein).
- Die Burg könnte zur **Schatzburg** werden, in der die Amulette ausgestellt sind.

**Wo die Antwort steht:** Auf dem Tablet mit Stift schreibt das Kind die Zahl in ein Feld direkt auf dem Leuchttisch, ohne Stift tippt es auf die Zahlenknöpfe. Ob das automatisch erkannt wird oder die Eltern es einstellen, ist offen.

## Was gut zu den Lernspielen passt

- Fehler kosten nichts, die Hilfe zeigt den Weg und verrät nie das Ergebnis, Sterne gehen nie verloren. Das stimmt mit Grundsatz 3 überein.
- Reines HTML/CSS/JS ohne Build, ohne Abhängigkeiten.
- Der Acryl-Look (SVG-Filter `#glow`) und die Generatoren (`makeCastle`, `renderCastle`, `addPoints`) sind erprobt und können übernommen werden.
- „Kein Blitzblick“ (Übergabe, Entscheidung 7) widerspricht der alten Idee in `ideen-und-offene-fragen.md` („Burg blitzt kurz auf“). Die Entscheidung aus der Übergabe gilt; die Idee wird entsprechend angepasst.

## Unverträglichkeiten (vor dem Bauen klären)

| Thema | Unterlagen | Lernspiele (`CLAUDE.md`) | Vorschlag |
|---|---|---|---|
| Ort | Eigenes Repo bzw. eigene App, getrennt | Ein Repo, jedes Spiel ein Ordner (`burgen/`, `gegenstaende/`) | In dieses Repo als eigene Ordner |
| Schriften | Baloo 2 und Nunito von Google Fonts | Grandstander und Andika, lokal; keine fremden Server | Lokale Schriften aus `gemeinsam/schriften/` |
| Farben/Stil | Eigene Farbwerte, `zh-`-Klassen | Farb-Tokens in `gemeinsam/theme.css`, Hell/Nacht | Leuchttisch-Farben behalten, Rahmen und Knöpfe aus `theme.css` |
| Speicher | `numi-burgen-stars`, `numi-wurf-test-stars` | `lernspiele:…` über `gemeinsam/speicher.js` | `lernspiele:burgen`, `lernspiele:gegenstaende`; kein Numi-Wert übernehmen |
| Sicherheit | Inline-Skript und -Styles, `innerHTML` | CSP, kein Inline-JS/-CSS, `textContent` | In Dateien aufteilen wie beim Zehnerweg |
| Antworten | 4 Zahlenknöpfe | Zahlenerkennung (Schreibfeld) war geplant | Offen, siehe Fragen |
| Runde | Freies Üben, endlos | 5-Minuten-Runde, eine pro Tag | Offen, siehe Fragen |
| Belohnung | +1 Stern pro Aufgabe | Schneckenparade für alle Spiele | Offen: Amulette, siehe Fragen |
| Service Worker | Eigener pro Modul | Später einer für die ganze Seite | Einer für alle Spiele, später |

## Offene Fragen an die Lehrkraft

1. **Medienzeit:** Wie werden die 20 Minuten verteilt? Zum Beispiel 4 Runden zu 5 Minuten, frei auf die Spiele verteilt? Darf dasselbe Spiel mehrmals am Tag gespielt werden? (Die Schneckenparade sieht bisher eine Runde am Tag vor.)
2. **Amulett:** Passen 5 Fassungen nach dem Ausprobieren?
3. **Aussehen:** Gefallen die Steine und das Amulett im Entwurf?
