export type TickVariant = "link" | "button";

type Filter = {
  type: BiquadFilterType;
  freq: [number, number];
  Q?: number;
};

export type Layer = {
  kind: "osc" | "noise";
  type?: OscillatorType;
  freq: [number, number];
  filter?: Filter;
  attack: number;
  decay: number;
  delay?: number;
  gain: number;
};

export type Voice = { layers: Layer[]; gain: number; pan?: number };

/**
 * Per-play variation applied on top of a voice, so an edition can reuse one
 * recipe with data-driven pitch or level instead of cloning it.
 * - gain: multiplier on the voice gain (default 1)
 * - detune: frequency ratio applied to every osc and filter frequency, e.g.
 *   1.08 is 8% sharper (default 1)
 * - delay: seconds from now before the voice starts (default 0); the
 *   limiters still measure from the call, not from the delayed start
 */
export type PlayOptions = { gain?: number; detune?: number; delay?: number };

const SILENCE = 0.0001;
const MIN_INTERVAL = 0.04;
const SAME_VOICE_INTERVAL = 0.08;
const MAX_LIVE_SOURCES = 4;

export const TICK_VOICES: Record<TickVariant, Voice> = {
  link: {
    gain: 0.15,
    layers: [
      {
        kind: "osc",
        type: "triangle",
        freq: [2200, 1320],
        attack: 0.002,
        decay: 0.03,
        gain: 1,
      },
    ],
  },
  button: {
    gain: 0.15,
    layers: [
      {
        kind: "osc",
        type: "triangle",
        freq: [1500, 900],
        attack: 0.002,
        decay: 0.03,
        gain: 1,
      },
    ],
  },
};

let context: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let lastStart = -Infinity;
const clickBudget = { live: 0 };
const lastVoice = new WeakMap<Voice, number>();
const loops = new Set<() => void>();

type AudioSession = { type: string };

function hasAudioSession(
  nav: Navigator
): nav is Navigator & { audioSession: AudioSession } {
  return (
    "audioSession" in nav &&
    typeof nav.audioSession === "object" &&
    nav.audioSession !== null &&
    "type" in nav.audioSession
  );
}

function isHidden() {
  return typeof document !== "undefined" && document.hidden;
}

function getContext(): AudioContext | null {
  if (typeof AudioContext === "undefined") return null;
  if (!context) {
    // Ambient lets the iOS silent switch mute the site, like other web audio
    // that is not the page's main content.
    if (typeof navigator !== "undefined" && hasAudioSession(navigator)) {
      navigator.audioSession.type = "ambient";
    }
    context = new AudioContext();
    master = new GainNode(context, { gain: 1 });
    const compressor = new DynamicsCompressorNode(context, {
      threshold: -12,
      knee: 6,
      ratio: 12,
      attack: 0.003,
      release: 0.08,
    });
    master.connect(compressor).connect(context.destination);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) suspendSound();
    });
  }
  if (context.state === "suspended") void context.resume();
  return context;
}

function noiseBuffer(audio: AudioContext): AudioBuffer {
  if (!noise) {
    noise = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
    const samples = noise.getChannelData(0);
    for (let index = 0; index < samples.length; index++) {
      samples[index] = Math.random() * 2 - 1;
    }
  }
  return noise;
}

/** True when the visitor turned sound on (`data-sound` on <html>, set by
 * lib/prefs). Scene code that plays outside ClickSound checks this first. */
export function isSoundOn(): boolean {
  return (
    typeof document !== "undefined" &&
    document.documentElement.dataset.sound === "on"
  );
}

/** Stops every live loop and suspends the context (mute, hidden tab). */
export function suspendSound() {
  for (const stop of [...loops]) stop();
  if (context?.state === "running") void context.suspend();
}

const MAX_GAIN_SCALE = 4;
const MAX_DELAY = 2;

