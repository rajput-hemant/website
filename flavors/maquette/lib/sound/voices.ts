import type { Voice } from "@/lib/sound";

/**
 * The model shop's six sounds, synthesized by the shared engine (no
 * samples). Card, basswood, foam and one lamp on a quiet bench: short,
 * dry and woody. Gains stay at or under 0.12.
 */
export type VoiceName = "card" | "knife" | "lamp" | "slide" | "dowel" | "pin";

export const voices: Record<VoiceName, Voice> = {
  /* Links: a fingertip on a sheet of mount card, a soft papery tick. */
  card: {
    gain: 0.07,
    layers: [
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "bandpass", freq: [2400, 1700], Q: 1.4 },
        attack: 0.001,
        decay: 0.014,
        gain: 1,
      },
    ],
  },
  /* Buttons: the scalpel scoring card along a steel rule, a short falling rasp. */
  knife: {
    gain: 0.08,
    layers: [
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "highpass", freq: [6200, 3800], Q: 0.9 },
        attack: 0.002,
        decay: 0.035,
        gain: 1,
      },
      {
        kind: "osc",
        type: "triangle",
        freq: [520, 430],
        attack: 0.001,
        decay: 0.02,
        gain: 0.35,
      },
    ],
  },
  /* Switches and the theme: the desk lamp's push switch, a click and its catch. */
  lamp: {
    gain: 0.1,
    layers: [
      {
        kind: "osc",
        type: "square",
        freq: [2600, 2100],
        filter: { type: "lowpass", freq: [3400, 2200] },
        attack: 0.001,
        decay: 0.008,
        gain: 0.6,
      },
      {
        kind: "osc",
        type: "triangle",
        freq: [340, 260],
        attack: 0.001,
        decay: 0.03,
        delay: 0.028,
        gain: 1,
      },
    ],
  },
  /* Disclosures: a foam block slid across the site, a low, soft hush. */
  slide: {
    gain: 0.06,
    layers: [
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "lowpass", freq: [700, 1300], Q: 0.8 },
        attack: 0.03,
        decay: 0.13,
        gain: 1,
      },
    ],
  },
  /* Confirmations (copied): two basswood dowels knocked together, a hollow double tock. */
  dowel: {
    gain: 0.1,
    layers: [
      {
        kind: "osc",
        type: "sine",
        freq: [1150, 980],
        attack: 0.001,
        decay: 0.05,
        gain: 1,
      },
      {
        kind: "osc",
        type: "sine",
        freq: [1320, 1120],
        attack: 0.001,
        decay: 0.045,
        delay: 0.085,
        gain: 0.8,
      },
    ],
  },
  /* Sent: a map pin pushed through a comment card into the foam board, a tick and a soft seat. */
  pin: {
    gain: 0.12,
    layers: [
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "bandpass", freq: [4200, 3000], Q: 5 },
        attack: 0.001,
        decay: 0.012,
        gain: 0.5,
      },
      {
        kind: "osc",
        type: "sine",
        freq: [210, 120],
        attack: 0.004,
        decay: 0.07,
        delay: 0.02,
        gain: 1,
      },
    ],
  },
};

const isVoiceName = (name: string): name is VoiceName =>
  Object.prototype.hasOwnProperty.call(voices, name);

/**
 * Which voice a click plays: an element's own `data-voice`, else a link
 * taps card, a switch or radio clicks the lamp, anything else scores with
 * the knife. Passed to the shared `ClickSound` as `voiceFor`.
 */
export function voiceFor(el: Element): Voice | null {
  const named = el.getAttribute("data-voice");
  if (named) return isVoiceName(named) ? voices[named] : null;
  if (el.closest("a")) return voices.card;
  const role = el.getAttribute("role");
  if (role === "switch" || role === "radio") return voices.lamp;
  return voices.knife;
}

/** A disclosure opening or closing: a foam block slid aside. */
export const onToggle = (): Voice => voices.slide;
