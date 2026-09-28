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
let liveSources = 0;
const lastVoice = new WeakMap<Voice, number>();

function getContext(): AudioContext | null {
  if (typeof AudioContext === "undefined") return null;
  if (!context) {
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

export function suspendSound() {
  if (context?.state === "running") void context.suspend();
}

export function playVoice(voice: Voice) {
  if (typeof document !== "undefined" && document.hidden) {
    suspendSound();
    return;
  }
  if (
    !voice.layers.length ||
    liveSources + voice.layers.length > MAX_LIVE_SOURCES
  )
    return;

  const audio = getContext();
  if (!audio || !master) return;

  const now = audio.currentTime;
  if (now - lastStart < MIN_INTERVAL) return;
  if (now - (lastVoice.get(voice) ?? -Infinity) < SAME_VOICE_INTERVAL) return;

  lastStart = now;
  lastVoice.set(voice, now);

  const panner =
    voice.pan === undefined
      ? null
      : new StereoPannerNode(audio, { pan: voice.pan });
  panner?.connect(master);
  const output = panner ?? master;
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
      source = new OscillatorNode(audio, {
        type: layer.type ?? "sine",
        frequency: layer.freq[0],
      });
      source.frequency.setValueAtTime(layer.freq[0], start);
      source.frequency.exponentialRampToValueAtTime(layer.freq[1], end);
    }

    const gain = new GainNode(audio, { gain: SILENCE });
    gain.gain.setValueAtTime(SILENCE, start);
    gain.gain.linearRampToValueAtTime(
      Math.max(SILENCE, voice.gain * layer.gain),
      start + layer.attack
    );
    gain.gain.exponentialRampToValueAtTime(SILENCE, end);

    if (layer.filter) {
      const filter = new BiquadFilterNode(audio, {
        type: layer.filter.type,
        frequency: layer.filter.freq[0],
        Q: layer.filter.Q,
      });
      filter.frequency.setValueAtTime(layer.filter.freq[0], start);
      filter.frequency.exponentialRampToValueAtTime(layer.filter.freq[1], end);
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
    gain.connect(output);
    liveSources++;
    source.addEventListener(
      "ended",
      () => {
        source.disconnect();
        gain.disconnect();
        liveSources--;
        remaining--;
        if (!remaining) panner?.disconnect();
      },
      { once: true }
    );
    source.start(start);
    source.stop(end);
  }
}

export function playTick(variant: TickVariant) {
  playVoice(TICK_VOICES[variant]);
}
