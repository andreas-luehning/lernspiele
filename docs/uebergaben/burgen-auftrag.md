# Numi Burgen — Auftrag für Claude Code

**Ziel:** Baue aus der beigelegten Testdatei ein **eigenständiges, abgekoppeltes**
Lern-Modul „Numi Burgen" — eine kleine Web-App für Grundschulkinder (Klasse 2),
die offline auf dem Tablet läuft und über GitHub Pages veröffentlicht wird.

> **Wichtig für dich, Claude Code:** Dieses Modul ist **nicht** Teil der Numi-App
> und soll es auch nicht werden. Keine Verbindung zu `Numi.jsx`, kein gemeinsamer
> Speicher, kein gemeinsamer Service Worker. Das Konzept ist bereits erprobt und
> abgenommen — **bau es so, verbessere die Didaktik nicht eigenmächtig um.**

---

## 0. Quelle der Wahrheit

Die Datei **`Numi-Burgen-Testversion.html`** (liegt bei) ist die funktionierende
Referenz. Übernimm daraus **unverändert**:

- den Burg-Generator und die SVG-Zeichnung (`makeCastle`, `renderCastle`,
  `drawPiece` und alle Bauteil-Funktionen) — **nicht neu erfinden**,
- die Interaktion: 4 Antwortoptionen, „Zeig mir's"-Hilfe, „Neue Burg",
- den Look (Farben, Schriften, Rundungen, Leuchttisch).

Diese Regeln des Moduls bleiben, wie sie sind:

- **Zählregel:** jedes Bauteil zählt als **1** (auch lange Quader, Platten, Zylinder).
- **Aufbau:** Turm · Mitte · Turm, symmetrisch; Dach/Keil/Kugel immer oberster Stein;
  nichts schwebt.
- **Teilezahl 8–13.**
- **„Zeig mir's":** zählt die Teile einzeln durch und zeigt danach die Rechnung
  mit **?** — **das Ergebnis wird nie verraten**, das rechnet das Kind selbst.

---

## 1. Pädagogische Leitplanken (nicht verhandelbar)

Diese gelten für jede Zeile, die du schreibst:

- **Kein Zeitdruck.** Keine Uhr, kein Countdown, kein „schneller = besser".
- **Fehler werden nie hart bestraft.** Bei falscher Antwort erscheint nur die
  Chip-Rechnung als Denkhilfe — kein Leben verloren, kein Punktabzug, kein
  negatives Geräusch, das sich wie Strafe anfühlt.
- **Hilfe zeigt den Weg, nicht die Antwort.**
- **Sterne können nur dazugewinnen, nie sichtbar verlieren.**
- **Sprache kindgerecht ab ~7 Jahren:** kurze Sätze, wenig Text, auch beim Lesen.
- **Optik:** warmer, weicher „Knet-Spielzeug"-Look. Schriften **Baloo 2** und
  **Nunito** (wie in der Testdatei). Farbwerte aus der Testdatei übernehmen,
  keine neuen Stile erfinden.

---

## 2. Was die App tut (Zielbild)

Freies Üben, ohne Konto, ohne Login:

1. Es erscheint eine Burg. Frage: „Wie viele Bausteine hat die Burg?"
2. Vier Antwortknöpfe, einer stimmt.
3. **Richtig:** Bestätigung mit voller Rechnung **+1 ⭐** (Stern-Zähler oben steigt).
4. **Falsch:** sanfter Hinweis + Chip-Rechnung mit **?**, Kind darf weiter probieren.
5. „🔄 Neue Burg" erzeugt endlos neue Burgen. **Kein** Sitzungsende, **kein** Bericht.

---

## 3. Technischer Aufbau

### Schritt 1 — Kern (Pflicht)

- Benenne die Testdatei zu **`index.html`** um. Inhalt bleibt eine einzige,
  in sich geschlossene Datei (HTML + CSS + JS zusammen).
- **Sternen-Speicher:** `localStorage`, Schlüssel **`numi-burgen-stars`**.
  Lesen und Schreiben in `try/catch`. Beim Lesen gegen kaputte/fehlende Werte
  absichern (Fallback **0**), damit die App beim ersten Start oder bei
  beschädigtem Wert **nicht abstürzt**.
- Prüfe: Datei lässt sich lokal im Browser öffnen und funktioniert.

### Schritt 2 — Installierbare PWA (empfohlen für Tablets)

Damit die App wie Numi offline läuft und sich auf den Homescreen legen lässt:

