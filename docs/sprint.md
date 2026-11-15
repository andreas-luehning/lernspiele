# Sprint 16.–21.11.2026

Ziel bis Samstag: eine stabile Fassung auf `main`, die beiden wichtigsten Fehler aus dem Tablet-Test behoben und ein erster Leuchttisch-Entwurf mit Steinen zum Verschieben.
Gesamtliste: `backlog.md`. Regeln: `CLAUDE.md` (zuerst `docs/` anpassen, dann Code; `sw.js` VERSION erhöhen; Tests laufen lassen).

**Arbeitsweise:** Pro Aufgabe ein eigener Branch von `main`, sprechender Name (unten vorgegeben). Nach jeder Aufgabe: kurz sagen, was auf dem Tablet zu testen ist und welcher Branch deployt werden soll. Nur die genannten Tests laufen lassen, kurz antworten.

## Reihenfolge

| # | Aufgabe | Modell | Branch | Aufwand |
|---|---|---|---|---|
| 0 | Testfassung nach `main` übernehmen | Sonnet | – (Pull Request) | klein |
| 1 | Schalter „Deutsche Schreibschrift“ und deutsche 9 | Opus | `deutsche-schreibschrift` | mittel |
| 2 | Neue lustige Kopfbedeckungen, fehlende stärker bevorzugen | Sonnet | `neue-kopfbedeckungen` | klein |
| 3 | Burgen als Stufe im Leuchttisch, mit eigener Belohnung | Opus | `leuchttisch-burgen` | mittel |
| 4 | Numi einbauen: A zum Testen im Erwachsenenbereich, B für Kinder bis Samstag | Opus | `numi-einbauen` | mittel |
| 5 | Entwurf „Zehner voll machen“ mit Steinen zum Verschieben | Opus | `entwurf-zehner-voll-machen` | mittel |
| 6 | (nur wenn Zeit bleibt) Rundenbelohnung Leuchttisch klären | Opus | – (nur Doku) | klein |

Bewusst nicht in diesem Sprint: Zehnerweg über 20, Zahlenmauern, Smartphone-Fassung, Freischalten. Sie brauchen jeweils eigene Entscheidungen.

## 0 · Testfassung nach `main`

Erst wenn die Lehrkraft `ehrliche-runde-mit-weiter-knopf` auf dem Tablet für gut befunden hat.

> Lege einen Pull Request von `ehrliche-runde-mit-weiter-knopf` nach `main` an (Titel und Beschreibung auf Deutsch, Inhalt: ehrliche Runde, Weiter-Knopf, Hausfarben mit Namen, Wachstumsstufen, Straße, Schnecke geht mit, Backlog). Vorher prüfen, ob er sich ohne Konflikte zusammenführen lässt. Nicht selbst mergen.

Danach alle Branches von `main` aus anlegen.

## 1 · Deutsche Schreibschrift (Opus)

Rückmeldung: Die deutsche 9 wird nicht erkannt, nur die amerikanische. Die Einstellung „7 mit Querstrich“ soll ein Schalter „Deutsche Schreibschrift“ werden, der alles auf deutsch umstellt. Die 1 als einfacher Strich muss weiter gehen.

> Lies `CLAUDE.md`, `docs/zehnerweg.md`, `gemeinsam/ziffern.js`, `gemeinsam/einstellungen.js`, `tests/ziffern-browser.js`. Ziel: (a) Einstellung „7 mit Querstrich“ wird zum Schalter **„Deutsche Schreibschrift“** (an: 7 nur mit Querstrich, deutsche 1 mit Aufstrich und als einfacher Strich, deutsche 9 mit Bogen unten; aus: wie das Modell). Alte gespeicherte Einstellung übernehmen. (b) Herausfinden, warum die deutsche 9 nicht erkannt wird: Lege in `tests/ziffern-browser.js` mehrere realistische Strichfolgen für eine deutsche 9 an (Kreis oben, dann Bogen nach unten links, in einem und in zwei Strichen, schräg und gerade) und mach sie grün, ohne andere Ziffern schlechter zu machen (Gesamtquote muss bleiben). Erst `docs/zehnerweg.md` anpassen. Branch `deutsche-schreibschrift` von `main`. VERSION in `sw.js` erhöhen. Tests: `node tests/ziffern-browser.js`, `node tests/browser.js`.

Auf dem Tablet testen: 9, 7 und 1 in deutscher Schrift schreiben, mit Schalter an und aus.

