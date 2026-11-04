import type { JsonObject } from "@elgato/utils";
import {
  type DidReceiveSettingsEvent,
  type KeyAction,
  type KeyDownEvent,
  SingletonAction,
  type WillAppearEvent,
  type WillDisappearEvent,
} from "@elgato/streamdeck";
import { runCommand, type VtState } from "../api/client";
import { store } from "../api/store";

/** Was eine Taste anzeigen soll. Ohne `title` gilt der Titel aus dem Manifest. */
export type KeyView = { state?: 0 | 1; title?: string };

/** Ein Befehl an VoiceTune; `null`, wenn die Taste noch nicht eingerichtet ist. */
export type VtCommand = { name: string; arg?: string | number } | null;

type VisibleKey<T extends JsonObject> = {
  action: KeyAction<T>;
  settings: T;
  rendered?: string;
  unsubscribe: () => void;
};

const OFFLINE_VIEW: KeyView = { state: 0, title: "Offline" };

/** Basis aller Tasten: führt den Befehl aus und hält die Anzeige aktuell. */
export abstract class VtAction<T extends JsonObject = JsonObject> extends SingletonAction<T> {
  protected keys = new Map<string, VisibleKey<T>>();

  protected abstract command(settings: T): VtCommand;

  protected view(_state: VtState, _settings: T): KeyView {
    return {};
  }

  override async onKeyDown(ev: KeyDownEvent<T>): Promise<void> {
    const command = this.command(ev.payload.settings);
    if (!command) {
      await ev.action.showAlert();
      return;
    }
    try {
      store.publish(await runCommand(command.name, command.arg));
    } catch {
      await ev.action.showAlert();
      await store.refresh();
    }
  }

  override onWillAppear(ev: WillAppearEvent<T>): void {
    if (!ev.action.isKey()) return;
    const id = ev.action.id;
    const unsubscribe = store.subscribe(() => this.render(id));
    this.keys.set(id, { action: ev.action, settings: ev.payload.settings, unsubscribe });
    this.render(id);
  }

  override onWillDisappear(ev: WillDisappearEvent<T>): void {
    this.keys.get(ev.action.id)?.unsubscribe();
    this.keys.delete(ev.action.id);
  }

  override onDidReceiveSettings(ev: DidReceiveSettingsEvent<T>): void {
    const key = this.keys.get(ev.action.id);
    if (!key) return;
    key.settings = ev.payload.settings;
    this.render(ev.action.id);
  }

  protected renderAll(): void {
    for (const id of this.keys.keys()) this.render(id);
  }

  private render(id: string): void {
    const key = this.keys.get(id);
    if (!key) return;
    const view = store.state ? this.view(store.state, key.settings) : OFFLINE_VIEW;

    // Der Zustand kommt jede Sekunde: nur Änderungen an das Stream Deck schicken
    const rendered = JSON.stringify(view);
    if (rendered === key.rendered) return;
    key.rendered = rendered;

    if (view.state !== undefined) void key.action.setState(view.state);
    void key.action.setTitle(view.title);
  }
}
