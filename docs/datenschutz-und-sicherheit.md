# Datenschutz und Sicherheit

Die Spiele werden von Kindern benutzt. Darum gilt: **so wenig Daten wie möglich, und nichts verlässt das Gerät.** Diese Seite beschreibt, wovor wir uns schützen, was schon umgesetzt ist und worauf bei neuen Funktionen zu achten ist.

## Grundsätze

1. **Keine Daten an Dritte.** Die Seiten laden nur Dateien von der eigenen Adresse. Keine CDNs, kein Google Fonts, keine Analyse- oder Werbedienste, keine eingebetteten Videos.
2. **Keine Konten, kein Server.** Es gibt nichts, wo man sich anmeldet, und nichts, was Daten empfängt.
3. **Datensparsamkeit auf dem Gerät.** Gespeichert wird nur, was das Spiel braucht (Sterne, Einstellungen, später Garten). Keine Namen, kein Alter, keine Handschrift.
4. **Handschrift bleibt flüchtig.** Striche werden im Arbeitsspeicher erkannt und beim Löschen oder bei der nächsten Aufgabe verworfen. Sie werden weder gespeichert noch übertragen.
5. **Nichts Persönliches im Repository.** Das Repository ist öffentlich. Keine Fotos aus dem Unterricht, keine Namen von Kindern, Lehrkräften oder der Schule, keine Kinderschrift-Proben, keine Zugangsdaten.

## Was schon umgesetzt ist

| Risiko | Schutz | Wo |
|---|---|---|
| Daten fließen an fremde Server (IP-Adresse, Nutzungszeiten) | Schriften liegen im Repository; Content Security Policy erlaubt nur die eigene Adresse (`default-src 'none'`, sonst `'self'`) | `<meta http-equiv="Content-Security-Policy">` in jeder HTML-Seite, `gemeinsam/schriften/` |
| Eingeschleuster Code (XSS) | Kein Inline-JavaScript, CSP ohne `'unsafe-inline'`. Texte werden mit `textContent` gesetzt. `innerHTML` nur für feste, eigene SVG-Formen und selbst berechnete Zahlen, nie für gespeicherte Daten oder Eingaben | alle Skripte |
| Manipulierte oder kaputte Daten in `localStorage` | Beim Lesen wird nur übernommen, was im Standard-Objekt vorkommt und den richtigen Typ hat. Unbekannte Schlüssel (auch `__proto__`) werden verworfen, Zahlen begrenzt. Kaputtes JSON führt zu Standardwerten | `gemeinsam/speicher.js` |
| Manipulierte Gartendaten (Schneckenparade) | Jede Schnecke wird beim Lesen geprüft: nur bekannte Farben, Muster, Hüte; Namen höchstens 20 Zeichen und nur per `textContent` angezeigt; doppelte IDs, unsinnige Zahlen und unbekannte Deko werden verworfen; höchstens 3000 Tiere | `gemeinsam/parade-logik.js` (`bereinigeZustand`) |
| Alte und neue Dateien gemischt (Browser-Cache) | Service Worker lädt immer zuerst frisch (`cache: 'no-cache'`), nur offline aus dem eigenen Speicher; alte Speicherstände werden bei neuer Version gelöscht | `sw.js` |
| Manifest und Service Worker durch CSP blockiert / zu weit erlaubt | `manifest-src 'self'` und `worker-src 'self'`: nur eigene Dateien | CSP in jeder Seite |
| Verweis verrät, woher jemand kommt | `<meta name="referrer" content="no-referrer">`, `fetch` ohne Cookies und Referrer | HTML-Seiten, `gemeinsam/ziffern.js` |
| Seite taucht in Suchmaschinen auf | `<meta name="robots" content="noindex">` (verhindert nur das Auflisten, nicht den Zugriff) | HTML-Seiten |
| Fremder Code über Abhängigkeiten (Supply Chain) | Keine Bibliotheken, kein Build-Schritt, kein npm im ausgelieferten Code | gesamtes Projekt |
| Browser bremst durch Dauerkritzeln | Obergrenze für Punkte pro Feld, Modellgröße wird beim Laden geprüft | `gemeinsam/schreibfeld.js`, `gemeinsam/ziffern.js` |
| Fotos oder Daten landen im Git | `.gitignore` schließt Fotos, private Ordner und Trainingsdaten aus | `.gitignore` |

Automatisch geprüft (`tests/browser.js`, Playwright): keine Anfragen an fremde Server, keine CSP-Verstöße, manipulierter und kaputter Speicher wird abgefangen.

