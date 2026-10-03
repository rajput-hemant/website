import {
  createGrainPool,
  isSoundOn,
  playVoice,
  type Layer,
  type Voice,
} from "@/lib/sound";

/**
 * "Station acoustics": the hardware a station sounds like. Every recipe is
 * synthesized through the shared engine; see docs/flavors/timetable.md "Sound".
 */

const tone = (
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

const burst = (
  type: BiquadFilterType,
  freq: number,
  decay: number,
  extra: Partial<Layer> = {}
): Layer => ({
  kind: "noise",
  freq: [freq, freq],
  filter: { type, freq: [freq, freq] },
  attack: 0.001,
  decay,
  gain: 1,
  ...extra,
});

/** Two 6ms square clicks through a 2kHz lowpass, 14ms apart. */
const relay = (first: number, second: number): Voice => ({
  gain: 0.06,
  layers: [first, second].map((hz, i) => ({
    kind: "osc",
    type: "square",
    freq: [hz, hz],
    filter: { type: "lowpass", freq: [2000, 2000] },
    attack: 0.001,
    decay: 0.006,
    delay: i * 0.014,
    gain: 1,
  })),
});

const enamelTap: Voice = {
  gain: 0.09,
  layers: [
    tone([1850, 1850], 1, 0.002, 0.045),
    tone([4420, 4420], 0.4, 0.002, 0.045),
  ],
};

/** A sine plus its second harmonic at 0.18, rung `delay` seconds in. */
const chimeTone = (hz: number, delay: number): Layer[] => [
  tone([hz, hz], 1, 0.005, 0.45, { delay }),
  tone([hz * 2, hz * 2], 0.18, 0.005, 0.45, { delay }),
];

export const VOICES = {
  /** One Solari flap landing: 5ms of noise through a 3.2kHz bandpass. */
  flutter: {
    gain: 0.035,
    layers: [
      burst("bandpass", 3200, 0.005, {
        filter: { type: "bandpass", freq: [3200, 3200], Q: 3.5 },
      }),
    ],
  },
  /** The drum coming to rest. */
  seat: { gain: 0.05, layers: [burst("lowpass", 900, 0.005)] },
  /** Nav and platform links. */
  tap: enamelTap,
  /** Every other link. */
  softTap: { ...enamelTap, gain: enamelTap.gain * 0.6 },
  /** Buttons and `.press` controls: a ticket validator. */
  clunk: {
    gain: 0.12,
    layers: [tone([150, 85], 1, 0.002, 0.07), burst("lowpass", 1200, 0.008)],
  },
  relayOn: relay(1400, 1700),
  relayOff: relay(1700, 1400),
  /** E5 then C5: the two-tone station chime, success only. */
  chime: { gain: 0.08, layers: [...chimeTone(659, 0), ...chimeTone(523, 0.2)] },
  /** The sign's rods ringing after a hard swing. */
  ring: {
    gain: 0.03,
    layers: [
      tone([2400, 2400], 1, 0.002, 0.14),
      tone([3310, 3310], 0.6, 0.002, 0.14),
    ],
  },
} satisfies Record<string, Voice>;

export type VoiceName = keyof typeof VOICES;

const isVoiceName = (name: string): name is VoiceName => name in VOICES;

/**
 * The ClickSound mapping. `el` is the clicked control, or its `data-voice`
 * ancestor. ClickSound listens in the capture phase, so `aria-checked` still
 * holds the state from before this click.
 */
export function voiceFor(el: Element, _event: MouseEvent): Voice | null {
  // ⌘K stays silent: it is keyboard-first and used many times a session.
  if (el.closest("[cmdk-root]")) return null;
  const named = el.getAttribute("data-voice");
  if (named === "none") return null;
  if (named && isVoiceName(named)) return VOICES[named];

  if (el.matches("[role=switch]"))
    return el.getAttribute("aria-checked") === "true"
      ? VOICES.relayOff
      : VOICES.relayOn;
  // Picking the option already chosen changes nothing, so nothing sounds.
  if (el.matches("[role=radio]"))
    return el.getAttribute("aria-checked") === "true" ? null : VOICES.relayOn;
  if (el.matches('a[data-scene-item^="platform:"]')) return VOICES.tap;
  if (el.matches("button, .press, [role=button]")) return VOICES.clunk;
  if (el.matches("a")) return VOICES.softTap;
  return null;
}

/**
 * Scene sounds play outside ClickSound, so they check the preference, the
 * tab and the first user gesture themselves (a board flipping on page load
 * must not try to start audio).
 */
export function canPlayScene(): boolean {
  if (!isSoundOn() || document.hidden) return false;
  return navigator.userActivation?.hasBeenActive ?? true;
}

// Confirmations get their own budget, so the click that sent the question
// never starves the chime that confirms it.
const confirmations = createGrainPool({
  maxPerSecond: 2,
  minGap: 0.3,
  maxLive: VOICES.chime.layers.length,
});

/** Ask sent, owner reply posted, email copied. Plays on touch too. */
export function playChime(): boolean {
  if (!isSoundOn() || document.hidden) return false;
  return confirmations.play(VOICES.chime);
}

const RING_DRAG = 60;
/** Release speed (px/ms) that reaches the full +10% pitch. */
const RING_SPEED = 2;

/**
 * Pitch for the rod ring after a drag released at `dragX` (px) moving at
 * `speed` (px/ms), or null when the swing is too small to ring.
 */
export function ringDetune(dragX: number, speed: number): number | null {
  if (Math.abs(dragX) <= RING_DRAG) return null;
  const t = Math.min(1, Math.abs(speed) / RING_SPEED);
  return 0.9 + 0.2 * t;
}

export function playRing(dragX: number, speed: number): boolean {
  const detune = ringDetune(dragX, speed);
  if (detune === null || !canPlayScene()) return false;
  return playVoice(VOICES.ring, { detune });
}

/**
 * A view's own hardware sound (the 404 carriage meeting the buffer stop, a
 * signal lever thrown): a voice by name, under the scene guards.
 */
export function playSceneVoice(name: VoiceName): boolean {
  if (!canPlayScene()) return false;
  return playVoice(VOICES[name]);
}
