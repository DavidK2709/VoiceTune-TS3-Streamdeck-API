# VoiceTune für Stream Deck

Steuere [VoiceTune für TeamSpeak 3](https://github.com/DavidK2709/VoiceTune-TS3) direkt vom Stream Deck: Musik und Mikrofon schalten, Titel wechseln, Lautstärke regeln und Soundboard-Sounds abspielen. Die Tasten zeigen den aktuellen Zustand live an.

## Voraussetzungen

- Windows 10 oder 11
- Stream-Deck-Software 7.1 oder neuer
- TeamSpeak 3 (64-bit) mit VoiceTune

TeamSpeak muss laufen, damit die Tasten reagieren. Das Plugin spricht nur mit VoiceTune auf dem eigenen PC, eine Einrichtung ist nicht nötig.

## Installation

1. Lade die Datei `*.streamDeckPlugin` aus den [Releases](../../releases) herunter.
2. Öffne sie per Doppelklick und bestätige die Rückfrage der Stream-Deck-App.
3. Öffne in der App die Kategorie **VoiceTune StreamDeck Hotkeys** und zieh die gewünschten Tasten aufs Deck.

## Tasten

| Taste | Funktion | Anzeige auf der Taste |
|---|---|---|
| Musik Ein/Aus | „Musik einspielen“ umschalten | an/aus |
| Mikro stumm | Mikrofon stumm/an, die Musik läuft weiter | an/stumm |
| Play/Pause | Datei-Player abspielen oder pausieren | Play/Pause |
| Weiter | Nächster Titel | – |
| Zurück | Vorheriger Titel | – |
| Lauter | Musik-Lautstärke +10 % | – |
| Leiser | Musik-Lautstärke −10 % | – |
| Sound abspielen | Gewählten Soundboard-Knopf abspielen | Name, leuchtet beim Abspielen |

### Sound-Taste einrichten

Zieh **Sound abspielen** aufs Deck und wähle in den Tasten-Einstellungen den Sound aus. Die Liste zeigt alle belegten Knöpfe aus deinem Soundboard, mit ↻ lädst du sie neu.

Die Taste merkt sich den Knopf selbst, nicht seinen Platz. Du kannst ihn also im Soundboard verschieben oder umbenennen, ohne die Taste neu einzurichten.

## Was die Tasten anzeigen

| Anzeige | Bedeutung | Was du tun kannst |
|---|---|---|
| **Offline** | VoiceTune ist nicht erreichbar | TeamSpeak starten. Sobald es läuft, verschwindet die Anzeige nach wenigen Sekunden von selbst |
| **Sound wählen** | Der Taste ist noch kein Sound zugewiesen | Sound in den Tasten-Einstellungen wählen |
| **Leer** | Der Soundboard-Knopf ist gerade leer | Knopf neu belegen, die Taste funktioniert dann wieder |
| **Neu zuweisen** | Den Soundboard-Knopf gibt es nicht mehr, z. B. nach dem Import eines fremden Boards | Sound in den Tasten-Einstellungen neu wählen |
| Warndreieck | Der Befehl konnte nicht ausgeführt werden | Prüfen, ob TeamSpeak läuft und die Taste eingerichtet ist |

## Häufige Probleme

**Die Tasten bleiben auf „Offline“, obwohl TeamSpeak läuft.**
Öffne `http://127.0.0.1:19470/state` im Browser. Kommt keine Antwort, läuft die Schnittstelle von VoiceTune nicht. Das passiert zum Beispiel, wenn ein zweites TeamSpeak den Port schon belegt. VoiceTune meldet das dann auch im TeamSpeak-Chat.

**Die Sound-Taste verrutscht beim Verschieben im Soundboard.**
Deine VoiceTune-Version kennt noch keine festen Knopf-IDs, die Taste arbeitet dann mit der Platznummer. Aktualisiere VoiceTune und wähle den Sound einmal neu aus.

## Entwicklung

Voraussetzung ist Node.js. Die Elgato-CLI wird mit den Abhängigkeiten installiert.

```powershell
npm install
npm run build
npx streamdeck link com.dave-swift.voicetune-streamdeck-api.sdPlugin
```

`npm run watch` baut das Plugin bei jeder Änderung neu und startet es automatisch neu.

Wird der Projektordner verschoben, zeigt der Link ins Leere, und auch eine Installation per Doppelklick schlägt dann fehl. Lösche in dem Fall den alten Link unter `%APPDATA%\Elgato\StreamDeck\Plugins` und führe `streamdeck link` erneut aus.

So entsteht die installierbare Datei:

```powershell
npx streamdeck validate com.dave-swift.voicetune-streamdeck-api.sdPlugin
npx streamdeck pack com.dave-swift.voicetune-streamdeck-api.sdPlugin
```

### Aufbau

| Pfad | Inhalt |
|---|---|
| `src/api/client.ts` | HTTP-Anfragen an VoiceTune |
| `src/api/store.ts` | Gemeinsame Zustandsabfrage für alle Tasten |
| `src/actions/base.ts` | Basisklasse aller Tasten |
| `src/actions/voicetune.ts` | Die einfachen Tasten |
| `src/actions/sound.ts` | Die Sound-Taste |
| `*.sdPlugin/manifest.json` | Aktionen, Icons und Zustände |
| `*.sdPlugin/ui/` | Tasten-Einstellungen |

### Schnittstelle

VoiceTune öffnet einen HTTP-Server, der nur auf `127.0.0.1:19470` lauscht. Das Plugin fragt damit jede Sekunde den Zustand ab und schickt Befehle per `POST /cmd/<befehl>` mit dem Header `X-VoiceTune: 1`. Alle Endpunkte stehen in der [API-Dokumentation](https://github.com/DavidK2709/VoiceTune-TS3/blob/main/STREAMDECK-API.md).

Zum Testen ohne Stream Deck (PowerShell):

```powershell
Invoke-RestMethod http://127.0.0.1:19470/state
Invoke-RestMethod -Method Post -Headers @{ 'X-VoiceTune' = '1' } http://127.0.0.1:19470/cmd/toggle
```

## Autor

David K X Tony S.
