import { action, KeyDownEvent, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";

const BASE = "http://127.0.0.1:19470";

type VtState = { enabled: boolean; micMuted: boolean; playing: boolean; musicVol: number; source: string };

async function getState(): Promise<VtState> {
  return (await fetch(`${BASE}/state`)).json() as Promise<VtState>;
}
async function send(cmd: string): Promise<void> {
  const r = await fetch(`${BASE}/cmd/${cmd}`, { method: "POST", headers: { "X-VoiceTune": "1" } });
  if (!r.ok) throw new Error(String(r.status));
}

abstract class VtAction extends SingletonAction {
  protected abstract cmd: string;
  protected stateOf?(s: VtState): boolean; // nur für Tasten mit Anzeige
  private timers = new Map<string, NodeJS.Timeout>();

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    try { await send(this.cmd); } catch { await ev.action.showAlert(); }
  }

  override onWillAppear(ev: WillAppearEvent): void {
    if (!this.stateOf) return;
    const tick = async () => {
      try {
        const s = await getState();
        if (ev.action.isKey()) await ev.action.setState(this.stateOf!(s) ? 1 : 0);
      } catch { /* TS3 läuft nicht */ }
    };
    void tick();
    this.timers.set(ev.action.id, setInterval(tick, 1000));
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    clearInterval(this.timers.get(ev.action.id));
    this.timers.delete(ev.action.id);
  }
}

@action({ UUID: "de.david.voicetune.toggle" })
export class ToggleMusic extends VtAction {
  protected cmd = "toggle";
  protected stateOf(s: VtState) { return s.enabled; }
}
@action({ UUID: "de.david.voicetune.micmute" })
export class MicMute extends VtAction {
  protected cmd = "micmute";
  protected stateOf(s: VtState) { return s.micMuted; }
}
@action({ UUID: "de.david.voicetune.playpause" })
export class PlayPause extends VtAction {
  protected cmd = "playpause";
  protected stateOf(s: VtState) { return s.playing; }
}
@action({ UUID: "de.david.voicetune.next" })
export class Next extends VtAction { protected cmd = "next"; }
@action({ UUID: "de.david.voicetune.prev" })
export class Prev extends VtAction { protected cmd = "prev"; }
@action({ UUID: "de.david.voicetune.volup" })
export class VolUp extends VtAction { protected cmd = "musicvol_up"; }
@action({ UUID: "de.david.voicetune.voldown" })
export class VolDown extends VtAction { protected cmd = "musicvol_down"; }