# Ziffern-Modell

Kleines neuronales Netz, das eine einzelne handgeschriebene Ziffer (0–9) erkennt. Es läuft komplett im Browser, ohne Bibliothek und ohne Internet.

- **Netz:** 784 Eingänge (28×28 Pixel) → 256 versteckte Neuronen (ReLU) → 10 Ausgänge (Softmax)
- **Training:** MNIST mit zufälliger Verzerrung, damit Kinderschrift besser klappt (`train.py`)
- **Genauigkeit:** ca. 98 % auf dem MNIST-Testset. Bei echter Kinderschrift ist sie niedriger; das muss auf dem Tablet ausprobiert werden.
- **Datei:** `model.json`, etwa 270 KB. Gewichte als int8 in Base64, je Matrix ein Skalierungsfaktor `s`. Wert = int8 × s.

## So liest man es in JavaScript

```js
function dq(o){ const bin = atob(o.d); const a = new Float32Array(bin.length);
  for (let i = 0; i < bin.length; i++){ let v = bin.charCodeAt(i); if (v > 127) v -= 256; a[i] = v * o.s; } return a; }
// W1: 784×256 zeilenweise, b1: 256, W2: 256×10 zeilenweise, b2: 10
```

## Vorverarbeitung (wichtig, sonst stimmt die Erkennung nicht)

Die Erkennung im Prototyp `prototypen/zehnerweg.quelle.html` (Funktionen `rasterize`, `groupStrokes`, `readNumber`) macht:

1. Striche nach waagerechter Überlappung zu Ziffern gruppieren (zweistellige Zahlen = zwei Gruppen nebeneinander). Winzige Tupfer werden verworfen.
2. Jede Ziffer so skalieren, dass die längere Seite 20 von 28 Pixeln füllt (wie bei MNIST), mit dicker runder Linie zeichnen.
3. In zwei Schritten auf 28×28 verkleinern (112 → 56 → 28), dann nach Schwerpunkt zentrieren.
4. Bei zwei Ziffern ist die erste nur 1 oder 2 (auf dem Blatt gibt es nur Zahlen bis 20), und bei 2 ist die zweite nur 0.
5. Liegt die Sicherheit unter 0,4, zeigt die App die Zahl mit Fragezeichen an.
6. **Formprüfung 1/7** (`istDeutscheEins`, `istSieben` in `gemeinsam/ziffern.js`): MNIST kennt nur die amerikanische 1 (ein senkrechter Strich). Die deutsche 1 mit langem Anstrich hält das Modell oft für eine 7. Darum wird nach dem Modell die Form geprüft: schmaler Stamm unten, Spitze darüber, Anstrich fällt nach links ab, keine Schlaufe → 1. Querstrich in der Mitte oder flacher Balken oben → 7. **Regel „7 nur mit Querstrich“** (Standard, abschaltbar auf der Startseite unter „Für Erwachsene“, gespeichert in `lernspiele:spiel`): Sagt das Modell 7, aber es gibt keinen Querstrich, wird 1 gelesen; sagt es 1 und es gibt einen Querstrich, wird 7 gelesen. Das ist robuster als die reine Formprüfung, weil echte Kinder-Einsen oft krumm sind. Test: `tests/ziffern-browser.js` (321 Formen, beide Einstellungen).

Besser wäre auf Dauer ein Nachtraining mit deutschen Einsen. Dafür reichen künstlich erzeugte Einsen mit Anstrich; echte Kinderschrift nur mit Einverständnis und nur lokal (siehe `docs/datenschutz-und-sicherheit.md`).

## Neu trainieren

MNIST-Dateien (die vier `.gz`-Dateien) in einen Ordner legen, dann:

```
pip install numpy scipy
python3 train.py --daten ./mnist --aus model.json --epochen 8
```

Dauert auf einem normalen Rechner ein paar Minuten. Später kann man echte Kinderschrift-Beispiele sammeln (nur mit Einverständnis der Eltern und nur lokal) und damit nachtrainieren.
