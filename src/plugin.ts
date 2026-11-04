import streamDeck from "@elgato/streamdeck";
import { PlaySound } from "./actions/sound";
import { ToggleMusic, MicMute, PlayPause, Next, Prev, VolUp, VolDown } from "./actions/voicetune";

streamDeck.actions.registerAction(new ToggleMusic());
streamDeck.actions.registerAction(new MicMute());
streamDeck.actions.registerAction(new PlayPause());
streamDeck.actions.registerAction(new Next());
streamDeck.actions.registerAction(new Prev());
streamDeck.actions.registerAction(new VolUp());
streamDeck.actions.registerAction(new VolDown());
streamDeck.actions.registerAction(new PlaySound());

streamDeck.connect();