## 2 · Neue Kopfbedeckungen (Sonnet)

> Lies `CLAUDE.md` und `docs/schneckenparade.md`. Füge drei Kopfbedeckungen hinzu: **Blaulicht** (Polizeisirene), **Satellitenantenne**, **Bauarbeiterhelm**. Gezeichnet im Stil der vorhandenen in `gemeinsam/parade-bilder.js` (gleiche Kontur, flache Farben, kein Rosa). Ins Sammelalbum aufnehmen. Außerdem: Doppelte Kopfbedeckungen kamen zu oft (z. B. zweimal Bommelmütze); fehlende Kopfbedeckungen mit **50 %** statt 20 % bevorzugen, Häuser bleiben bei 20 %. Erst `docs/schneckenparade.md` anpassen (Liste, Anzahl im Album). Branch `neue-kopfbedeckungen` von `main`. VERSION in `sw.js` erhöhen. Tests: `node tests/parade-logik.mjs`, `node tests/parade-browser.js`.

Auf dem Tablet testen: Hutschachtel im Garten, Sammelalbum.

## 3 · Burgen im Leuchttisch (Opus)

Entscheidung Lehrkraft (15.11.): Burgen werden eine Stufe im Leuchttisch, **parallel zu den Steinen**, aber mit **eigener Belohnung** (nicht Amulette). Der Prototyp `prototypen/burgen.html` ist fertig und erprobt.

> Lies `CLAUDE.md`, `docs/leuchttisch.md`, `docs/uebergaben/burgen-auftrag.md`, `prototypen/burgen.html` und `leuchttisch/`. Baue die Burgen als neue Stufe „Burg“ im Leuchttisch: Generator und Zeichnung (`makeCastle`, `renderCastle`, `drawPiece`, Bauteile) **aus dem Prototyp übernehmen, nicht neu erfinden**; Regeln wie im Auftrag (jedes Teil zählt 1, Turm · Mitte · Turm, 8–13 Teile). Gleiche Antworten (tippen/schreiben), Runde und Lernzeit wie bei den Steinen; „Zeig mir's“ zählt Turm, Mitte, Turm durch und zeigt „a + b + c = ?“, nie das Ergebnis. Keine Numi-Figuren, Schriften lokal, kein Inline-JS (CSP). **Belohnung:** zuerst 2–3 Vorschläge für eine eigene Burgen-Sammlung in `docs/leuchttisch.md` schreiben (z. B. Fahnen oder Wappen; Grundsatz 7: fertige Runde = Hauptbelohnung, richtige Burg = Extra) und die Lehrkraft entscheiden lassen, bevor die Belohnung gebaut wird. Branch `leuchttisch-burgen` von `main`. VERSION in `sw.js` erhöhen. Tests: `node tests/logik.mjs`, `node tests/browser.js`, `node tests/leuchttisch-browser.js`, dazu Logik-Tests für den Generator (immer 8–13 Teile, symmetrisch).

Auf dem Tablet testen: Burgen zählen, „Zeig mir's“, hoch und quer.

## 4 · Numi einbauen (Opus)

Entscheidung Lehrkraft (15.11.): Numi kommt **ganz hier hinein** (Ordner `numi/`), nicht nur verlinkt. Gründe: eine App, eine Installation, gemeinsame Lernzeit (Grundsatz 1). Numi-Repository `andreas-luehning/numi`: reines JavaScript ohne Build (React liegt lokal in `vendor/`, Code in `app.js`, ~1400 Zeilen), Speicher `numi-save-v1`, eigener Service Worker, lädt einmal Google Fonts, Inline-Skript in `index.html`. Gleiche Adresse (`andreas-luehning.github.io`), daher kann der alte Spielstand übernommen werden.

