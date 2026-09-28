import type { Voice } from "@/lib/sound";

/**
 * The calibre's six sounds, synthesized by the shared engine (no samples).
 * A watchmaker's bench: steel on steel, tiny and bright, with one gong. Gains
 * stay at or under 0.12.
 */
export type VoiceName =
  "tick" | "crown" | "detent" | "ratchet" | "repeater" | "caseback";

export const voices: Record<VoiceName, Voice> = {
  /* Links: one beat of the escapement, a pallet dropping onto a tooth. */
  tick: {
    gain: 0.06,
    layers: [
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "bandpass", freq: [6200, 5400], Q: 6 },
        attack: 0.0005,
        decay: 0.008,
        gain: 1,
      },
      {
        kind: "osc",
        type: "sine",
        freq: [5200, 5000],
        attack: 0.0005,
        decay: 0.012,
        gain: 0.3,
      },
    ],
  },
  /* Buttons: the crown pressed home, a small ringing click. */
  crown: {
    gain: 0.09,
    layers: [
      {
        kind: "osc",
        type: "triangle",
        freq: [2400, 2100],
        attack: 0.001,
        decay: 0.03,
        gain: 1,
      },
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "highpass", freq: [3000, 3000], Q: 0.8 },
        attack: 0.001,
        decay: 0.01,
        gain: 0.5,
      },
    ],
  },
  /* Switches and the theme: the setting lever snapping into its detent, two steps. */
  detent: {
    gain: 0.1,
    layers: [
      {
        kind: "osc",
        type: "square",
        freq: [1300, 900],
        filter: { type: "lowpass", freq: [3200, 1800] },
        attack: 0.001,
        decay: 0.014,
        gain: 1,
      },
      {
        kind: "osc",
        type: "square",
        freq: [1700, 1200],
        filter: { type: "lowpass", freq: [3600, 2000] },
        attack: 0.001,
        decay: 0.012,
        delay: 0.03,
        gain: 0.7,
      },
    ],
  },
  /* Disclosures: a turn of the crown, the winding ratchet's quick run of clicks. */
  ratchet: {
    gain: 0.06,
    layers: [
      {
        kind: "osc",
        type: "square",
        freq: [60, 60],
        filter: { type: "bandpass", freq: [4200, 3600], Q: 5 },
        attack: 0.002,
        decay: 0.09,
        gain: 1,
      },
    ],
  },
  /* Confirmations (copied): a minute repeater, a high gong then a low one. */
  repeater: {
    gain: 0.08,
    layers: [
      {
        kind: "osc",
        type: "sine",
        freq: [1568, 1568],
        attack: 0.002,
        decay: 0.22,
        gain: 1,
      },
      {
        kind: "osc",
        type: "sine",
        freq: [1175, 1175],
        attack: 0.002,
        decay: 0.26,
        delay: 0.16,
        gain: 0.9,
      },
    ],
  },
  /* Sent: the caseback screwed shut, a low seat and a bright last click. */
  caseback: {
    gain: 0.12,
    layers: [
      {
        kind: "osc",
        type: "sine",
        freq: [320, 180],
        attack: 0.003,
        decay: 0.07,
        gain: 1,
      },
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "bandpass", freq: [5600, 4800], Q: 6 },
        attack: 0.001,
        decay: 0.012,
        delay: 0.06,
        gain: 0.6,
      },
    ],
  },
};

const isVoiceName = (name: string): name is VoiceName =>
  Object.prototype.hasOwnProperty.call(voices, name);

/**
 * Which voice a click plays: an element's own `data-voice`, else a link
 * ticks, a switch or radio snaps its detent, anything else is the crown.
 * Passed to the shared `ClickSound` as `voiceFor`.
 */
export function voiceFor(el: Element): Voice | null {
  const named = el.getAttribute("data-voice");
  if (named) return isVoiceName(named) ? voices[named] : null;
  if (el.closest("a")) return voices.tick;
  const role = el.getAttribute("role");
  if (role === "switch" || role === "radio") return voices.detent;
  return voices.crown;
}

/** A disclosure opening or closing: a turn of the crown. */
export const onToggle = (): Voice => voices.ratchet;
