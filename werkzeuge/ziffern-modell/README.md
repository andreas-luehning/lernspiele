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

## Neu trainieren

MNIST-Dateien (die vier `.gz`-Dateien) in einen Ordner legen, dann:

```
pip install numpy scipy
python3 train.py --daten ./mnist --aus model.json --epochen 8
```

Dauert auf einem normalen Rechner ein paar Minuten. Später kann man echte Kinderschrift-Beispiele sammeln (nur mit Einverständnis der Eltern und nur lokal) und damit nachtrainieren.