**Schritt A (zum Testen):** Numi als `numi/` einbauen und **nur über einen Link „Numi (Test)“ im Bereich „Für Erwachsene“** der Startseite erreichbar machen.
> Füge das Repository `andreas-luehning/numi` zur Sitzung hinzu. Lege `docs/numi.md` an (was übernommen wird, was angepasst wird). Kopiere Numi nach `numi/` (`index.html`, `app.js`, `vendor/`, Icons nur falls nötig). Anpassen: keine Google Fonts (lokale Schriften aus `gemeinsam/schriften/`), Inline-Skript und Inline-`<style>` in eigene Dateien, CSP/Referrer/Robots-Meta wie `zehnerweg/index.html`, Numis eigenen Service Worker weglassen (die Seite nutzt `gemeinsam/app.js` und `sw.js`; Numi-Dateien in `DATEIEN` eintragen), Zurück-Knopf zur Startseite. Speicher vorerst unverändert lassen (`numi-save-v1`), damit der bestehende Spielstand gilt. Entscheidung Lehrkraft: **Sprachansagen/Vorlesen entfallen** in Numi (ausbauen bzw. abschalten), Schriften lokal statt Google ist in Ordnung. Link „Numi (Test)“ im Erwachsenenbereich der Startseite, **keine** Kachel für Kinder. Branch `numi-einbauen` von `main`. VERSION in `sw.js` erhöhen. Tests: `node tests/app-browser.js` (Dateiliste), dazu ein Playwright-Test: `numi/` lädt ohne Fehler, ohne fremde Anfragen, ohne CSP-Verstöße.

**Schritt B (bis Samstag):** Kachel auf der Startseite, gemeinsame Runde und Lernzeit statt Numis eigener Minuten-Uhr, eigene Sammlung „Numis Freunde“ (Grundsatz 7), Speicher unter `lernspiele:numi` über `gemeinsam/speicher.js` mit einmaliger Übernahme aus `numi-save-v1`. Erst `docs/numi.md` ergänzen, dann bauen.

## 5 · Entwurf „Zehner voll machen“ (Opus)

Richtung aus dem Backlog: Steine zum Verschieben statt nur Zahl tippen. Laut `CLAUDE.md` neue Konzepte erst als Entwurf zeigen.

> Lies `CLAUDE.md`, `docs/leuchttisch.md`, `docs/backlog.md` (Abschnitt 3), `leuchttisch/` und `gemeinsam/schreibfeld.js` (robuste Zeiger-Logik). Baue einen **Entwurf** als neue Variante im Leuchttisch: Ein Schatzkästchen mit 10 Fächern liegt auf dem Tisch, einige Fächer sind schon mit Steinen gefüllt (z. B. 8), daneben liegen weitere Steine (z. B. 5). Das Kind **zieht** Steine mit Finger oder Stift ins Kästchen, bis es voll ist, dann beantwortet es „Wie viele sind es zusammen?“. Ziehen robust wie das Schreibfeld (ein Zeiger, `lostpointercapture`, Loslassen außerhalb), Steine rasten in freie Fächer ein, zurückziehen geht auch. Noch ohne Belohnung und Runde, nur zum Ausprobieren erreichbar (z. B. Stufen-Knopf „Zehner voll“ hinter einer Einstellung für Erwachsene). Erst einen Abschnitt in `docs/leuchttisch.md` schreiben. Branch `entwurf-zehner-voll-machen` von `main`. VERSION in `sw.js` erhöhen. Tests: `node tests/browser.js`, `node tests/leuchttisch-browser.js`, dazu ein kleiner Playwright-Test fürs Ziehen. Screenshots hoch und quer zeigen.

Auf dem Tablet testen: Ziehen mit Finger und Stift, auch schnell und über den Rand hinaus.

**Richtung danach (Entscheidung Lehrkraft, 15.11.):** „Zehner voll machen“ wird ein **eigenes Spiel** mit eigener Belohnung, in Richtung Burgen: Jeder volle Zehner wird ein leuchtender Zehnerstein, mit dem eine **Burg Stein für Stein wächst** (Mauer, Turm, Tor, Fahnen). Eine fertige 5-Minuten-Runde bringt ein besonderes Teil (Dach, Fahne). Eigene Sammlung, getrennt von Amuletten und Schnecken (Grundsatz 7). Im Sprint nur der Entwurf zum Ziehen.

## 6 · Rundenbelohnung Leuchttisch (Opus, nur wenn Zeit bleibt)

Offen seit dem Leuchttisch-Entwurf: Was bringt eine fertige 5-Minuten-Runde am Leuchttisch (Grundsatz 7: Durchhalten = Hauptbelohnung)? Nur Vorschläge in `docs/leuchttisch.md` schreiben, keinen Code.

## Startsatz für den neuen Chat

> Lies `CLAUDE.md`, `docs/sprint.md` und `docs/backlog.md`. Wir arbeiten den Sprint ab, beginnend mit Aufgabe [Nummer]. Halte dich an die Prompts in `docs/sprint.md`, frag nur, wenn eine Entscheidung fehlt.
