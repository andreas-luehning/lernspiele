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
| 3 | Entwurf „Zehner voll machen“ mit Steinen zum Verschieben | Opus | `entwurf-zehner-voll-machen` | mittel |
| 4 | (nur wenn Zeit bleibt) Rundenbelohnung Leuchttisch klären | Opus | – (nur Doku) | klein |

Bewusst nicht in diesem Sprint: Numi, Burgen, Zehnerweg über 20, Zahlenmauern, Smartphone-Fassung, Freischalten. Sie brauchen jeweils eigene Entscheidungen.

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

## 3 · Entwurf „Zehner voll machen“ (Opus)

Richtung aus dem Backlog: Steine zum Verschieben statt nur Zahl tippen. Laut `CLAUDE.md` neue Konzepte erst als Entwurf zeigen.

> Lies `CLAUDE.md`, `docs/leuchttisch.md`, `docs/backlog.md` (Abschnitt 3), `leuchttisch/` und `gemeinsam/schreibfeld.js` (robuste Zeiger-Logik). Baue einen **Entwurf** als neue Variante im Leuchttisch: Ein Schatzkästchen mit 10 Fächern liegt auf dem Tisch, einige Fächer sind schon mit Steinen gefüllt (z. B. 8), daneben liegen weitere Steine (z. B. 5). Das Kind **zieht** Steine mit Finger oder Stift ins Kästchen, bis es voll ist, dann beantwortet es „Wie viele sind es zusammen?“. Ziehen robust wie das Schreibfeld (ein Zeiger, `lostpointercapture`, Loslassen außerhalb), Steine rasten in freie Fächer ein, zurückziehen geht auch. Noch ohne Belohnung und Runde, nur zum Ausprobieren erreichbar (z. B. Stufen-Knopf „Zehner voll“ hinter einer Einstellung für Erwachsene). Erst einen Abschnitt in `docs/leuchttisch.md` schreiben. Branch `entwurf-zehner-voll-machen` von `main`. VERSION in `sw.js` erhöhen. Tests: `node tests/browser.js`, `node tests/leuchttisch-browser.js`, dazu ein kleiner Playwright-Test fürs Ziehen. Screenshots hoch und quer zeigen.

Auf dem Tablet testen: Ziehen mit Finger und Stift, auch schnell und über den Rand hinaus.

## 4 · Rundenbelohnung Leuchttisch (Opus, nur wenn Zeit bleibt)

Offen seit dem Leuchttisch-Entwurf: Was bringt eine fertige 5-Minuten-Runde am Leuchttisch (Grundsatz 7: Durchhalten = Hauptbelohnung)? Nur Vorschläge in `docs/leuchttisch.md` schreiben, keinen Code.

## Startsatz für den neuen Chat

> Lies `CLAUDE.md`, `docs/sprint.md` und `docs/backlog.md`. Wir arbeiten den Sprint ab, beginnend mit Aufgabe [Nummer]. Halte dich an die Prompts in `docs/sprint.md`, frag nur, wenn eine Entscheidung fehlt.
