import {
  createGrainPool,
  isSoundOn,
  type Layer,
  type Voice,
} from "@/lib/sound";

/**
 * "Paper and nib": everything sounds like it happens on a desk a few
 * centimetres away, never like a UI chirp. Dry, short and low; every voice
 * peaks at gain 0.07 or less. Recipes follow the improvements audit,
 * appendix A §5, with the §2.2 dedupe: confirmations `blot` (Press owns the
 * stamp) and links `flick` (Drawing Set owns the pencil). See
 * docs/architecture/architecture.md "Sound".
 *
 * Each voice's `gain` is its loudest layer's peak; layer gains are relative
 * to it. Noise layers ignore `freq`; their colour is the filter.
 */

const noise = (
  type: BiquadFilterType,
  freq: [number, number],
  attack: number,
  decay: number,
  extra: Partial<Layer> = {}
): Layer => ({
  kind: "noise",
  freq: [1, 1],
  filter: { type, freq },
  attack,
  decay,
  gain: 1,
  ...extra,
});

const tone = (
  type: OscillatorType,
  freq: [number, number],
  attack: number,
  decay: number,
  extra: Partial<Layer> = {}
): Layer => ({ kind: "osc", type, freq, attack, decay, gain: 1, ...extra });

/** A 5kHz highpassed tick of paper under a fingertip, 8ms. */
const flickLayer = (extra: Partial<Layer> = {}) =>
  noise("highpass", [5000, 5000], 0.001, 0.008, extra);

/**
 * A card set down: a 6ms highpassed paper edge over a short triangle body
 * falling to 420/620 of `body` over 25ms. The body's pitch carries meaning
 * (switch on or off, theme light or dark).
 */
const set = (body: number, gain = 0.055): Voice => ({
  gain,
  layers: [
    noise("highpass", [1800, 1800], 0.001, 0.006, { gain: 0.5 }),
    tone("triangle", [body, (body * 420) / 620], 0.002, 0.025),
  ],
});

/** A page turning: bandpassed noise swept between 1.2 and 3.8kHz. */
const leaf = (freq: [number, number], pan: number): Voice => ({
  gain: 0.03,
  pan,
  layers: [
    noise("bandpass", freq, 0.018, 0.14, {
      filter: { type: "bandpass", freq, Q: 0.9 },
    }),
  ],
});

/** The dull knock: a `set` body at 420Hz, lowpassed, twice 70ms apart. */
const knockLayers = [0, 0.07].flatMap((delay) => [
  noise("lowpass", [1500, 1500], 0.001, 0.006, { delay, gain: 0.4 }),
  tone("triangle", [420, 285], 0.002, 0.025, {
    delay,
    filter: { type: "lowpass", freq: [1500, 1500] },
  }),
]);

export const VOICES = {
  /** Links. */
  flick: { gain: 0.03, layers: [flickLayer()] },
  /** External links and mailto: a double flick, the second at half. */
  flickOut: {
    gain: 0.03,
    layers: [flickLayer(), flickLayer({ delay: 0.04, gain: 0.5 })],
  },
  /** Buttons and radios. */
  set: set(620),
  /** A switch turning on (higher) or off (lower). */
  setOn: set(700),
  setOff: set(520),
  /** The theme turning light (bright) or dark (low). */
  setLight: set(760, 0.05),
  setDark: set(380, 0.05),
  /** Disclosure opening (pitch sweeps up, leans right) or closing. */
  leafOpen: leaf([1200, 3800], 0.15),
  leafClose: leaf([3800, 1200], -0.15),
  /** Copied: a felt thud, noise lowpassed at 600Hz over a falling sine. */
  blot: {
    gain: 0.07,
    layers: [
      tone("sine", [140, 90], 0.002, 0.04),
      noise("lowpass", [600, 600], 0.001, 0.04, { gain: 0.6 }),
    ],
  },
  /** Ask sent, owner signed in: a paper plane leaving the hand. */
  sent: {
    gain: 0.04,
    layers: [
      noise("bandpass", [600, 2400], 0.03, 0.24, {
        filter: { type: "bandpass", freq: [600, 2400], Q: 1 },
      }),
      tone("sine", [1320, 1320], 0.003, 0.09, { delay: 0.2, gain: 0.3 }),
      tone("sine", [1760, 1760], 0.003, 0.09, { delay: 0.23, gain: 0.3 }),
    ],
  },
  /** A form error or a wrong passphrase. */
  knock: { gain: 0.05, layers: knockLayers },
} satisfies Record<string, Voice>;

export type VoiceName = keyof typeof VOICES;

/** The voices that confirm an outcome; they play on touch too. */
export type Confirmation = "blot" | "sent" | "knock";

const CONFIRMATIONS = new Set<string>(["blot", "sent", "knock"]);

const isVoiceName = (name: string): name is VoiceName =>
  Object.hasOwn(VOICES, name);

const isTouch = (event: MouseEvent) =>
  event instanceof PointerEvent && event.pointerType === "touch";

const isExternal = (link: HTMLAnchorElement) =>
  link.target === "_blank" || link.origin !== window.location.origin;

/**
 * The ClickSound mapping. `el` is the clicked control, or its `data-voice`
 * ancestor. ClickSound listens in the capture phase, so `aria-checked` and
 * `data-theme` still hold the state from before this click.
 */
export function voiceFor(el: Element, event: MouseEvent): Voice | null {
  // ⌘K stays silent: it is keyboard-first and used many times a session.
  if (el.closest("[cmdk-root]")) return null;
  const control = el.closest(
    "a, button, [role=button], [role=switch], [role=radio]"
  );
  // Picking the option already chosen changes nothing, so nothing sounds.
  if (
    control?.matches("[role=radio]") &&
    control.getAttribute("aria-checked") === "true"
  )
    return null;

  const named = el.getAttribute("data-voice");
  if (named !== null) {
    // Touch UI clicks are silent; only confirmations may play there.
    if (isTouch(event) && !CONFIRMATIONS.has(named)) return null;
    if (named === "theme")
      return document.documentElement.dataset.theme === "dark"
        ? VOICES.setLight
        : VOICES.setDark;
    return isVoiceName(named) ? VOICES[named] : null;
  }
  if (!control || isTouch(event)) return null;

  if (control.matches("[role=switch]"))
    return control.getAttribute("aria-checked") === "true"
      ? VOICES.setOff
      : VOICES.setOn;
  if (control instanceof HTMLAnchorElement)
    return isExternal(control) ? VOICES.flickOut : VOICES.flick;
  return VOICES.set;
}

/**
 * ClickSound's `onToggle`. The `toggle` event also fires when a hash opens a
 * disclosure on load, so only a toggle the visitor just caused sounds.
 */
export function voiceForToggle(details: HTMLDetailsElement): Voice | null {
  if (!(navigator.userActivation?.isActive ?? true)) return null;
  return details.open ? VOICES.leafOpen : VOICES.leafClose;
}

// Confirmations get their own budget, so the click that caused one never
// starves it (the click's own voice took the shared limiter's 40ms slot).
const confirmations = createGrainPool({
  maxPerSecond: 3,
  minGap: 0.15,
  maxLive: 4,
});

/** Copied, sent, signed in, a form error. Plays on touch too. */
export function playConfirmation(name: Confirmation): boolean {
  if (!isSoundOn() || document.hidden) return false;
  return confirmations.play(VOICES[name]);
}
