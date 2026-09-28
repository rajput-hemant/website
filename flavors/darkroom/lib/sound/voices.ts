import type { Voice } from "@/lib/sound";

/**
 * The darkroom's six sounds, synthesized by the shared engine (no samples).
 * Everything is dry, small and close, as a room with the door shut: plastic,
 * paper, a relay and one timer. Gains stay at or under 0.12.
 */
export type VoiceName =
  "advance" | "tongs" | "relay" | "paper" | "timer" | "rack";

export const voices: Record<VoiceName, Voice> = {
  /* Links: the film advance lever, a short ratchet tick. */
  advance: {
    gain: 0.07,
    layers: [
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "highpass", freq: [4200, 5200], Q: 0.7 },
        attack: 0.001,
        decay: 0.012,
        gain: 1,
      },
      {
        kind: "osc",
        type: "square",
        freq: [1900, 1400],
        attack: 0.001,
        decay: 0.01,
        delay: 0.018,
        gain: 0.25,
      },
    ],
  },
  /* Buttons: plastic tongs tapped on the tray's rim. */
  tongs: {
    gain: 0.1,
    layers: [
      {
        kind: "osc",
        type: "triangle",
        freq: [880, 620],
        attack: 0.002,
        decay: 0.045,
        gain: 1,
      },
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "bandpass", freq: [2600, 1800], Q: 3 },
        attack: 0.001,
        decay: 0.02,
        gain: 0.6,
      },
    ],
  },
  /* Switches and the theme: the safelight relay closing, two dull clacks. */
  relay: {
    gain: 0.1,
    layers: [
      {
        kind: "osc",
        type: "square",
        freq: [180, 120],
        filter: { type: "lowpass", freq: [900, 500] },
        attack: 0.001,
        decay: 0.03,
        gain: 1,
      },
      {
        kind: "osc",
        type: "square",
        freq: [240, 150],
        filter: { type: "lowpass", freq: [1100, 600] },
        attack: 0.001,
        decay: 0.025,
        delay: 0.022,
        gain: 0.7,
      },
    ],
  },
  /* Disclosures: a sheet slid out of the paper box, a soft rising hiss. */
  paper: {
    gain: 0.06,
    layers: [
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "bandpass", freq: [1800, 4200], Q: 1.2 },
        attack: 0.02,
        decay: 0.14,
        gain: 1,
      },
    ],
  },
  /* Confirmations (copied): the enlarger timer, two short sine beeps. */
  timer: {
    gain: 0.08,
    layers: [
      {
        kind: "osc",
        type: "sine",
        freq: [1760, 1760],
        attack: 0.004,
        decay: 0.07,
        gain: 1,
      },
      {
        kind: "osc",
        type: "sine",
        freq: [1760, 1760],
        attack: 0.004,
        decay: 0.07,
        delay: 0.11,
        gain: 1,
      },
    ],
  },
  /* Sent: a print clipped onto the drying rack, a low thump and a clip. */
  rack: {
    gain: 0.12,
    layers: [
      {
        kind: "osc",
        type: "sine",
        freq: [150, 80],
        attack: 0.003,
        decay: 0.08,
        gain: 1,
      },
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "bandpass", freq: [3200, 2400], Q: 4 },
        attack: 0.001,
        decay: 0.018,
        delay: 0.05,
        gain: 0.5,
      },
    ],
  },
};

const isVoiceName = (name: string): name is VoiceName =>
  Object.prototype.hasOwnProperty.call(voices, name);

/**
 * Which voice a click plays: an element's own `data-voice`, else a link
 * advances the film, a switch or radio throws the relay, anything else is
 * the tongs. Passed to the shared `ClickSound` as `voiceFor`.
 */
export function voiceFor(el: Element): Voice | null {
  const named = el.getAttribute("data-voice");
  if (named) return isVoiceName(named) ? voices[named] : null;
  if (el.closest("a")) return voices.advance;
  const role = el.getAttribute("role");
  if (role === "switch" || role === "radio") return voices.relay;
  return voices.tongs;
}

/** A disclosure opening or closing: paper out of the box. */
export const onToggle = (): Voice => voices.paper;
