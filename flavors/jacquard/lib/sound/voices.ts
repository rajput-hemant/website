import type { Voice } from "@/lib/sound";

/**
 * The loom room (docs/jacquard.md, Sound): wood and cotton, nothing metallic
 * but the scissors. Every voice is synthesized by the shared engine and
 * quiet enough to sit under speech; none plays on hover, none on keyboard
 * link activation, and UI clicks stay silent on touch.
 */
export const voices = {
  /** Links: the shuttle thrown across the shed, a soft airy pass and a wooden catch. */
  shuttle: {
    gain: 0.07,
    layers: [
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "bandpass", freq: [3200, 1100], Q: 1.4 },
        attack: 0.006,
        decay: 0.05,
        gain: 0.8,
      },
      {
        kind: "osc",
        type: "triangle",
        freq: [880, 620],
        attack: 0.001,
        decay: 0.022,
        delay: 0.045,
        gain: 0.45,
      },
    ],
  },
  /** Buttons: a heddle lifting, a short hollow knock that rises. */
  heddle: {
    gain: 0.08,
    layers: [
      {
        kind: "osc",
        type: "triangle",
        freq: [420, 540],
        attack: 0.002,
        decay: 0.035,
        gain: 1,
      },
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "highpass", freq: [2600, 2600] },
        attack: 0.001,
        decay: 0.008,
        gain: 0.35,
      },
    ],
  },
  /** Confirmations (copied, sent): the beater packing the pick, a low felted thud. */
  beater: {
    gain: 0.12,
    layers: [
      {
        kind: "osc",
        type: "sine",
        freq: [118, 64],
        attack: 0.003,
        decay: 0.11,
        gain: 1,
      },
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "lowpass", freq: [520, 180] },
        attack: 0.002,
        decay: 0.06,
        gain: 0.5,
      },
    ],
  },
  /** A disclosure opening: the punched card chain advancing one card, two dry clicks. */
  card: {
    gain: 0.06,
    layers: [
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "highpass", freq: [2400, 2400] },
        attack: 0.001,
        decay: 0.007,
        gain: 1,
      },
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "highpass", freq: [2000, 2000] },
        attack: 0.001,
        decay: 0.007,
        delay: 0.034,
        gain: 0.8,
      },
    ],
  },
  /** A switch turning on: the bobbin winding up, a filtered whirr that climbs. */
  bobbinUp: {
    gain: 0.05,
    layers: [
      {
        kind: "osc",
        type: "sawtooth",
        freq: [180, 320],
        filter: { type: "lowpass", freq: [700, 2000], Q: 2 },
        attack: 0.01,
        decay: 0.12,
        gain: 1,
      },
    ],
  },
  /** The same winding back down, for off. */
  bobbinDown: {
    gain: 0.05,
    layers: [
      {
        kind: "osc",
        type: "sawtooth",
        freq: [320, 170],
        filter: { type: "lowpass", freq: [2000, 650], Q: 2 },
        attack: 0.01,
        decay: 0.12,
        gain: 1,
      },
    ],
  },
  /** A disclosure closing, or Cancel: the selvedge snipped, two bright ticks of the blades. */
  snip: {
    gain: 0.05,
    layers: [
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "highpass", freq: [6500, 6500] },
        attack: 0.001,
        decay: 0.006,
        gain: 1,
      },
      {
        kind: "osc",
        type: "triangle",
        freq: [3100, 2500],
        attack: 0.001,
        decay: 0.012,
        delay: 0.018,
        gain: 0.5,
      },
    ],
  },
} satisfies Record<string, Voice>;

export type VoiceName = keyof typeof voices;

const isVoiceName = (name: string): name is VoiceName =>
  Object.hasOwn(voices, name);

/**
 * Which voice a click plays. `data-voice` names one outright; a switch winds
 * up or down by the state it is leaving; links throw the shuttle; every
 * other control lifts a heddle.
 */
export function voiceFor(el: Element): Voice | null {
  const named = el.getAttribute("data-voice");
  if (named && isVoiceName(named)) return voices[named];
  if (el.getAttribute("role") === "switch") {
    return el.getAttribute("aria-checked") === "true"
      ? voices.bobbinDown
      : voices.bobbinUp;
  }
  if (el instanceof HTMLAnchorElement) return voices.shuttle;
  return voices.heddle;
}

/** A disclosure: the card chain advances on open, the blades snip on close. */
export const onToggle = (details: HTMLDetailsElement): Voice =>
  details.open ? voices.card : voices.snip;
