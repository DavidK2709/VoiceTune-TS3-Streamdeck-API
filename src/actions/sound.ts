import type { JsonValue } from "@elgato/utils";
import streamDeck, {
  action,
  type PropertyInspectorDidAppearEvent,
  type SendToPluginEvent,
  type WillAppearEvent,
  type WillDisappearEvent,
} from "@elgato/streamdeck";
import { getSounds, isUsed, type VtSound, type VtState } from "../api/client";
import { store } from "../api/store";
import { wrapTitle } from "../title";
import { type KeyView, VtAction, type VtCommand } from "./base";

/** `soundId` ist die feste Knopf-ID. `slot` wird nur ohne ID verwendet (ältere VoiceTune-Versionen). */
type SoundSettings = { soundId?: string; slot?: number };

const LEGACY_REFRESH_MS = 15000; // nur für Versionen ohne soundsRev

/** Spielt einen Soundboard-Knopf ab. Der Knopf wird im Einstellungsfenster gewählt (ui/sound.html). */
@action({ UUID: "com.dave-swift.voicetune-streamdeck-api.sound" })
export class PlaySound extends VtAction<SoundSettings> {
  private sounds: VtSound[] | null = null;
  private soundsVersion: number | undefined;
  private unsubscribe: (() => void) | undefined;

  protected command(settings: SoundSettings): VtCommand {
    if (this.isUnavailable(settings)) return null;
    if (settings.soundId) return { name: "soundid", arg: settings.soundId };
    return settings.slot ? { name: "sound", arg: settings.slot } : null;
  }

  protected override view(s: VtState, settings: SoundSettings): KeyView {
    if (!settings.soundId && !settings.slot) return { state: 0, title: "Sound\nwählen" };
    const active = settings.soundId
      ? s.soundsActiveIds?.includes(settings.soundId)
      : s.soundsActive?.includes(settings.slot!);
    return { state: active ? 1 : 0, title: this.titleOf(settings) };
  }

  override onWillAppear(ev: WillAppearEvent<SoundSettings>): void {
    super.onWillAppear(ev);
    if (this.unsubscribe) return;
    this.unsubscribe = store.subscribe(() => this.reloadIfChanged());
    this.reloadIfChanged();
  }

  override onWillDisappear(ev: WillDisappearEvent<SoundSettings>): void {
    super.onWillDisappear(ev);
    if (this.keys.size > 0) return;
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.soundsVersion = undefined;
  }

  override onPropertyInspectorDidAppear(_ev: PropertyInspectorDidAppearEvent<SoundSettings>): Promise<void> {
    return this.sendSoundList();
  }

  override onSendToPlugin(ev: SendToPluginEvent<JsonValue, SoundSettings>): Promise<void> | void {
    const payload = ev.payload as { type?: string } | null;
    if (payload?.type === "getSounds") return this.sendSoundList();
  }

  private find(settings: SoundSettings): VtSound | undefined {
    return this.sounds?.find((s) => (settings.soundId ? s.id === settings.soundId : s.slot === settings.slot));
  }

  /** Nur wenn die Liste bekannt ist: Der Knopf ist gelöscht oder gerade leer. */
  private isUnavailable(settings: SoundSettings): boolean {
    if (!this.sounds || (!settings.soundId && !settings.slot)) return false;
    const sound = this.find(settings);
    return !sound || !isUsed(sound);
  }

  private titleOf(settings: SoundSettings): string {
    if (!this.sounds) return "…";
    const sound = this.find(settings);
    if (sound && isUsed(sound)) return wrapTitle(sound.name);
    if (sound) return "Leer";
    return settings.soundId ? "Neu\nzuweisen" : "Leer";
  }

  /** Lädt /sounds nur, wenn sich laut soundsRev etwas geändert hat. */
  private reloadIfChanged(): void {
    const state = store.state;
    if (!state) {
      this.soundsVersion = undefined;
      return;
    }
    const version = state.soundsRev ?? Math.floor(Date.now() / LEGACY_REFRESH_MS);
    if (version === this.soundsVersion) return;
    this.soundsVersion = version;
    void this.loadSounds();
  }

  private async loadSounds(): Promise<boolean> {
    try {
      this.sounds = await getSounds();
      this.renderAll();
      return true;
    } catch {
      this.soundsVersion = undefined; // beim nächsten Zustand erneut versuchen
      return false;
    }
  }

  private async sendSoundList(): Promise<void> {
    const online = await this.loadSounds();
    const sounds = online
      ? this.sounds!.filter(isUsed).map((s) => ({ slot: s.slot, id: s.id ?? "", name: s.name, ready: s.ready }))
      : [];
    await streamDeck.ui.sendToPropertyInspector({ type: "sounds", online, sounds });
  }
}