- **`manifest.webmanifest`**
  - `name`: „Numi Burgen", `short_name`: „Burgen"
  - `start_url`: `./`, `display`: `standalone`
  - `background_color`: `#EFEAF7`, `theme_color`: `#7C5CDC`
  - `icons`: 192×192 und 512×512
- **Icon** (192 + 512 px): schlichtes Burg-Motiv (🏰 / Türmchen) auf dem
  Lila `#7C5CDC`. Darf generiert werden; bitte als echte PNGs ablegen.
- **`service-worker.js`**
  - Cache-first für die App-Dateien (`index.html`, `manifest.webmanifest`, Icons).
  - **Cache-Versionskonstante am Dateianfang**, z. B. `const CACHE = "numi-burgen-v1";`.
    **Regel: bei JEDER künftigen Änderung diese Zahl hochzählen** — sonst laden
    die Tablets die alte Version aus dem Cache.
  - Alten Cache beim `activate` aufräumen.
- In `index.html` den Service Worker registrieren (`navigator.serviceWorker.register`).
- Falls GitHub Pages Jekyll anwirft: leere **`.nojekyll`** anlegen.

### Schritt 3 — Veröffentlichen (GitHub Pages)

- **Eigenes neues Repository** (echtes Abkoppeln), Vorschlag: `numi-burgen`.
  - Alternative, falls gewünscht: Unterordner `/burgen` im bestehenden Numi-Repo —
    dann aber eigener Service-Worker-Scope und eigener Cache-Name.
- GitHub Pages aus dem `main`-Branch aktivieren, resultierende Pages-URL notieren
  und am Ende nennen.
- Kurz testen: URL auf dem Tablet öffnen, „Zum Homescreen hinzufügen", einmal
  online laden, dann **Flugmodus an** → Burgen müssen weiter funktionieren.

---

## 4. Abnahme-Checkliste (bitte Punkt für Punkt abhaken)

- [ ] Beim Start erscheint eine Burg mit 8–13 Bauteilen.
- [ ] Genau vier Antwortoptionen, genau eine richtig.
- [ ] **Falsche** Antwort zeigt die Chip-Rechnung mit **?** — **nie** das Ergebnis;
      Kind kann weiter probieren, nichts wird „bestraft".
- [ ] „Zeig mir's" zählt die Teile einzeln durch und zeigt danach die Rechnung
      mit **?** (Ergebnis bleibt offen).
- [ ] **Richtige** Antwort: volle Rechnung als Bestätigung **und +1 ⭐**.
- [ ] Sterne bleiben nach **Neuladen** erhalten (localStorage).
- [ ] Sterne werden **nie** kleiner.
- [ ] (PWA) App ist installierbar und funktioniert **offline** nach erstem Laden.
- [ ] Look: warm, rund, Leuchttisch; Baloo 2 / Nunito werden geladen.
- [ ] Keinerlei Verbindung zur Numi-App oder zu deren Speicher.

---

## 5. Was du NICHT tun sollst

- **Nicht** die Zähl- oder Zeichenlogik neu schreiben — die Testdatei ist erprobt.
- **Keine** Zeitbegrenzung, **kein** Lebenssystem, **keine** Punktabzüge,
  **keine** „Game Over"-Sackgasse.
- **Keine** externen Datenflüsse, Tracker, Werbung, Konten oder Analytics.
- **Keine** Marken-/Film-/Spielfiguren in Grafiken oder Icon.
- **Nicht** auf `Numi.jsx` oder den Numi-Speicher (`numi-save-v1`) zugreifen.

---

## 6. So startest du das (für dich, die Lehrkraft)

1. Lege beide Dateien in einen Ordner (bzw. ein neues GitHub-Repo):
   `Numi-Burgen-CLAUDE-CODE-AUFTRAG.md` und `Numi-Burgen-Testversion.html`.
2. Ordner in VS Code öffnen, Claude Code starten.
3. Diesen einen Satz eingeben:

   > *„Lies `Numi-Burgen-CLAUDE-CODE-AUFTRAG.md` und `Numi-Burgen-Testversion.html`
   > und setze den Auftrag um. Arbeite die Abnahme-Checkliste ab und zähl bei jeder
   > Änderung die Cache-Version hoch. Nenn mir am Ende die GitHub-Pages-URL."*

4. Ergebnis gegen die Checkliste in Abschnitt 4 prüfen, dann veröffentlichen.
