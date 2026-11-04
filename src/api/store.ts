import { getState, type VtState } from "./client";

const POLL_ONLINE_MS = 1000;
const POLL_OFFLINE_MS = 5000;

type Listener = () => void;

/**
 * Hält den VoiceTune-Zustand für alle Tasten. Es gibt genau einen Poller, egal wie viele Tasten
 * sichtbar sind, und er läuft nur, solange mindestens eine Taste angemeldet ist.
 */
class StateStore {
  /** Aktueller Zustand; `null`, solange VoiceTune nicht erreichbar ist. */
  state: VtState | null = null;

  private listeners = new Set<Listener>();
  private timer: NodeJS.Timeout | undefined;
  private inFlight: Promise<void> | undefined;
  private version = 0; // verhindert, dass eine ältere Poll-Antwort einen neueren Zustand überschreibt

  /** Meldet einen Empfänger an und liefert die Funktion zum Abmelden. */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    if (this.listeners.size === 1) void this.poll();
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) clearTimeout(this.timer);
    };
  }

  /** Übernimmt einen Zustand, den die API direkt geliefert hat (Antwort auf einen Befehl). */
  publish(state: VtState): void {
    this.version++;
    this.update(state);
  }

  /** Fragt sofort ab, z.B. nachdem ein Befehl fehlgeschlagen ist. */
  refresh(): Promise<void> {
    return this.poll();
  }

  private poll(): Promise<void> {
    this.inFlight ??= this.fetchState().finally(() => {
      this.inFlight = undefined;
      this.schedule();
    });
    return this.inFlight;
  }

  private async fetchState(): Promise<void> {
    const startedAt = this.version;
    let next: VtState | null = null;
    try {
      next = await getState();
    } catch {
      // TeamSpeak läuft nicht oder antwortet nicht: wird als offline angezeigt
    }
    if (startedAt === this.version) this.update(next);
  }

  private schedule(): void {
    clearTimeout(this.timer);
    if (this.listeners.size === 0) return;
    this.timer = setTimeout(() => void this.poll(), this.state ? POLL_ONLINE_MS : POLL_OFFLINE_MS);
  }

  private update(state: VtState | null): void {
    this.state = state;
    for (const listener of this.listeners) listener();
  }
}

export const store = new StateStore();
