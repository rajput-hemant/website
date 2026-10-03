import {
  createGrainPool,
  isSoundOn,
  type Layer,
  type Voice,
} from "@/lib/sound";

/**
 * "The instrument case": the brass and glass a survey is made with. Short,
 * dry and mechanical, no music and no reverb. Recipes follow the
 * improvements audit, appendix E §5, deduped by §2.2: confirmations ring the
 * benchmark instead of an ink stamp (Press owns stamp) and nothing is a
 * pencil (Drawing Set owns graphite). See docs/flavors/survey.md "Sound".
 *
 * Each voice's `gain` is its loudest layer's peak; layer gains are relative
 * to it. Noise layers ignore `freq`; their colour is the filter.
 */

const sine = (
  freq: [number, number],
  gain: number,
  attack: number,
  decay: number,
  extra: Partial<Layer> = {}
): Layer => ({
  kind: "osc",
  type: "sine",
  freq,
  attack,
  decay,
  gain,
  ...extra,
});

const noise = (
  filter: NonNullable<Layer["filter"]>,
  gain: number,
  attack: number,
  decay: number,
  extra: Partial<Layer> = {}
): Layer => ({
  kind: "noise",
  freq: [1, 1],
  filter,
  attack,
  decay,
  gain,
  ...extra,
});

/** A theodolite detent: a 6ms bandpassed tick over a short sine. */
const detent = (hz: number, tone: number, decay: number): Voice => ({
  gain: 0.08,
  layers: [
    noise({ type: "bandpass", freq: [hz, hz], Q: 6 }, 1, 0.001, 0.006),
    sine([tone, tone], 0.625, 0.001, decay),
  ],
});

/** The bubble in a spirit level running from one end to the other. */
const bubble = (from: number, to: number): Voice => ({
  gain: 0.06,
  layers: [
    sine([from, to], 1, 0.004, 0.09, {
      filter: { type: "lowpass", freq: [3000, 3000] },
    }),
  ],
});

/** C5: the benchmark at the datum, before a role's height raises it. */
export const DATUM_HZ = 523.25;

/** A brass benchmark pinged: the fundamental and a fifth above at 0.3. */
const benchmark = (hz: number, gain: number, octave: boolean): Voice => ({
  gain,
  layers: [
    sine([hz, hz], 1, 0.003, 0.18),
    sine([hz * 1.5, hz * 1.5], 0.3, 0.003, 0.18),
    // The current role rings its octave too, the way it is drawn in purple.
    ...(octave ? [sine([hz * 2, hz * 2], 0.15, 0.003, 0.18)] : []),
  ],
});

export const VOICES = {
  /** Links: the alidade clicking into its next detent. */
  clickStop: detent(3200, 2400, 0.014),
  /** Buttons and filter chips: the coarse clamp, a lower, heavier detent. */
  clamp: detent(2400, 1800, 0.02),
  /** A switch turning on, and picking a new option: the bubble rises. */
  bubbleOn: bubble(660, 990),
  /** A switch turning off: the bubble falls back. */
  bubbleOff: bubble(990, 660),
  /** Theme: the sheet turned over, two brushes of paper 35ms apart. */
  sheetTurn: {
    gain: 0.05,
    layers: [
      noise({ type: "bandpass", freq: [1200, 3500] }, 1, 0.008, 0.09),
      noise({ type: "bandpass", freq: [1200, 3500] }, 0.6, 0.008, 0.06, {
        delay: 0.035,
      }),
    ],
  },
  /** A summit on the home sheet; its height sets the pitch (`pingDetune`). */
  ping: benchmark(DATUM_HZ, 0.035, false),
  /** The current role's summit. */
  pingCurrent: benchmark(DATUM_HZ, 0.035, true),
  /** A project site: a fixed, quieter ping an octave over the datum. */
  pingSite: benchmark(DATUM_HZ * 2, 0.025, false),
  /** Copied, printed, sent: the benchmark at the datum, rung a little harder. */
  confirm: benchmark(DATUM_HZ, 0.05, true),
  /** The loupe's "N roles running" count changing (`tallyDetune`). */
  tally: {
    gain: 0.02,
    layers: [
      {
        kind: "osc",
        type: "triangle",
        freq: [880, 880],
        attack: 0.002,
        decay: 0.018,
        gain: 1,
      },
    ],
  },
} satisfies Record<string, Voice>;

export type VoiceName = keyof typeof VOICES;

const isVoiceName = (name: string): name is VoiceName =>
  Object.hasOwn(VOICES, name);

/** Heights past six years ring no higher, so no ping leaves the brass band. */
const MAX_MONTHS = 72;

/** Pitch ratio for a role `months` tall: one octave per 24 months. */
export function pingDetune(months: number): number {
  const h = Number.isFinite(months) ? months : 0;
  return 2 ** (Math.min(MAX_MONTHS, Math.max(0, h)) / 24);
}

const MAX_TALLY = 8;

/** Pitch ratio for `n` roles running: a minor third per role over 880Hz. */
export function tallyDetune(n: number): number {
  const count = Number.isFinite(n) ? Math.round(n) : 0;
  return 2 ** ((Math.min(MAX_TALLY, Math.max(0, count)) * 3) / 12);
}

/**
 * ClickSound's resolver. `el` is the clicked control, or its `data-voice`
 * ancestor. ClickSound listens in the capture phase, so `aria-checked` still
 * holds the state from before this click.
 */
export function voiceFor(el: Element, event?: MouseEvent): Voice | null {
  // ⌘K stays silent: it is keyboard-first and used many times a session.
  if (el.closest("[cmdk-root]")) return null;
  const named = el.getAttribute("data-voice");
  if (named !== null) {
    // The theme toggle is a UI tap: silent on touch like every other control.
    const touch =
      event instanceof PointerEvent && event.pointerType === "touch";
    if (touch || !isVoiceName(named)) return null;
    return VOICES[named];
  }

  if (el.matches("[role=switch]"))
    return el.getAttribute("aria-checked") === "true"
      ? VOICES.bubbleOff
      : VOICES.bubbleOn;
  // Picking the option already chosen changes nothing, so nothing sounds.
  if (el.matches("[role=radio]"))
    return el.getAttribute("aria-checked") === "true" ? null : VOICES.bubbleOn;
  if (el.matches("a")) return VOICES.clickStop;
  if (el.matches("button, [role=button]")) return VOICES.clamp;
  return null;
}

/**
 * Sounds outside ClickSound check the preference, the tab and the first user
 * gesture themselves (a hover before any click must not try to start audio).
 */
export function canPlay(): boolean {
  if (!isSoundOn() || document.hidden) return false;
  return navigator.userActivation?.hasBeenActive ?? true;
}

// Confirmations get their own budget, so the click that copied or sent never
// starves the ping that confirms it.
const confirmations = createGrainPool({
  maxPerSecond: 2,
  minGap: 0.3,
  maxLive: VOICES.confirm.layers.length,
});

/** Email copied, resume printed, question sent. Plays on touch too. */
export function playConfirm(): boolean {
  if (!canPlay()) return false;
  return confirmations.play(VOICES.confirm);
}