/** Per-play options with non-finite or out-of-range values replaced, so a
 * bad option can never make an AudioParam call throw mid-voice. */
function normalize(options: PlayOptions) {
  const { gain = 1, detune = 1, delay = 0 } = options;
  return {
    gain: Number.isFinite(gain)
      ? Math.min(MAX_GAIN_SCALE, Math.max(0, gain))
      : 1,
    detune: Number.isFinite(detune) && detune > 0 ? detune : 1,
    delay: Number.isFinite(delay) ? Math.min(MAX_DELAY, Math.max(0, delay)) : 0,
  };
}

/**
 * Schedules every layer of a voice into `output`. `budget.live` counts the
 * sources still playing; grains start the noise at a random offset so two
 * grains never share a waveform.
 */
function schedule(
  audio: AudioContext,
  output: AudioNode,
  voice: Voice,
  options: PlayOptions,
  budget: { live: number },
  randomOffset: boolean
) {
  const { gain: scale, detune, delay } = normalize(options);
  const now = audio.currentTime + delay;
  const level = voice.gain * scale;
  const panner =
    voice.pan === undefined
      ? null
      : new StereoPannerNode(audio, { pan: voice.pan });
  panner?.connect(output);
  const destination = panner ?? output;
  let remaining = voice.layers.length;

  for (const layer of voice.layers) {
    const start = now + (layer.delay ?? 0);
    const end = start + layer.decay;
    let source: OscillatorNode | AudioBufferSourceNode;

    if (layer.kind === "noise") {
      source = new AudioBufferSourceNode(audio, {
        buffer: noiseBuffer(audio),
        loop: true,
      });
    } else {
      const [from, to] = [layer.freq[0] * detune, layer.freq[1] * detune];
      source = new OscillatorNode(audio, {
        type: layer.type ?? "sine",
        frequency: from,
      });
      source.frequency.setValueAtTime(from, start);
      source.frequency.exponentialRampToValueAtTime(to, end);
    }

    const gain = new GainNode(audio, { gain: SILENCE });
    gain.gain.setValueAtTime(SILENCE, start);
    gain.gain.linearRampToValueAtTime(
      Math.min(1, Math.max(SILENCE, level * layer.gain)),
      start + layer.attack
    );
    gain.gain.exponentialRampToValueAtTime(SILENCE, end);

    if (layer.filter) {
      const [from, to] = [
        layer.filter.freq[0] * detune,
        layer.filter.freq[1] * detune,
      ];
      const filter = new BiquadFilterNode(audio, {
        type: layer.filter.type,
        frequency: from,
        ...(layer.filter.Q !== undefined && { Q: layer.filter.Q }),
      });
      filter.frequency.setValueAtTime(from, start);
      filter.frequency.exponentialRampToValueAtTime(to, end);
      source.connect(filter).connect(gain);
      source.addEventListener(
        "ended",
        () => {
          filter.disconnect();
        },
        { once: true }
      );
    } else {
      source.connect(gain);
    }
    gain.connect(destination);
    budget.live++;
    source.addEventListener(
      "ended",
      () => {
        source.disconnect();
        gain.disconnect();
        budget.live--;
        remaining--;
        if (!remaining) panner?.disconnect();
      },
      { once: true }
    );
    if (randomOffset && source instanceof AudioBufferSourceNode) {
      source.start(start, Math.random() * (source.buffer?.duration ?? 0));
    } else {
      source.start(start);
    }
    source.stop(end);
  }
}

/**
 * Plays a UI voice through the shared click limiter: at most one voice per
 * 40ms, the same voice at most once per 80ms, at most 4 live sources, and
 * nothing while the tab is hidden. Returns whether it was scheduled.
 */
