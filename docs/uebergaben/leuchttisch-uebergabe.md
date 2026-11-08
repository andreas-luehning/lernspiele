# Übergabe an Claude Code: „Numis Leuchttisch" (Wurftisch-Modul)

Stand: 06.11.2026 · Quelle: Chat-Stream „Wurfspiel / Blitz-Zählen"

## 1. Auftrag in einem Satz

Aus der fertigen Einzeldatei `Numi-Wurftisch-Leuchttisch-Testversion.html` ein **eigenständiges kleines Projekt** machen (eigenes Repo, eigenes Deployment). Es wird **nicht** in die Numi-App integriert. Kein Abgleich mit `Numi.jsx`, kein gemeinsamer service-worker, kein gemeinsamer Speicher.

Der Nutzer ist **Grundschullehrer, kein Berufs-Entwickler**. Jeden Schritt kurz und in einfachen Worten erklären, keine unerklärten Fachbegriffe. Didaktik auf Augenhöhe besprechen.

## 2. Arbeitsregeln (aus dem Numi-Projekt übernommen)

- **Erst prüfen, dann bauen.** Vor jeder Code-Änderung den Ist-Zustand abgleichen, Unverträglichkeiten melden, auf Bestätigung warten.
- **Service-Worker:** Sobald einer existiert, bei *jeder* Änderung die Cache-Version hochzählen, sonst laden Tablets die alte Version.
- **Gespeicherte Daten:** Neue Felder in `localStorage` brauchen immer einen Fallback, nie ein Crash bei fehlenden Werten.
- **Neue Aufgaben-Konzepte:** erst als HTML-Mockup zeigen, dann bauen.
- **Mehr als 2 Runden am selben Ding:** kurz innehalten und fragen, ob das noch der geplante Umfang ist.

## 3. Pädagogische Leitplanken (nicht verhandelbar)

- Kein Zeitdruck-Zwang. Fehler werden nie hart bestraft.
- Hilfe zeigt den Lösungsweg, nie die fertige Antwort.
- Sterne können nur dazukommen, nie sichtbar verloren gehen.
- Kindgerechte Sprache ab ca. 7 Jahren: kurze Sätze, wenig Text.
- Optik: warmer, weicher „Knet-Spielzeug"-Look, Schriften Baloo 2 und Nunito, Farbwerte und `zh-`-Klassen aus der Datei als Referenz, keine neuen Stile erfinden.

**Fachliche Einordnung:** Mengen erfassen und in zwei Teilmengen zerlegen (Teil-Teil-Ganzes). Klasse 2, Zahlvorstellung bis 10, Vorbereitung auf das Rechnen mit Zehnerübergang.

## 4. Was die Datei heute kann

Eine einzelne HTML-Datei (363 Zeilen), reines HTML/CSS/JavaScript, **kein Build, keine Abhängigkeiten**.

**Spielablauf**
- Freunde („Numi wirft Sterne", „Blubbi wirft Blasen" usw.) werfen Acryl-Teile auf einen Leuchttisch. Das Kind tippt die Antwort aus vier Zahlen.
- **3 Stufen** (Knöpfe oben): 1 = Zählen (2–6), 2 = Zerlegen bis 7, 3 = Zerlegen bis 10.
- **Zerlegen:** Zwei getrennte Gruppen (links/rechts). Frage: „Wie viele sind es zusammen?"
- **Schieber „Zwei Farben"** (Standard an): an = jede Gruppe ein eigener Freund mit eigener Farbe und Form. Aus = beide Gruppen gleich.
- **Richtig:** Karte wird grün, +1 ⭐, Meldung bleibt ca. 2,2 s stehen, dann **automatisch nächste Aufgabe**. „Nochmal werfen" geht jederzeit manuell.
- **Falsch:** sanftes Wackeln, Hinweis, keine Strafe, beliebig oft probierbar.
- **„💡 Zeig mir's":** Zählen = Teile werden einzeln durchnummeriert. Zerlegen = beide Gruppen werden nacheinander umrandet (mit ihrer Anzahl) und die Rechnung „a + b = ?" erscheint. Das Ergebnis verrät es nie.
- **Sterne:** Zähler oben links, nur aufwärts.

**Technik, die man wissen muss**

| Thema | Stand |
|---|---|
| Sterne-Speicher | `localStorage`-Schlüssel `numi-wurf-test-stars`, immer in `try/catch`, Fallback 0 |
| Daten | `THEMES` (5 Freunde: Name, Text, Farbe, Zeichenfunktion, Emoji), `LEVELS` (3 Stufen), jeweils ein Array am Dateianfang des Scripts |
| Verteilen | `addPoints()` platziert Teile zufällig ohne Überlappung. Wird es eng, verkleinert sie den Mindestabstand schrittweise (56 → 24). **Platziert immer genau so viele Teile, wie die Aufgabe sagt**, sonst wäre die richtige Antwort falsch. |
| Acryl-Look | Ein SVG-Filter `#glow` (Weichzeichner) plus ca. 40 % Füllung, feine Farbkante, kleiner Glanzpunkt. Rezept stammt von der Burgen-Testversion. |
| Runden | `roundId` verhindert, dass ein alter Auto-Weiter-Timer eine neue Aufgabe überschreibt |
| Schriften | Aktuell per Google-Fonts-`@import` geladen. **Das funktioniert offline nicht** (siehe Abschnitt 6). |

