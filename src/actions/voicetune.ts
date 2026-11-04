import { action } from "@elgato/streamdeck";
import type { VtState } from "../api/client";
import { type KeyView, VtAction, type VtCommand } from "./base";

@action({ UUID: "com.dave-swift.voicetune-streamdeck-api.toggle" })
export class ToggleMusic extends VtAction {
  protected command(): VtCommand { return { name: "toggle" }; }
  protected override view(s: VtState): KeyView { return { state: s.enabled ? 1 : 0 }; }
}
@action({ UUID: "com.dave-swift.voicetune-streamdeck-api.micmute" })
export class MicMute extends VtAction {
  protected command(): VtCommand { return { name: "micmute" }; }
  protected override view(s: VtState): KeyView { return { state: s.micMuted ? 1 : 0 }; }
}
@action({ UUID: "com.dave-swift.voicetune-streamdeck-api.playpause" })
export class PlayPause extends VtAction {
  protected command(): VtCommand { return { name: "playpause" }; }
  protected override view(s: VtState): KeyView { return { state: s.playing ? 1 : 0 }; }
}
@action({ UUID: "com.dave-swift.voicetune-streamdeck-api.next" })
export class Next extends VtAction {
  protected command(): VtCommand { return { name: "next" }; }
}
@action({ UUID: "com.dave-swift.voicetune-streamdeck-api.prev" })
export class Prev extends VtAction {
  protected command(): VtCommand { return { name: "prev" }; }
}
@action({ UUID: "com.dave-swift.voicetune-streamdeck-api.volup" })
export class VolUp extends VtAction {
  protected command(): VtCommand { return { name: "musicvol_up" }; }
}
@action({ UUID: "com.dave-swift.voicetune-streamdeck-api.voldown" })
export class VolDown extends VtAction {
  protected command(): VtCommand { return { name: "musicvol_down" }; }
}