export function playVoice(voice: Voice, options: PlayOptions = {}): boolean {
  if (isHidden()) {
    suspendSound();
    return false;
  }
  // Resume first: sources in flight when the context was suspended only end
  // (and free their budget) once the clock runs again.
  const audio = getContext();
  if (!audio || !master) return false;
  if (
    !voice.layers.length ||
    clickBudget.live + voice.layers.length > MAX_LIVE_SOURCES
  )
    return false;

  const now = audio.currentTime;
  if (now - lastStart < MIN_INTERVAL) return false;
  if (now - (lastVoice.get(voice) ?? -Infinity) < SAME_VOICE_INTERVAL)
    return false;

  lastStart = now;
  lastVoice.set(voice, now);
  schedule(audio, master, voice, options, clickBudget, false);
  return true;
}

export function playTick(variant: TickVariant) {
  playVoice(TICK_VOICES[variant]);
}

/**
 * Budget for a grain pool, all times in seconds of the audio clock.
 * - maxPerSecond: grains accepted in any 1s window of start times
 * - minGap: minimum spacing between two grain start times
 * - maxPerBurst: grains accepted per burst, a run of calls less than
 *   `minGap` apart on the audio clock (one animation frame in practice);
 *   default unlimited
 * - maxLive: sources this pool may have playing at once (default 12)
 */
export type GrainPoolOptions = {
  maxPerSecond: number;
  minGap: number;
  maxPerBurst?: number;
  maxLive?: number;
};

export type GrainPool = {
  play: (voice: Voice, options?: PlayOptions) => boolean;
};

const MAX_LIVE_GRAINS = 12;

/**
 * A separate path for dense textures (flutters, riffles): grains skip the
 * click limiter, so clicks and grains never starve each other, and are
 * bounded by this pool's own budget instead. `delay` counts toward the
 * spacing, so a caller can place several grains ahead in one frame.
 */
export function createGrainPool({
  maxPerSecond,
  minGap,
  maxPerBurst = Infinity,
  maxLive = MAX_LIVE_GRAINS,
}: GrainPoolOptions): GrainPool {
  const budget = { live: 0 };
  let starts: number[] = [];
  let burstStart = -Infinity;
  let burstCount = 0;

  return {
    play(voice, options = {}) {
      if (isHidden()) {
        suspendSound();
        return false;
      }
      const audio = getContext();
      if (!audio || !master) return false;
      if (!voice.layers.length || budget.live + voice.layers.length > maxLive)
        return false;

      const now = audio.currentTime;
      const at = now + normalize(options).delay;
      if (now - burstStart >= minGap) {
        burstStart = now;
        burstCount = 0;
      }
      if (burstCount >= maxPerBurst) return false;
      starts = starts.filter((time) => time > now - 1);
      if (starts.some((time) => Math.abs(time - at) < minGap)) return false;
      // Grains may be placed ahead out of order, so check every 1s window
      // that would contain this start, not just the second before it.
      const times = [...starts, at].sort((x, y) => x - y);
      const crowded = times.some(
        (from) =>
          from <= at &&
          at < from + 1 &&
          times.filter((time) => time >= from && time < from + 1).length >
            maxPerSecond
      );
      if (crowded) return false;

      starts.push(at);
      burstCount++;
      schedule(audio, master, voice, options, budget, true);
      return true;
    },
  };
}

/**
 * A continuous source whose level the caller drives (a drag, a hold).
 * - kind "noise" plays the shared noise buffer; `playbackRate` shifts it
 * - kind "osc" plays an oscillator of `type` at `freq`
 * - gain: peak gain at level 1; level starts at `level` (default 0)
 */
export type LoopSpec = {
  kind: "osc" | "noise";
  type?: OscillatorType;
  freq?: number;
  filter?: { type: BiquadFilterType; freq: number; Q?: number };
  gain: number;
  level?: number;
  playbackRate?: number;
  pan?: number;
};