**Die zweite Datei** `Numi-Wurftisch-Testversion.html` (Holztisch) ist ein **älterer Zwischenstand**: 5 Stufen, kein Zwei-Farben-Schieber, kein Auto-Weiter, kein Fix für das Verteilen. Sie dient nur als Optik-Vergleich. **Nicht weiterentwickeln, nicht als Basis nehmen.**

## 5. Entscheidungen und warum (nicht wieder aufmachen)

1. **Zufällige Streuung beibehalten.** Der Nutzer will, dass Kinder Mengen unbewusst im Kopf strukturieren. Ein Zehnerfeld wurde angeboten, aber nicht gewählt.
2. **Zerlegen mit zwei sichtbaren Gruppen.** Ein komplett zufälliger Haufen lässt „4 und 3" nicht erkennen. Deshalb zwei lockere Hälften, in sich zufällig.
3. **Zwei Freunde, zwei Farben** macht die Teilmengen sofort lesbar. Als Schieber, weil „Einfach/Spiel" niemand verstanden hat und oben zu voll war.
4. **Anzahlen an den Gruppen**, nicht „a/b". Die Zahl in der Umrandung ist für Kinder aussagekräftiger.
5. **Leuchttisch gedämpft**, nicht hellweiß. Ein heller Tisch blendet auf Tablets.
6. **Echtes Acryl (durchscheinend)** ist gewollt. Das Gegenargument „verschmilzt beim Zählen" greift nicht, weil die Teile nie überlappen.
7. **Kein Blitzblick** (kurz zeigen, dann weg). Wäre ein Zeitelement, das mit „kein Zeitdruck" kollidiert.
8. **Nur 3 Stufen.** Zerlegen ist die wertvolle Kompetenz und bekommt deshalb zwei davon.
9. **Oben bewusst reduziert:** nur Stufen-Zeile plus Schieber, keine Untertitel, keine „X wirft…"-Zeile.

## 6. Vorschlag für die Zielstruktur (bitte erst prüfen, dann bestätigen lassen)

```
numi-leuchttisch/
├── index.html          ← die Datei, umbenannt
├── manifest.webmanifest
├── service-worker.js   ← mit Cache-Version
├── icons/              ← 192 und 512 px
├── fonts/              ← Baloo 2 und Nunito lokal
└── README.md
```

Reihenfolge, wie ich sie sinnvoll fände:

1. **Neues Repo anlegen** (z. B. `numi-leuchttisch`), Datei als `index.html` einchecken. Die Datei läuft unverändert, dies ist der Sicherheitsanker.
2. **Deployment über GitHub Pages**, wie bei Numi.
3. **Schriften lokal einbinden**, damit es offline und ohne Google-Verbindung läuft (Datenschutz, Schule).
4. **PWA ergänzen:** Manifest, Icons, Service-Worker mit Cache-Version. Damit installierbar und offline nutzbar.
5. **Sterne-Schlüssel entscheiden:** Aktuell `numi-wurf-test-stars`. Beim Umbenennen den alten Wert einmalig übernehmen, damit nichts verloren geht. Eigener Schlüssel, **nicht** mit der Numi-App teilen.

## 7. Offene Fragen an den Nutzer (vor dem Bauen stellen)

- Soll die Seite unter eigener Adresse laufen oder als Unterseite des bestehenden Numi-Repos? (Hat Folgen für Pfade und Service-Worker.)
- Soll sie **sichtbar mit Numi verlinkt** sein (z. B. Button „Zurück zu Numi") oder ganz getrennt bleiben?
- Name und Icon fürs Home-Bildschirm-Symbol.

## 8. Parkliste (bewusst nicht jetzt)

- Blitzblick als freiwilliger Knopf „Nochmal blitzen", ohne Strafe.
- Zehnerfeld-/Mulden-Variante als optionaler Vergleich, nur auf Zuruf.
- Feintuning der Acryl-Deckkraft nach echtem Test mit Kindern am Tablet.
- Zähl-Stufe: Hier nummeriert „Zeig mir's" die Teile weiter einzeln durch (reines Zählen). Beim Zerlegen wurde die Nummerierung bewusst abgeschafft. Ob die Zähl-Stufe das auch bekommen soll, ist **offen** und sollte mit Kindern beobachtet werden.
- Button „Nochmal werfen" ist durch Auto-Weiter fast überflüssig, bleibt aber für ungeduldige Kinder. Kann nach Beobachtung entfallen.

## 9. Startsatz für den Claude-Code-Chat

> Heute: Leuchttisch (eigenständiges Wurftisch-Modul). Lies `Wurftisch-Uebergabe-Claude-Code.md` und `Numi-Wurftisch-Leuchttisch-Testversion.html`, gleiche ab und melde Unverträglichkeiten. Noch nichts ändern, bis ich den Abgleich bestätigt habe.
