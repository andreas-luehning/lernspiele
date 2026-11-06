# Zehnerweg

Übung zum Zehnerübergang, Plus und Minus bis 20. Vorlage sind zwei Arbeitsblätter („Mathematik Klasse 2 · Rechnen bis 20“), Fotos in `arbeitsblaetter/` (nur lokal, nicht im Git).

## Das Blatt

Eine Straße verbindet zwei Kästchen: Start und Ergebnis. Auf der Straße liegt ein großer Kreis (die zweite Zahl). Von ihm gehen zwei Linien zu zwei kleinen Kreisen (die Zerlegung). Ein Bogen mit Pfeilen führt vom Start über den ersten kleinen Kreis zum mittleren Kästchen (die 10) und über den zweiten kleinen Kreis zum Ergebnis.

| Feld | Plus, z. B. 8 + 5 | Minus, z. B. 13 − 5 | Wer füllt es |
|---|---|---|---|
| Start | 8 | 13 | vorgegeben |
| Großer Kreis | 5 | 5 | vorgegeben |
| Erster kleiner Kreis | 2 (bis zur 10) | 3 (runter zur 10) | Kind |
| Mittleres Kästchen | 10 | 10 | Kind |
| Zweiter kleiner Kreis | 3 (Rest) | 2 (Rest) | Kind |
| Ergebnis | 13 | 8 | Kind |

### Symbole wie auf den Blättern

- **Plus-Blatt:** Herz beim ersten kleinen Kreis. Startzahl und dieser Kreis sind „verliebte Zahlen“ (zusammen 10). Rechenzeichen „+“ in allen Kreisen. Keine Hand.
- **Minus-Blatt:** Hand beim Start (wegnehmen bis zur 10). Herz beim zweiten kleinen Kreis (zweiter Kreis und Ergebnis ergeben zusammen 10). Rechenzeichen „−“ in den Kreisen.
- Pfeilspitzen: am Pfeil zum ersten Kreis und am Pfeil zum zweiten Kreis.

## Aufgaben erzeugen

- **Plus:** a von 3 bis 9, b von 2 bis 9, a + b größer als 10.
- **Minus:** a von 11 bis 18, b von 2 bis 9, Ergebnis unter 10, und a − 10 kleiner als b (es muss wirklich über die 10 gehen).
- Nicht zweimal hintereinander dieselbe Aufgabe.
- Umschalter: Plus, Minus, Gemischt.

## Prüfen und Tipps

- Unter jedem Feld steht klein, was erkannt wurde („erkannt: 7“, bei Unsicherheit „7 ?“), daneben × zum Löschen.
- Sobald alle vier Felder erkannt sind, prüft die App automatisch. Richtig: Feld grün. Falsch: Feld rot mit kurzem Wackeln.
- Der Tipp gilt immer dem ersten falschen Feld:
  - Erster Kreis, Plus: „Welche Zahl ist in die 8 verliebt? Zusammen ergeben sie 10.“
  - Erster Kreis, Minus: „Wie viel musst du von 13 wegnehmen, um bei 10 zu landen?“
  - Mittleres Kästchen: „8 + 2 = ? Dort kommst du nach dem ersten Schritt an.“
  - Zweiter Kreis: „Zerlege die 5: 2 und wie viel noch?“
  - Ergebnis, Plus: „Rechne jetzt 10 + 3.“ Minus: „10 − 2: Welche Zahl ist in die 2 verliebt?“
- War die Erkennung unsicher, steht davor: „Ich habe 7 gelesen. Schreib es deutlicher, falls du etwas anderes meinst.“
- Fehlen noch Felder, aber alles bisher stimmt: „Bis hier stimmt alles!“ und der Tipp für das nächste leere Feld.
- Alles richtig: Ein grüner Weg zeichnet sich über die Pfeile, die Pfeilspitzen werden grün, die Lösung steht oben in der Aufgabe. Wenn das Herz-Feld richtig ist, schlagen die Herzen kurz.
- Belohnung: Bisher ein Stern pro gelöster Aufgabe. Wird ersetzt durch die Schneckenparade (`schneckenparade.md`).

## Bildschirm

- **Hochformat:** Straße senkrecht wie auf dem Blatt, Start unten, Ergebnis oben.
- **Querformat:** Straße waagerecht. Auf breiten Bildschirmen stehen Aufgabe, Rechenart, Uhr, Tipp und Knöpfe in einer Seitenleiste links, damit der Weg die volle Höhe hat. Die App wählt das Layout, das die größeren Felder ergibt.
- **Spiegeln:** Ein Knopf klappt Kreise und Zehner-Kästchen auf die andere Seite der Straße.
- **Tag/Nacht:** Hell ist Standard, Wahl wird gemerkt.
- Für Erwachsene: Knopf „?“ mit kurzer Erklärung.

## Zahlenerkennung

Siehe `../werkzeuge/ziffern-modell/README.md`. Kurz: Striche werden pro Feld gesammelt, 650 ms nach dem letzten Strich wird erkannt, zweistellige Zahlen über zwei Zifferngruppen nebeneinander.

## Offene Punkte

- Auf echten Tablets mit echter Kinderschrift testen (iPad mit und ohne Stift, Android).
- Korrektur per Antippen: Tippt das Kind auf „erkannt: 7“, erscheint eine Zahlenreihe 0–20 zur Auswahl.
- Aufgabe und Tipps vorlesen lassen (Web Speech API, deutsche Stimme).
- Schwierigkeitsstufen: erst mit vorgegebener Zerlegung, dann nur mit Tipp, dann allein.