/**
 * - setLevel: 0..1 of the spec gain, smoothed (time constant 30ms)
 * - setRate: ratio on the spec's playbackRate (noise) or freq (osc), so 1
 *   restores the spec; smoothed like setLevel
 * - stop: fades out over `release` seconds (default 0.06; 0 cuts at once),
 *   then frees every node. Calls after stop, or after mute or a hidden tab
 *   stopped the loop, are ignored; start a new loop to resume
 */
export type LoopHandle = {
  setLevel: (level: number) => void;
  setRate: (rate: number) => void;
  stop: (release?: number) => void;
};

const LOOP_SMOOTHING = 0.03;
const LOOP_RELEASE = 0.06;
const SILENT_LOOP: LoopHandle = {
  setLevel: () => {},
  setRate: () => {},
  stop: () => {},
};

/**
 * Starts a loop outside the click limiter. Each call returns its own handle;
 * mute (suspendSound) and a hidden tab stop every loop and free its nodes.
 * While hidden or without Web Audio it returns a handle that does nothing.
 */
export function startLoop(spec: LoopSpec): LoopHandle {
  if (isHidden()) {
    suspendSound();
    return SILENT_LOOP;
  }
  const audio = getContext();
  if (!audio || !master) return SILENT_LOOP;

  const clamp = (level: number) => Math.min(1, Math.max(0, level));
  const source =
    spec.kind === "noise"
      ? new AudioBufferSourceNode(audio, {
          buffer: noiseBuffer(audio),
          loop: true,
          playbackRate: spec.playbackRate ?? 1,
        })
      : new OscillatorNode(audio, {
          type: spec.type ?? "sine",
          frequency: spec.freq ?? 440,
        });
  const gain = new GainNode(audio, {
    gain: spec.gain * clamp(spec.level ?? 0),
  });
  const filter = spec.filter
    ? new BiquadFilterNode(audio, {
        type: spec.filter.type,
        frequency: spec.filter.freq,
        ...(spec.filter.Q !== undefined && { Q: spec.filter.Q }),
      })
    : null;
  const panner =
    spec.pan === undefined
      ? null
      : new StereoPannerNode(audio, { pan: spec.pan });

  (filter ? source.connect(filter) : source).connect(gain);
  (panner ? gain.connect(panner) : gain).connect(master);

  let stopped = false;
  let freed = false;
  const release = () => {
    if (freed) return;
    freed = true;
    loops.delete(halt);
    source.disconnect();
    filter?.disconnect();
    gain.disconnect();
    panner?.disconnect();
  };
  const halt = () => {
    stopped = true;
    try {
      source.stop();
    } catch {
      // Already stopped by a scheduled release.
    }
    release();
  };
  loops.add(halt);
  source.addEventListener("ended", release, { once: true });
  if (source instanceof AudioBufferSourceNode) {
    source.start(audio.currentTime, Math.random() * (noise?.duration ?? 0));
  } else {
    source.start(audio.currentTime);
  }

  return {
    setLevel(level) {
      if (stopped || !Number.isFinite(level)) return;
      gain.gain.setTargetAtTime(
        spec.gain * clamp(level),
        audio.currentTime,
        LOOP_SMOOTHING
      );
    },
    setRate(rate) {
      if (stopped || !Number.isFinite(rate) || rate <= 0) return;
      const param =
        source instanceof AudioBufferSourceNode
          ? source.playbackRate
          : source.frequency;
      const base =
        source instanceof AudioBufferSourceNode
          ? (spec.playbackRate ?? 1)
          : (spec.freq ?? 440);
      param.setTargetAtTime(base * rate, audio.currentTime, LOOP_SMOOTHING);
    },
    stop(fade = LOOP_RELEASE) {
      if (stopped) return;
      stopped = true;
      if (!Number.isFinite(fade) || fade <= 0) {
        halt();
        return;
      }
      const now = audio.currentTime;
      source.stop(now + fade);
      gain.gain.cancelScheduledValues(now);
      gain.gain.setTargetAtTime(0, now, fade / 4);
    },
  };
}
