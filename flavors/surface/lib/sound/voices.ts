import {
  createGrainPool,
  isSoundOn,
  playVoice,
  type Layer,
  type Voice,
} from "@/lib/sound";

/**
 * "Electromechanical": the HR-26 is hardware, so every sound is a mechanism
 * rather than a tone. Recipes follow the improvements audit, appendix C §5;
 * see docs/surface.md "Sound".
 *
 * Each voice's `gain` is its loudest layer's peak; layer gains are relative
 * to it. Noise layers ignore `freq`; their colour is the filter.
 */

/** Filtered noise: `hz` is the filter's centre (or cutoff), swept to `to`. */
const noise = (
  type: BiquadFilterType,
  hz: number,
  decay: number,
  extra: Partial<Layer> & { Q?: number; to?: number } = {}
): Layer => {
  const { Q, to = hz, ...rest } = extra;
  return {
    kind: "noise",
    freq: [1, 1],
    filter: { type, freq: [hz, to], ...(Q !== undefined && { Q }) },
    attack: 0.001,
    decay,
    gain: 1,
    ...rest,
  };
};

const osc = (
  type: OscillatorType,
  freq: [number, number],
  decay: number,
  gain: number,
  extra: Partial<Layer> = {}
): Layer => ({
  kind: "osc",
  type,
  freq,
  attack: 0.001,
  decay,
  gain,
  ...extra,
});

/** A piezo beep: a square through a lowpass, `delay` seconds in. */
const beep = (hz: number, decay: number, cutoff: number, delay = 0): Layer =>
  osc("square", [hz, hz], decay, 1, {
    attack: 0.003,
    delay,
    filter: { type: "lowpass", freq: [cutoff, cutoff], Q: 0.7 },
  });

export const VOICES = {
  /** A ball bearing dropping into the next detent, with the shaft's thump. */
  detent: {
    gain: 0.12,
    layers: [
      noise("bandpass", 3200, 0.01, { Q: 8 }),
      osc("sine", [180, 180], 0.012, 0.5),
    ],
  },
  /** The knob meeting its end stop. */
  endStop: {
    gain: 0.1,
    layers: [
      noise("lowpass", 900, 0.03),
      osc("triangle", [110, 80], 0.04, 0.8),
    ],
  },
  /** Channel change: a relay pulling in, contact then armature. */
  relay: {
    gain: 0.1,
    layers: [
      noise("bandpass", 1600, 0.006, { Q: 6 }),
      noise("bandpass", 2400, 0.005, { Q: 6, delay: 0.018, gain: 0.7 }),
    ],
  },
  /** A key-switch leaf closing (links and keys, on press). */
  keyDown: {
    gain: 0.07,
    layers: [
      noise("bandpass", 2200, 0.006, { Q: 4 }),
      osc("triangle", [900, 900], 0.012, 0.57),
    ],
  },
  /** The leaf springing back (on release inside the key). */
  keyUp: {
    gain: 0.04,
    layers: [
      noise("bandpass", 2800, 0.005, { Q: 4 }),
      osc("triangle", [900, 900], 0.006, 0.57),
    ],
  },
  /**
   * A slide switch: a 60ms scrape swept 1.2 to 4kHz, then the latch at
   * 110ms, the overshoot peak of the thumb's 200ms spring.
   */
  slide: {
    gain: 0.09,
    layers: [
      noise("bandpass", 1200, 0.06, { to: 4000, attack: 0.03, gain: 0.39 }),
      noise("bandpass", 1900, 0.008, { Q: 8, delay: 0.11 }),
    ],
  },
  /** The latch alone: the Motion switch, and every switch with motion off. */
  latch: { gain: 0.09, layers: [noise("bandpass", 1900, 0.008, { Q: 8 })] },
  /** Beeper OK: copied, sent, signed in. */
  confirm: {
    gain: 0.05,
    layers: [beep(1318, 0.045, 2500), beep(1760, 0.06, 2500, 0.045)],
  },
  /** Beeper alarm: two low beeps for an error. */
  alarm: {
    gain: 0.045,
    layers: [beep(440, 0.07, 1200), beep(440, 0.07, 1200, 0.12)],
  },
} satisfies Record<string, Voice>;

export type VoiceName = keyof typeof VOICES;

const isVoiceName = (name: string): name is VoiceName =>
  Object.hasOwn(VOICES, name);

/** Links and keys: their down and up leaves play from the pointer (KeySounds). */
export const KEYED = ".key, a[href]";

const motionOff = () => document.documentElement.dataset.motion === "off";

/** With motion off the thumb doesn't slide, so only the latch sounds. */
const settle = (voice: Voice): Voice =>
  voice === VOICES.slide && motionOff() ? VOICES.latch : voice;

/**
 * The ClickSound mapping. `el` is the clicked control, or its `data-voice`
 * ancestor. ClickSound listens in the capture phase, so `aria-checked` still
 * holds the state from before this click.
 */
export function voiceFor(el: Element, event: MouseEvent): Voice | null {
  // ⌘K stays silent: it is keyboard-first and used many times a session.
  if (el.closest("[cmdk-root]")) return null;
  const named = el.getAttribute("data-voice");
  if (named === "none") return null;
  if (named && isVoiceName(named)) return settle(VOICES[named]);

  if (el.matches("[role=switch]")) return settle(VOICES.slide);
  // Picking the option already chosen changes nothing, so nothing sounds.
  if (el.matches("[role=radio]"))
    return el.getAttribute("aria-checked") === "true" ? null : VOICES.latch;
  if (el.matches('a[data-channel]:not([aria-current="page"])'))
    return VOICES.relay;
  // A pointer press already played the key's leaves; a keyboard press
  // (detail 0) has no pointer events, so it plays the down leaf here.
  if (el.matches(KEYED)) return event.detail === 0 ? VOICES.keyDown : null;
  if (el.matches("button, [role=button]")) return VOICES.keyDown;
  return null;
}

/** Direct calls (knob, keys, beeps) check the preference and the tab. */
export function canPlay(): boolean {
  return isSoundOn() && !document.hidden;
}

// Key leaves get their own budget, so a quick press never loses its up leaf
// to the click limiter, and never starves a relay or a switch.
const keys = createGrainPool({ maxPerSecond: 20, minGap: 0.02, maxLive: 4 });

export function playKey(edge: "down" | "up"): boolean {
  if (!canPlay()) return false;
  return keys.play(edge === "down" ? VOICES.keyDown : VOICES.keyUp);
}

/** Knob push-to-open and the 0 to 4 shortcuts: a route change. */
export function playRelay(): boolean {
  return canPlay() && playVoice(VOICES.relay);
}

// Confirmations get their own budget, so the click that sent the question
// never starves the beep that confirms it.
const beeps = createGrainPool({
  maxPerSecond: 2,
  minGap: 0.3,
  maxLive: VOICES.confirm.layers.length,
});

/** Copied, ask filed, owner signed in. Plays on touch too. */
export function playConfirm(): boolean {
  return canPlay() && beeps.play(VOICES.confirm);
}

/** Ask or sign-in error. Plays on touch too. */
export function playAlarm(): boolean {
  return canPlay() && beeps.play(VOICES.alarm);
}

/** An instrument's lever thrown by hand (the bat toggle): slide and latch, or the latch alone with motion off. */
export function playSlide(): boolean {
  return canPlay() && playVoice(settle(VOICES.slide));
}

/** A plug or a lever seating: the latch alone. */
export function playLatch(): boolean {
  return canPlay() && playVoice(VOICES.latch);
}
