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

## Neue Richtung

- **Das Numi-Thema fällt weg.** Keine Numi-Figuren, keine Namen wie Numi, Blubbi, Wuschel; kein Bezug zur Numi-App und ihrem Speicher.
- **Amulette auf dem Leuchttisch:** Statt Sternen, Blasen und Fusseln liegen Amulette (oder Teile davon) auf dem Leuchttisch. Die Belohnung soll in dieselbe Richtung gehen: Was das Kind gezählt hat, kann es sammeln.
- Noch offen ist, wie die Amulette aussehen, was genau gesammelt wird und wie das zur Schneckenparade passt (siehe unten).

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

1. **Amulette:** Wie sehen sie aus (Form, Steine, Farben)? Gibt es ein Vorbild aus dem Unterricht? Liegen auf dem Leuchttisch ganze Amulette oder Bausteine dafür?
2. **Belohnung:** Ersetzen Amulette die Schneckenparade für alle Spiele, oder gibt es Amulette nur bei den Leuchttisch-Spielen und Schnecken beim Zehnerweg? Oder werden Amulette im Schneckengarten gesammelt?
3. **Antworten:** Bei den Leuchttisch-Spielen weiter 4 Zahlenknöpfe (schnell, ohne Lesen) oder Zahl schreiben wie beim Zehnerweg?
4. **Runde:** Gilt auch hier die 5-Minuten-Runde einmal am Tag, oder bleiben die Leuchttisch-Spiele freies Üben?
5. **Burgen:** Bleiben die Burgen als eigenes Spiel, oder werden sie ein Teil des Amulett-Themas (z. B. Schatzburg)?
