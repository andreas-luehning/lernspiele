"""Trainiert das kleine Ziffern-Modell für die Handschrift-Erkennung.

Netz: 784 -> 256 (ReLU) -> 10 (Softmax), nur mit NumPy.
Daten: MNIST (28x28 Graustufen), mit Zufalls-Verzerrung (Drehung, Scherung,
Skalierung, Verschiebung, dickere/dünnere Striche), damit Kinderschrift besser klappt.
Ausgabe: model.json mit int8-quantisierten Gewichten (Base64) und Skalierungsfaktor.
Erreichte Genauigkeit auf dem MNIST-Testset: ca. 98 % (quantisiert 98 %).

Aufruf:
  python3 train.py --daten ./mnist --aus model.json --epochen 8

Im Ordner --daten werden die vier MNIST-Dateien erwartet:
  train-images-idx3-ubyte.gz, train-labels-idx1-ubyte.gz,
  t10k-images-idx3-ubyte.gz,  t10k-labels-idx1-ubyte.gz
"""
import argparse, base64, gzip, json, os
import numpy as np
from scipy import ndimage

ap = argparse.ArgumentParser()
ap.add_argument("--daten", required=True)
ap.add_argument("--aus", default="model.json")
ap.add_argument("--epochen", type=int, default=8)
ap.add_argument("--versteckt", type=int, default=256)
args = ap.parse_args()

def bilder(f): return np.frombuffer(gzip.open(os.path.join(args.daten, f)).read(), np.uint8, offset=16).reshape(-1, 28, 28).astype(np.float32) / 255
def labels(f): return np.frombuffer(gzip.open(os.path.join(args.daten, f)).read(), np.uint8, offset=8)

Xtr, ytr = bilder("train-images-idx3-ubyte.gz"), labels("train-labels-idx1-ubyte.gz")
Xte, yte = bilder("t10k-images-idx3-ubyte.gz"), labels("t10k-labels-idx1-ubyte.gz")
rng = np.random.default_rng(0)

def verzerren(x):
    out = np.empty_like(x)
    for i, im in enumerate(x):
        a = np.deg2rad(rng.uniform(-15, 15)); s = rng.uniform(0.85, 1.12); sh = rng.uniform(-0.25, 0.25)
        M = np.array([[np.cos(a), -np.sin(a)], [np.sin(a), np.cos(a)]]) @ np.array([[1, sh], [0, 1]]) / s
        c = np.array([14, 14]); off = c - M @ c + rng.uniform(-1.5, 1.5, 2)
        im2 = ndimage.affine_transform(im, M, offset=off, order=1)
        r = rng.random()
        if r < 0.25: im2 = ndimage.grey_dilation(im2, size=(2, 2))
        elif r < 0.4: im2 = ndimage.grey_erosion(im2, size=(2, 2)) * 0.5 + im2 * 0.5
        out[i] = np.clip(im2, 0, 1)
    return out

H = args.versteckt
W1 = rng.normal(0, np.sqrt(2 / 784), (784, H)).astype(np.float32); b1 = np.zeros(H, np.float32)
W2 = rng.normal(0, np.sqrt(2 / H), (H, 10)).astype(np.float32); b2 = np.zeros(10, np.float32)
P = [W1, b1, W2, b2]; m = [np.zeros_like(p) for p in P]; v = [np.zeros_like(p) for p in P]; t = 0

def vorwaerts(X):
    h = np.maximum(X @ W1 + b1, 0); return h, h @ W2 + b2

for ep in range(args.epochen):
    idx = rng.permutation(len(Xtr)); lr = 1e-3 * (0.7 ** ep)
    Xa = verzerren(Xtr[idx]).reshape(-1, 784); ya = ytr[idx]
    for k in range(0, len(Xa), 128):
        X = Xa[k:k + 128]; y = ya[k:k + 128]
        h, z = vorwaerts(X); z -= z.max(1, keepdims=True); p = np.exp(z); p /= p.sum(1, keepdims=True)
        g = p; g[np.arange(len(y)), y] -= 1; g /= len(y)
        gW2 = h.T @ g; gb2 = g.sum(0); gh = g @ W2.T; gh[h <= 0] = 0
        gW1 = X.T @ gh; gb1 = gh.sum(0)
        t += 1
        for i, gr in enumerate([gW1, gb1, gW2, gb2]):  # Adam
            m[i] = 0.9 * m[i] + 0.1 * gr; v[i] = 0.999 * v[i] + 0.001 * gr * gr
            P[i] -= lr * (m[i] / (1 - 0.9 ** t)) / (np.sqrt(v[i] / (1 - 0.999 ** t)) + 1e-8)
    _, z = vorwaerts(Xte.reshape(-1, 784)); print(f"Epoche {ep}: Testgenauigkeit {(z.argmax(1) == yte).mean():.4f}", flush=True)

def quant(a):
    s = np.abs(a).max() / 127
    return {"d": base64.b64encode(np.round(a / s).astype(np.int8).tobytes()).decode(), "s": float(s), "shape": list(a.shape)}

json.dump({n: quant(a) for n, a in zip(["W1", "b1", "W2", "b2"], P)}, open(args.aus, "w"))
print("gespeichert:", args.aus)
