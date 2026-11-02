# VoiceTune für Stream Deck

Stream-Deck-Plugin zur Steuerung von [VoiceTune für TeamSpeak 3](https://github.com/DavidK2709/VoiceTune-TS3).
Musik ein-/ausschalten, Mikrofon stumm schalten, Titel wechseln und Lautstärke regeln, direkt per Tastendruck. Die Tasten zeigen den aktuellen Zustand live an.

## Voraussetzungen
- Windows 10/11
- Elgato Stream Deck mit Stream-Deck-Software 7.1 oder neuer
- TeamSpeak 3 (64-bit) mit **VoiceTune in der Version mit lokaler Schnittstelle** (lauscht auf `127.0.0.1:19470`)
- TeamSpeak muss laufen, sonst reagieren die Tasten nicht

## Tasten

| Taste | Funktion | Statusanzeige |
|---|---|---|
| Musik Ein/Aus | „Musik einspielen“ umschalten | ja |
| Mikro stumm | Mikrofon stumm/an (Musik läuft weiter) | ja |
| Play/Pause | Datei-Player abspielen/pausieren | ja |
| Weiter | nächster Titel | nein |
| Zurück | vorheriger Titel | nein |
| Lauter | Musik-Lautstärke +10 % | nein |
| Leiser | Musik-Lautstärke −10 % | nein |

## Installation
1. Die Datei `*.streamDeckPlugin` aus den [Releases](../../releases) herunterladen.
2. Doppelklicken und die Rückfrage des Stream Decks bestätigen.
3. In der Stream-Deck-App die Kategorie **VoiceTune StreamDeck API** öffnen und die Tasten auf das Deck ziehen.

## Selbst bauen
Voraussetzungen: Node.js und die Elgato-CLI (`npm i -g @elgato/cli`).

```
npm install
npm run build
streamdeck link com.dave-swift.voicetune-streamdeck-api.sdPlugin
```

Während der Entwicklung lädt `npm run watch` das Plugin bei Änderungen automatisch neu.
Als installierbare Datei packen:

```
streamdeck validate com.dave-swift.voicetune-streamdeck-api.sdPlugin
streamdeck pack com.dave-swift.voicetune-streamdeck-api.sdPlugin
```

## So funktioniert es
Das VoiceTune-Plugin öffnet einen kleinen HTTP-Server, der **nur auf localhost** (`127.0.0.1:19470`) lauscht. Dieses Plugin spricht damit:

- `GET /state` liefert den Zustand als JSON (`enabled`, `micMuted`, `musicVol`, `micVol`, `playing`, `source`).
- `POST /cmd/<name>` führt einen Befehl aus. Jede Anfrage braucht den Header `X-VoiceTune: 1` (Schutz gegen fremde Webseiten im Browser).

Verfügbare Befehle: `toggle`, `on`, `off`, `micmute`, `musicvol_up`, `musicvol_down`, `playpause`, `next`, `prev`, `stop`.

Zum Testen ohne Stream Deck (PowerShell):

```
curl http://127.0.0.1:19470/state
Invoke-WebRequest -Method POST -Headers @{"X-VoiceTune"="1"} http://127.0.0.1:19470/cmd/toggle
```

## Autor
David Koch
