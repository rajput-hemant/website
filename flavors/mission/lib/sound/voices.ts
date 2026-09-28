import type { Voice } from "@/lib/sound";

/**
 * The flight director's console (docs/mission.md, Sound): keys, guarded
 * toggles and the capcom loop. Every voice is synthesized by the shared
 * engine and quiet enough to sit under speech; none plays on hover, none on
 * keyboard link activation, and UI clicks stay silent on touch.
 */
export const voices = {
  /** Links: a console key, a short hollow click with a plastic top. */
  key: {
    gain: 0.07,
    layers: [
      {
        kind: "osc",
        type: "square",
        freq: [1900, 1400],
        filter: { type: "lowpass", freq: [3200, 1800] },
        attack: 0.001,
        decay: 0.014,
        gain: 0.5,
      },
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "bandpass", freq: [4200, 3000], Q: 2 },
        attack: 0.001,
        decay: 0.01,
        gain: 0.6,
      },
    ],
  },
  /** Buttons: a push-button latching, a dull knock and its release. */
  latch: {
    gain: 0.08,
    layers: [
      {
        kind: "osc",
        type: "triangle",
        freq: [300, 210],
        attack: 0.002,
        decay: 0.03,
        gain: 1,
      },
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "highpass", freq: [3000, 3000] },
        attack: 0.001,
        decay: 0.006,
        delay: 0.028,
        gain: 0.4,
      },
    ],
  },
  /** Confirmations (copied, sent): the capcom's Quindar tone, a clean 2525 Hz beep. */
  quindar: {
    gain: 0.05,
    layers: [
      {
        kind: "osc",
        type: "sine",
        freq: [2525, 2525],
        attack: 0.004,
        decay: 0.16,
        gain: 1,
      },
    ],
  },
  /** A disclosure opening: a hatch unsealing, a short rising hiss. */
  hatch: {
    gain: 0.05,
    layers: [
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "bandpass", freq: [1400, 5200], Q: 1.2 },
        attack: 0.01,
        decay: 0.09,
        gain: 1,
      },
    ],
  },
  /** A disclosure closing, or Cancel: the hatch seating, a falling hiss and a thud. */
  seal: {
    gain: 0.05,
    layers: [
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "bandpass", freq: [4200, 1100], Q: 1.2 },
        attack: 0.006,
        decay: 0.07,
        gain: 0.9,
      },
      {
        kind: "osc",
        type: "sine",
        freq: [140, 90],
        attack: 0.002,
        decay: 0.05,
        delay: 0.06,
        gain: 0.7,
      },
    ],
  },
  /** A switch turning on: a guarded toggle thrown up, two detents climbing. */
  toggleUp: {
    gain: 0.07,
    layers: [
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "highpass", freq: [2200, 2200] },
        attack: 0.001,
        decay: 0.008,
        gain: 0.8,
      },
      {
        kind: "osc",
        type: "triangle",
        freq: [700, 980],
        attack: 0.001,
        decay: 0.02,
        delay: 0.03,
        gain: 0.6,
      },
    ],
  },
  /** The same toggle thrown down, for off. */
  toggleDown: {
    gain: 0.07,
    layers: [
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "highpass", freq: [2200, 2200] },
        attack: 0.001,
        decay: 0.008,
        gain: 0.8,
      },
      {
        kind: "osc",
        type: "triangle",
        freq: [900, 620],
        attack: 0.001,
        decay: 0.02,
        delay: 0.03,
        gain: 0.6,
      },
    ],
  },
} satisfies Record<string, Voice>;

export type VoiceName = keyof typeof voices;

const isVoiceName = (name: string): name is VoiceName =>
  Object.hasOwn(voices, name);

/**
 * Which voice a click plays. `data-voice` names one outright; a switch is
 * thrown up or down by the state it is leaving; links are keys; every other
 * control latches.
 */
export function voiceFor(el: Element): Voice | null {
  const named = el.getAttribute("data-voice");
  if (named && isVoiceName(named)) return voices[named];
  if (el.getAttribute("role") === "switch") {
    return el.getAttribute("aria-checked") === "true"
      ? voices.toggleDown
      : voices.toggleUp;
  }
  if (el instanceof HTMLAnchorElement) return voices.key;
  return voices.latch;
}

/** A disclosure: the hatch unseals on open and seals on close. */
export const onToggle = (details: HTMLDetailsElement): Voice =>
  details.open ? voices.hatch : voices.seal;
