const BASE = "http://127.0.0.1:19470";
const TIMEOUT_MS = 1500;

/** Antwort von GET /state. Optionale Felder fehlen bei älteren VoiceTune-Versionen. */
export type VtState = {
  enabled: boolean;
  micMuted: boolean;
  musicVol: number;
  micVol: number;
  playing: boolean;
  monitor: boolean;
  soundMonitor?: boolean;
  fileMonitor?: boolean;
  playlist?: string;
  profile?: string;
  preset?: string;
  source: string;
  soundPlaying?: boolean;
  soundsActive?: number[];
  soundsActiveIds?: string[];
  soundsRev?: number;
  profileIndex?: number;
  profileCount?: number;
  file?: { title: string; position: number; duration: number };
  ducking?: boolean;
  update?: boolean;
};

/** Eintrag von GET /sounds. `id` und `used` fehlen bei VoiceTune-Versionen ohne feste Knopf-IDs. */
export type VtSound = { slot: number; id?: string; used?: boolean; name: string; color?: string; ready: boolean };

export function isUsed(sound: VtSound): boolean {
  return sound.used ?? sound.name.trim() !== "";
}

export async function getState(): Promise<VtState> {
  const r = await fetch(`${BASE}/state`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!r.ok) throw new Error(`GET /state: ${r.status}`);
  return (await r.json()) as VtState;
}

/** Führt einen Befehl aus und liefert den neuen Zustand zurück. */
export async function runCommand(name: string, arg?: string | number): Promise<VtState> {
  const path = arg === undefined ? name : `${name}/${encodeURIComponent(arg)}`;
  const r = await fetch(`${BASE}/cmd/${path}`, {
    method: "POST",
    headers: { "X-VoiceTune": "1" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!r.ok) throw new Error(`POST /cmd/${path}: ${r.status}`);
  return (await r.json()) as VtState;
}

/** Alle Einträge von /sounds, auch leere: nur so lässt sich „gerade leer“ von „gelöscht“ unterscheiden. */
export async function getSounds(): Promise<VtSound[]> {
  const r = await fetch(`${BASE}/sounds`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!r.ok) throw new Error(`GET /sounds: ${r.status}`);
  const body = (await r.json()) as { sounds: VtSound[] };
  return body.sounds;
}
