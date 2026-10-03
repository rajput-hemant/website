import {
  createGrainPool,
  isSoundOn,
  type Layer,
  type Voice,
} from "@/lib/sound";

/**
 * "The drafting room": graphite on vellum, a pencil clutch, a steel
 * plan-chest runner, a sheet sliding out, a rubber stamp and the plotter's
 * stepper. Dry and close, every voice under 0.2 gain and shorter than the
 * motion it goes with. Drawing Set owns the pencil and graphite family; its
 * stamp stays dry and high (220 to 140 Hz) so it never reads as Press's low
 * stamp (audit §2.2). See docs/flavors/design.md "Sound".
 *
 * Each voice's `gain` is its loudest layer's peak; layer gains are relative
 * to it. Noise layers ignore `freq`; their colour is the filter.
 */

const noise = (
  type: BiquadFilterType,
  freq: [number, number],
  attack: number,
  decay: number,
  gain: number,
  extra: Partial<Layer> = {}
): Layer => ({
  kind: "noise",
  freq: [1, 1],
  filter: { type, freq },
  attack,
  decay,
  gain,
  ...extra,
});

const osc = (
  type: OscillatorType,
  freq: [number, number],
  attack: number,
  decay: number,
  gain: number,
  extra: Partial<Layer> = {}
): Layer => ({ kind: "osc", type, freq, attack, decay, gain, ...extra });

/**
 * The clutch: two 3ms highpassed ticks 24ms apart, the loud one (0.09) with
 * a 5ms square at 950Hz under it. `loudFirst` false reverses the pair, so a
 * switch turning off sounds like the lead being released.
 */
const clutch = (loudFirst: boolean): Voice => {
  const [loud, quiet] = loudFirst ? [0, 0.024] : [0.024, 0];
  return {
    gain: 0.09,
    layers: [
      noise("highpass", [2500, 2500], 0.001, 0.003, 1, { delay: loud }),
      noise("highpass", [2500, 2500], 0.001, 0.003, 0.55, { delay: quiet }),
      osc("square", [950, 950], 0.001, 0.005, 0.45, { delay: loud }),
    ],
  };
};

export const VOICES = {
  /** Links: a pencil tap on vellum. */
  lead: {
    gain: 0.07,
    layers: [
      {
        ...noise("bandpass", [3200, 3200], 0.001, 0.014, 1),
        filter: { type: "bandpass", freq: [3200, 3200], Q: 1.4 },
      },
      osc("triangle", [1900, 1300], 0.001, 0.012, 0.57),
    ],
  },
  /** Buttons, switches turning on, segmented controls. */
  clutch: clutch(true),
  /** A switch turning off: the clutch reversed, quiet first. */
  clutchOff: clutch(false),
  /**
   * The plan-chest runner: bandpassed noise swept 240 to 620Hz over 170ms,
   * then a 72Hz stop thump as the drawer hits its end.
   */
  drawer: {
    gain: 0.12,
    layers: [
      {
        ...noise("bandpass", [240, 620], 0.025, 0.17, 0.83),
        filter: { type: "bandpass", freq: [240, 620], Q: 1 },
      },
      osc("sine", [72, 72], 0.002, 0.04, 1, { delay: 0.17 }),
    ],
  },
  /** A sheet slid out of the set: bandpassed noise swept 1.5 to 4.2kHz. */
  sheet: {
    gain: 0.05,
    layers: [
      {
        ...noise("bandpass", [1500, 4200], 0.02, 0.13, 1),
        filter: { type: "bandpass", freq: [1500, 4200], Q: 0.8 },
      },
    ],
  },
  /** ANSWERED, sent, copied: a dry, high rubber stamp. */
  stamp: {
    gain: 0.15,
    layers: [
      osc("sine", [220, 140], 0.001, 0.06, 1),
      noise("lowpass", [1800, 1800], 0.001, 0.02, 0.5),
    ],
  },
  /** One step of the pen plotter; `plotStepper` gates it at 55Hz. */
  plot: {
    gain: 0.025,
    layers: [
      osc("square", [480, 480], 0.001, 0.008, 1, {
        filter: { type: "lowpass", freq: [2000, 2000] },
      }),
    ],
  },
  /**
   * Reduced motion: the drawer snaps and nothing plots, so the runner and
   * the stepper become this one short thunk.
   */
  thunk: {
    gain: 0.1,
    layers: [
      osc("sine", [96, 64], 0.002, 0.045, 1),
      noise("lowpass", [500, 500], 0.001, 0.012, 0.4),
    ],
  },
} satisfies Record<string, Voice>;

export type VoiceName = keyof typeof VOICES;

const isVoiceName = (name: string): name is VoiceName =>
  Object.hasOwn(VOICES, name);

/**
 * The ClickSound mapping. `el` is the clicked control, or its `data-voice`
 * ancestor. ClickSound listens in the capture phase, so `aria-checked` still
 * holds the state from before this click.
 */
export function voiceFor(el: Element, _event?: MouseEvent): Voice | null {
  // ⌘K stays silent: it is keyboard-first and used many times a session.
  if (el.closest("[cmdk-root]")) return null;
  const named = el.getAttribute("data-voice");
  if (named === "none") return null;
  if (named && isVoiceName(named)) return VOICES[named];

  if (el.matches("[role=switch]"))
    return el.getAttribute("aria-checked") === "true"
      ? VOICES.clutchOff
      : VOICES.clutch;
  // Picking the option already chosen changes nothing, so nothing sounds.
  if (el.matches("[role=radio]"))
    return el.getAttribute("aria-checked") === "true" ? null : VOICES.clutch;
  if (el.matches("button, .press, [role=button]")) return VOICES.clutch;
  if (el.matches("a")) return VOICES.lead;
  return null;
}

/**
 * Scene sounds play outside ClickSound, so they check the preference, the
 * tab and the first user gesture themselves (a drawer opening on page load
 * must not try to start audio).
 */
export function canPlayScene(): boolean {
  if (!isSoundOn() || document.hidden) return false;
  return navigator.userActivation?.hasBeenActive ?? true;
}

// Confirmations get their own budget, so the click that sent the question
// never starves the stamp that confirms it.
const confirmations = createGrainPool({
  maxPerSecond: 2,
  minGap: 0.3,
  maxLive: VOICES.stamp.layers.length,
});

/** RFI sent, owner answer posted (ANSWERED), email copied. Plays on touch too. */
export function playStamp(): boolean {
  if (!isSoundOn() || document.hidden) return false;
  return confirmations.play(VOICES.stamp);
}
