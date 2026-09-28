import type { LoopSpec, Voice } from "@/lib/sound";

/**
 * The pressroom at arm's length: dry, short, low sounds of one sheet, never
 * the whole press. Recipes follow the improvements audit, appendix F §5; the
 * stamp stays low (120 to 58 Hz) because Press owns it (audit §2.2).
 *
 * Each voice's `gain` is its loudest layer's peak; layer gains are relative
 * to it. Noise layers ignore `freq`; their colour is the filter.
 */
export const pressVoices = {
  /** Links: paper tapped on the steel platen. */
  platen: {
    gain: 0.1,
    layers: [
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "bandpass", freq: [3200, 3200], Q: 1.1 },
        attack: 0.0015,
        decay: 0.024,
        gain: 1,
      },
      {
        kind: "osc",
        type: "sine",
        freq: [190, 190],
        attack: 0.002,
        decay: 0.03,
        gain: 0.6,
      },
    ],
  },
  /** Buttons, switches, radios, copied: a rubber stamp thunk and its pad. */
  stamp: {
    gain: 0.16,
    layers: [
      {
        kind: "osc",
        type: "sine",
        freq: [120, 58],
        attack: 0.002,
        decay: 0.072,
        gain: 1,
      },
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "lowpass", freq: [900, 900] },
        attack: 0.001,
        decay: 0.03,
        gain: 0.3125,
      },
    ],
  },
  /** A headline pulled into register: P1 then P2 seating on the pins. */
  pins: {
    gain: 0.05,
    layers: [
      {
        kind: "osc",
        type: "triangle",
        freq: [2600, 2600],
        filter: { type: "highpass", freq: [1500, 1500] },
        attack: 0.0008,
        decay: 0.005,
        gain: 1,
      },
      {
        kind: "osc",
        type: "triangle",
        freq: [2350, 2350],
        filter: { type: "highpass", freq: [1500, 1500] },
        attack: 0.0008,
        decay: 0.005,
        delay: 0.009,
        gain: 1,
      },
    ],
  },
  /**
   * A new sheet through the nip: bandpassed noise swept 700 to 2400 Hz with
   * a second swell standing in for the hold (the engine's envelope decays
   * straight after the attack), over a low drum roll.
   */
  feed: {
    gain: 0.07,
    layers: [
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "bandpass", freq: [700, 2400], Q: 0.8 },
        attack: 0.02,
        decay: 0.2,
        gain: 1,
      },
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "bandpass", freq: [1000, 2400], Q: 0.8 },
        attack: 0.07,
        decay: 0.14,
        delay: 0.06,
        gain: 0.7,
      },
      {
        kind: "osc",
        type: "sine",
        freq: [62, 62],
        attack: 0.01,
        decay: 0.16,
        gain: 0.57,
      },
    ],
  },
  /** Theme: a thin aluminium plate swapped on its cylinder. */
  plate: {
    gain: 0.05,
    layers: [
      {
        kind: "osc",
        type: "sine",
        freq: [1320, 1320],
        attack: 0.001,
        decay: 0.14,
        gain: 1,
      },
      {
        kind: "osc",
        type: "sine",
        freq: [1987, 1987],
        attack: 0.001,
        decay: 0.09,
        gain: 1,
      },
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "highpass", freq: [4000, 4000] },
        attack: 0.001,
        decay: 0.006,
        gain: 0.6,
      },
    ],
  },
} satisfies Record<string, Voice>;

export type PressVoice = keyof typeof pressVoices;

/** Peel drag: paper flexing, driven by drag speed (level) and pitch (rate). */
export const paperFlex: LoopSpec = {
  kind: "noise",
  filter: { type: "lowpass", freq: 2800 },
  gain: 0.05,
};

const CLICKABLE = "a, button, [role=button], [role=switch], [role=radio]";

const isPressVoice = (name: string): name is PressVoice =>
  Object.hasOwn(pressVoices, name);

/**
 * ClickSound's resolver. `data-voice` names a voice ("none" or an unknown
 * name is silent, for controls that sound on their own event instead);
 * otherwise links kiss the platen and buttons, switches and radios stamp.
 */
export function voiceFor(el: Element, event?: MouseEvent): Voice | null {
  const named = el.getAttribute("data-voice");
  // The theme toggle is a UI tap: silent on touch like every other control.
  const touch = event instanceof PointerEvent && event.pointerType === "touch";
  if (named === "plate" && touch) return null;
  if (named !== null) return isPressVoice(named) ? pressVoices[named] : null;
  const control = el.closest(CLICKABLE);
  if (!control) return null;
  return control instanceof HTMLAnchorElement
    ? pressVoices.platen
    : pressVoices.stamp;
}