**Bekannte Ausnahme:** Die Dateien in `prototypen/` laden noch Schriften von Google Fonts und haben keine CSP. Sie bleiben laut Absprache unverändert. Auf dem Tablet deshalb die Spiele über die Startseite öffnen, nicht die Prototypen.

### Einstellungen

`lernspiele:spiel` speichert nur, ob die Regel „7 nur mit Querstrich“ an ist (wahr/falsch) und wie viele Runden es pro Tag gibt (Zahl aus einer festen Liste), geprüft über `speicher.js`.

### Welche Daten die Schneckenparade speichert

Nur Spielstand: Schnecken (Farbe, Muster, Hut, Ausflüge, Datum, in welchem Spiel verdient), gewählte Begleiter, Blätter, Übungstage und die laufende Runde. Die Schneckennamen kommen aus einer festen Liste, nicht vom Kind. Es gibt keine Uhrzeiten einzelner Aufgaben, keine Fehlerlisten und nichts über das Kind selbst. Der Probe-Modus (`?probe`) ändert nur die Rundendauer und zeigt den Knopf „Nächster Tag“; er gibt keinen Zugriff auf weitere Daten.

## Grenzen von GitHub Pages

- GitHub Pages erlaubt keine eigenen HTTP-Header. Die CSP steht deshalb als `<meta>`-Tag in jeder Seite. `frame-ancestors` (Schutz davor, dass eine fremde Seite das Spiel einbettet) geht so nicht. Das Risiko ist klein, weil es keine Anmeldung und keine wichtigen Aktionen gibt.
- In den Pages-Einstellungen **„Enforce HTTPS“** eingeschaltet lassen.
- „Öffentlich“ heißt: Jeder kann den Code und die Commit-Geschichte lesen, auch Namen und E-Mail-Adressen der Commit-Autoren. Empfehlung: In den GitHub-Einstellungen unter „Emails“ **„Keep my email addresses private“** einschalten, dann wird eine `noreply`-Adresse verwendet.
- Die Adresse `https://<konto>.github.io/lernspiele/` enthält den GitHub-Kontonamen. Wer das nicht möchte, kann ein eigenes, neutrales Konto oder eine Organisation verwenden.
- Was einmal gepusht ist, bleibt in der Geschichte, auch wenn die Datei später gelöscht wird. Darum vor jedem Commit prüfen (Checkliste unten).

## Bei neuen Funktionen beachten

- **Vorlesen (Web Speech API):** Nur Stimmen mit `voice.localService === true` verwenden. Online-Stimmen (z. B. in Chrome „Google Deutsch“) schicken den Text an einen Server.
- **Service Worker (`sw.js`, umgesetzt):** Speichert nur eigene Dateien (gleiche Herkunft), keine fremden Adressen; Gültigkeitsbereich ist der Projektordner. Er speichert keine Spieldaten, die liegen weiter nur in `localStorage`. Bei Änderungen `VERSION` erhöhen, damit alte Stände gelöscht werden.
- **Schnecken umbenennen, Profile für mehrere Kinder:** Namen nur lokal speichern, Länge begrenzen (z. B. 20 Zeichen), immer mit `textContent` anzeigen. Im Hinweis für Eltern empfehlen: Spitzname statt echtem Namen.
- **Elternansicht:** Die Rechenaufgabe davor ist eine Kindersperre, kein Schutz vor Erwachsenen. Dort keine Daten zeigen, die über das Üben hinausgehen.
- **Kinderschrift zum Nachtrainieren:** Nur mit ausdrücklichem Einverständnis der Eltern, nur lokal, nie ins Repository und nie in eine Cloud.
- **Export/Import des Gartens** (falls gewünscht): Importierte Dateien wie gespeicherte Daten behandeln, also prüfen und bereinigen.
- **Neue Seiten:** CSP-, Referrer- und Robots-Meta-Tags aus `zehnerweg/index.html` übernehmen.
- **Bibliotheken:** Möglichst keine. Falls doch: Datei ins Repository kopieren (nicht per CDN laden), feste Version, Lizenz prüfen und beilegen.

## Checkliste vor jedem Commit und Pull Request

- [ ] `git status`: keine Fotos, keine Scans, keine Dateien aus `privat/`
- [ ] Keine Namen von Kindern, Lehrkräften oder der Schule, keine E-Mail-Adressen, auch nicht in Kommentaren oder Testdaten
- [ ] Keine Adressen fremder Server im Code (`grep -rn "https://" --include=*.html --include=*.js --include=*.css`)
- [ ] Neue Texte aus Speicher oder Eingabe nur mit `textContent`
- [ ] Playwright-Prüfung: keine fremden Anfragen, keine CSP-Verstöße
