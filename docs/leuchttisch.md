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

## Neue Richtung (Brainstorming läuft, Stand 08.11.2026)

### Was schon feststeht

- **Das Numi-Thema fällt weg.** Keine Numi-Figuren, keine Namen wie Numi, Blubbi, Wuschel; kein Bezug zur Numi-App und ihrem Speicher.
- **Ein Spiel „Leuchttisch“** mit mehreren Varianten statt zwei getrennter Spiele. Burgen sind eine Variante, später kommen weitere dazu (z. B. Zahlenmauern).
- **Edelsteine statt Kringel, Blasen, Fussel.** Verschiedene Sorten liegen auf dem Leuchttisch. Der Acryl-Look der Prototypen passt gut dazu, weil Edelsteine durchscheinen.
- **Amulette sind die Belohnung, ein eigenes System** (nicht die Schneckenparade). Aus gesammelten Edelsteinen werden Amulette.
- **Antwort je nach Gerät:** schreiben (Stift, Zahlenerkennung wie beim Zehnerweg) oder tippen (Zahlenknöpfe).
- **Die 5-Minuten-Runde und das Thema Medienzeit gelten auch hier.**
- **Vorbild Amulett** ist nur die Stimmung (ein magisches Amulett, das Steine sammelt). Keine Figuren, Namen oder Bilder aus Filmen und Serien; Amulette und Steine zeichnen wir selbst. Motiv neutral halten (Schatz, Forscher, Zauber), nicht als „Prinzessinnen-Thema“ (Grundsatz 5).

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

1. **Medienzeit:** 5 Minuten pro Spiel oder 5 Minuten am Tag für alle Spiele zusammen?
2. **Schnecken und Amulette:** Schnecken beim Zehnerweg, Amulette beim Leuchttisch? Oder sollen Amulette die Schnecken ganz ersetzen?
3. **Edelsteine:** Passen die 6 Sorten? Gibt es echte Steine aus dem Unterricht als Vorbild?
4. **Amulett:** Wie viele Steine braucht ein Amulett? Bleibt es bei einem Stein pro richtiger Aufgabe?
5. **Schreiben oder tippen:** Automatisch erkennen (Stift berührt das Tablet) oder als Einstellung für die Eltern?
6. **Reihenfolge:** Mit welcher Variante fangen wir an? Vorschlag: erst „Steine zählen und zerlegen“ (Wurftisch-Prototyp), dann die Burg.

Nächster Schritt nach den Antworten: ein kleiner Entwurf (HTML-Mockup) zum Anschauen, noch ohne fertiges Spiel.
