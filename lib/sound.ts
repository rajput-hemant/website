/**
 * Synthesised UI sound. No audio assets: every tick is a short triangle-wave
 * blip with a fast exponential decay, so it costs nothing to load.
 *
 * Browsers only let an AudioContext start inside a user gesture, so the context
 * is created lazily on the first call, which always happens in a click handler.
 */

export type TickVariant = "link" | "button";

const TICK_HZ: Record<TickVariant, number> = { link: 2200, button: 1500 };
const TICK_SECONDS = 0.03;
const TICK_GAIN = 0.15;
const ATTACK_SECONDS = 0.002;
const SILENCE = 0.0001;

let context: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof AudioContext === "undefined") return null;
  context ??= new AudioContext();
  if (context.state === "suspended") void context.resume();
  return context;
}

/** Create or resume the audio context. Call from a user gesture, e.g. the sound switch. */
export function primeSound() {
  getContext();
}

/** Release the audio device while sound is switched off. */
export function suspendSound() {
  if (context?.state === "running") void context.suspend();
}

export function playTick(variant: TickVariant) {
  const audio = getContext();
  if (!audio) return;

  const start = audio.currentTime;
  const end = start + TICK_SECONDS;
  const pitch = TICK_HZ[variant];

  const oscillator = new OscillatorNode(audio, {
    type: "triangle",
    frequency: pitch,
  });
  oscillator.frequency.setValueAtTime(pitch, start);
  oscillator.frequency.exponentialRampToValueAtTime(pitch * 0.6, end);

  // A 2ms attack instead of a hard step keeps the tick from popping.
  const gain = new GainNode(audio, { gain: SILENCE });
  gain.gain.setValueAtTime(SILENCE, start);
  gain.gain.linearRampToValueAtTime(TICK_GAIN, start + ATTACK_SECONDS);
  gain.gain.exponentialRampToValueAtTime(SILENCE, end);

  oscillator.connect(gain).connect(audio.destination);
  oscillator.addEventListener("ended", () => gain.disconnect(), {
    once: true,
  });
  oscillator.start(start);
  oscillator.stop(end);
}
