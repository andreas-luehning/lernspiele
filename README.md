# Lernspiele

Tablet-Lernspiele für Mathematik Klasse 2. Das erste Spiel ist der **Zehnerweg** (Zehnerübergang nach Arbeitsblatt), als Belohnung gibt es die **Schneckenparade**.

## Was in diesem Ordner liegt

| Datei / Ordner | Inhalt |
|---|---|
| `CLAUDE.md` | Projektbeschreibung für Claude Code. Claude Code liest sie automatisch. |
| `ERSTER-AUFTRAG.md` | Text, den du Claude Code als erste Nachricht schickst. |
| `docs/` | Regeln für Zehnerweg und Schneckenparade, Ideen, Fotos der Arbeitsblätter (nur lokal, nicht im Git) |
| `prototypen/` | Die beiden Prototypen. Zum Ausprobieren einfach im Browser öffnen. |
| `werkzeuge/ziffern-modell/` | Die Zahlenerkennung und wie man sie neu trainiert |

## So kommt es zu Claude Code

1. **GitHub-Konto:** Auf github.com registrieren, falls noch nicht vorhanden.
2. **Repository anlegen:** Oben rechts „+“ → „New repository“, Name `lernspiele`. Öffentlich (Public) ist nötig, wenn GitHub Pages kostenlos sein soll. Lies vorher den Hinweis zu den Fotos unten.
3. **Dateien hochladen:** Im neuen Repository „uploading an existing file“ wählen und den **Inhalt** dieses Ordners hineinziehen (nicht den Ordner selbst). Dann „Commit changes“.
4. **Claude Code öffnen:** unter claude.ai/code oder in der Claude-Desktop-App. GitHub verbinden und das Repository `lernspiele` auswählen.
5. **Ersten Auftrag schicken:** den Text aus `ERSTER-AUFTRAG.md` kopieren und als Nachricht senden.
6. **Veröffentlichen:** Im Repository „Settings“ → „Pages“ → bei „Source“ „Deploy from a branch“, Branch `main`, Ordner `/ (root)` → „Save“. Nach ein, zwei Minuten läuft die Seite unter `https://DEIN-NAME.github.io/lernspiele/`.
7. **Auf dem Tablet:** die Adresse öffnen und „Zum Home-Bildschirm“ hinzufügen. Jedes Spiel hat später eine eigene Adresse, z. B. `…/lernspiele/zehnerweg/`.

## Hinweis zu den Fotos

Die Arbeitsblätter in `docs/arbeitsblaetter/` stammen aus dem Unterricht und tragen den Namen der Lehrkraft. Sie werden **nicht ins Git** übernommen (siehe `.gitignore`) und liegen nur lokal. Claude Code kommt auch mit der Beschreibung in `docs/zehnerweg.md` zurecht.

## Datenschutz

Die Spiele speichern alles nur auf dem Tablet. Es gibt keine Konten, kein Tracking und keinen Server.
