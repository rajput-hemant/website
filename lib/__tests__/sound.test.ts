import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Voice } from "../sound";

const sources: MockSource[] = [];
const contexts: MockAudioContext[] = [];
const compressors: MockNode[] = [];
const panners: MockNode[] = [];
const gains: MockGain[] = [];
const filters: MockFilter[] = [];

class MockNode extends EventTarget {
  connections: MockNode[] = [];
  disconnect = vi.fn();

  connect(node: MockNode) {
    this.connections.push(node);
    return node;
  }
}

type Automation = (value: number, time: number) => void;

function param() {
  return {
    setValueAtTime: vi.fn<Automation>(),
    linearRampToValueAtTime: vi.fn<Automation>(),
    exponentialRampToValueAtTime: vi.fn<Automation>(),
    setTargetAtTime:
      vi.fn<(value: number, time: number, tau: number) => void>(),
    cancelScheduledValues: vi.fn<(time: number) => void>(),
  };
}

class MockSource extends MockNode {
  frequency = param();
  playbackRate = param();
  start = vi.fn();
  stop = vi.fn();

  constructor() {
    super();
    sources.push(this);
  }
}

class MockOscillator extends MockSource {}

class MockBufferSource extends MockSource {
  buffer: unknown;

  constructor(_context: unknown, options: { buffer?: unknown } = {}) {
    super();
    this.buffer = options.buffer;
  }
}

class MockGain extends MockNode {
  gain = param();

  constructor() {
    super();
    gains.push(this);
  }
}

class MockFilter extends MockNode {
  frequency = param();

  constructor() {
    super();
    filters.push(this);
  }
}

class MockDocument extends EventTarget {
  hidden = false;
}

class MockAudioContext {
  currentTime = 0;
  sampleRate = 48000;
  state = "running";
  destination = new MockNode();
  resume = vi.fn(() => {
    this.state = "running";
    return Promise.resolve();
  });
  suspend = vi.fn(() => {
    this.state = "suspended";
    return Promise.resolve();
  });
  createBuffer = vi.fn(() => ({
    duration: 1,
    getChannelData: () => new Float32Array(48000),
  }));

  constructor() {
    contexts.push(this);
  }
}

beforeEach(() => {
  vi.resetModules();
  sources.length = 0;
  contexts.length = 0;
  compressors.length = 0;
  panners.length = 0;
  gains.length = 0;
  filters.length = 0;
  vi.stubGlobal("document", new MockDocument());
  vi.stubGlobal("AudioContext", MockAudioContext);
  vi.stubGlobal("GainNode", MockGain);
  vi.stubGlobal("OscillatorNode", MockOscillator);
  vi.stubGlobal("AudioBufferSourceNode", MockBufferSource);
  vi.stubGlobal("BiquadFilterNode", MockFilter);
  vi.stubGlobal(
    "StereoPannerNode",
    class extends MockNode {
      constructor() {
        super();
        panners.push(this);
      }
    }
  );
  vi.stubGlobal(
    "DynamicsCompressorNode",
    class extends MockNode {
      constructor() {
        super();
        compressors.push(this);
      }
    }
  );
});

describe("sound engine", () => {
  it("keeps tick playback lazy and routes it through one compressor", async () => {
    const { playTick } = await import("../sound");
    expect(contexts).toHaveLength(0);

    playTick("link");
    expect(contexts).toHaveLength(1);
    expect(compressors).toHaveLength(1);
    expect(compressors[0]?.connections).toContain(contexts[0]?.destination);
    expect(sources[0]?.frequency.setValueAtTime).toHaveBeenCalledWith(2200, 0);
    expect(
      sources[0]?.frequency.exponentialRampToValueAtTime
    ).toHaveBeenCalledWith(1320, 0.03);
  });

  it("limits repeated voices and at most four live sources", async () => {
    const { playVoice, TICK_VOICES } = await import("../sound");

    playVoice(TICK_VOICES.link);
    contexts[0]!.currentTime = 0.05;
    playVoice(TICK_VOICES.link);
    expect(sources).toHaveLength(1);

    for (let index = 0; index < 3; index++) {
      contexts[0]!.currentTime += 0.05;
      playVoice({ ...TICK_VOICES.button });
    }
    expect(sources).toHaveLength(4);

    contexts[0]!.currentTime += 0.05;
    playVoice({ ...TICK_VOICES.button });
    expect(sources).toHaveLength(4);

    sources[0]?.dispatchEvent(new Event("ended"));
    playVoice({ ...TICK_VOICES.button });
    expect(sources).toHaveLength(5);
  });

  it("suspends on hide and skips playback while hidden", async () => {
    const { playTick } = await import("../sound");
    playTick("button");

    const page = document;
    Object.defineProperty(page, "hidden", { value: true, configurable: true });
    page.dispatchEvent(new Event("visibilitychange"));
    expect(contexts[0]?.suspend).toHaveBeenCalledOnce();

    playTick("link");
    expect(sources).toHaveLength(1);
    expect(contexts[0]?.resume).not.toHaveBeenCalled();
  });

  it("shares the noise buffer and routes a panned voice through the panner", async () => {
    const { playVoice } = await import("../sound");
    const noiseVoice: Voice = {
      gain: 0.1,
      pan: -0.5,
      layers: [
        {
          kind: "noise",
          freq: [1, 1],
          attack: 0.002,
          decay: 0.03,
          gain: 1,
        },
      ],
    };

    playVoice(noiseVoice);
    expect(contexts[0]?.createBuffer).toHaveBeenCalledOnce();
    expect(sources[0]?.connections[0]?.connections).toContain(panners[0]);

    contexts[0]!.currentTime = 0.1;
    sources[0]?.dispatchEvent(new Event("ended"));
    playVoice(noiseVoice);
    expect(contexts[0]?.createBuffer).toHaveBeenCalledOnce();
  });

  const grain: Voice = {
    gain: 0.035,
    layers: [
      {
        kind: "noise",
        freq: [1, 1],
        filter: { type: "bandpass", freq: [3200, 3200], Q: 3.5 },
        attack: 0.001,
        decay: 0.005,
        gain: 1,
      },
    ],
  };

  it("applies per-play gain, detune and delay and reports drops", async () => {
    const { playVoice } = await import("../sound");
    const voice: Voice = {
      gain: 0.2,
      layers: [
        {
          kind: "osc",
          freq: [1000, 500],
          filter: { type: "lowpass", freq: [2000, 1000] },
          attack: 0.002,
          decay: 0.05,
          gain: 0.5,
        },
      ],
    };

    expect(playVoice(voice, { gain: 0.5, detune: 2, delay: 0.1 })).toBe(true);
    const source = sources[0];
    expect(source?.frequency.setValueAtTime).toHaveBeenCalledWith(2000, 0.1);
    const [to, end] = source?.frequency.exponentialRampToValueAtTime.mock
      .calls[0] ?? [0, 0];
    expect(to).toBe(1000);
    expect(end).toBeCloseTo(0.15);
    expect(filters[0]?.frequency.setValueAtTime).toHaveBeenCalledWith(
      4000,
      0.1
    );
    const [peak, attackEnd] = gains[1]?.gain.linearRampToValueAtTime.mock
      .calls[0] ?? [0, 0];
    expect(peak).toBeCloseTo(0.05);
    expect(attackEnd).toBeCloseTo(0.102);
    expect(source?.start).toHaveBeenCalledWith(0.1);
    expect(playVoice(voice)).toBe(false);
  });

  it("keeps grains on their own budget, apart from the click limiter", async () => {
    const { createGrainPool, playVoice, TICK_VOICES } =
      await import("../sound");
    const pool = createGrainPool({
      maxPerSecond: 40,
      minGap: 0.016,
      maxPerBurst: 3,
    });

    playVoice({ ...TICK_VOICES.button });
    const audio = contexts[0];
    if (!audio) throw new Error("no context");
    for (let index = 0; index < 3; index++) {
      audio.currentTime += 0.05;
      playVoice({ ...TICK_VOICES.button });
    }
    expect(sources).toHaveLength(4);
    expect(pool.play(grain)).toBe(true);
    expect(sources[4]?.start.mock.calls[0]).toHaveLength(2);

    audio.currentTime += 0.05;
    expect(pool.play(grain)).toBe(true);
    expect(pool.play(grain)).toBe(false);
    expect(pool.play(grain, { delay: 0.02 })).toBe(true);
    expect(pool.play(grain, { delay: 0.04 })).toBe(true);
    expect(pool.play(grain, { delay: 0.06 })).toBe(false);

    audio.currentTime += 0.05;
    expect(playVoice({ ...TICK_VOICES.link })).toBe(false);
    sources[0]?.dispatchEvent(new Event("ended"));
    expect(playVoice({ ...TICK_VOICES.link })).toBe(true);
  });

  it("caps grains per second and live grains per pool", async () => {
    const { createGrainPool } = await import("../sound");
    const dense = createGrainPool({
      maxPerSecond: 40,
      minGap: 0.016,
      maxLive: 1000,
    });
    let played = 0;
    for (let index = 0; index < 50; index++) {
      if (dense.play(grain)) played++;
      const audio = contexts[0];
      if (audio) audio.currentTime += 0.02;
    }
    expect(played).toBe(40);

    const capped = createGrainPool({
      maxPerSecond: 40,
      minGap: 0.016,
      maxLive: 2,
    });
    const before = sources.length;
    const audio = contexts[0];
    if (!audio) throw new Error("no context");
    for (let index = 0; index < 3; index++) {
      audio.currentTime += 0.02;
      capped.play(grain);
    }
    expect(sources.length - before).toBe(2);
    sources[before]?.dispatchEvent(new Event("ended"));
    audio.currentTime += 0.02;
    expect(capped.play(grain)).toBe(true);
  });

  it("drives a loop level and rate and frees every node on stop", async () => {
    const { startLoop } = await import("../sound");
    const loop = startLoop({
      kind: "noise",
      filter: { type: "lowpass", freq: 2800 },
      gain: 0.05,
      playbackRate: 1,
    });
    const source = sources[0];
    const gain = gains[1];
    const filter = filters[0];
    expect(gain?.connections).toContain(gains[0]);

    loop.setLevel(0.5);
    expect(gain?.gain.setTargetAtTime).toHaveBeenCalledWith(0.025, 0, 0.03);
    loop.setLevel(4);
    expect(gain?.gain.setTargetAtTime).toHaveBeenLastCalledWith(0.05, 0, 0.03);
    loop.setRate(1.1);
    expect(source?.playbackRate.setTargetAtTime).toHaveBeenCalledWith(
      1.1,
      0,
      0.03
    );

    loop.stop();
    expect(source?.stop).toHaveBeenCalledWith(0.06);
    loop.setLevel(1);
    expect(gain?.gain.setTargetAtTime).toHaveBeenCalledTimes(3);
    source?.dispatchEvent(new Event("ended"));
    expect(source?.disconnect).toHaveBeenCalledOnce();
    expect(filter?.disconnect).toHaveBeenCalledOnce();
    expect(gain?.disconnect).toHaveBeenCalledOnce();

    const second = startLoop({ kind: "osc", freq: 200, gain: 0.1 });
    const third = startLoop({ kind: "osc", freq: 300, gain: 0.1 });
    second.setRate(2);
    expect(sources[1]?.frequency.setTargetAtTime).toHaveBeenCalledWith(
      400,
      0,
      0.03
    );
    second.stop(0);
    expect(sources[1]?.disconnect).toHaveBeenCalledOnce();
    expect(sources[2]?.disconnect).not.toHaveBeenCalled();
    third.stop(0);
  });

  it("blocks grains and stops loops when hidden or muted", async () => {
    const { createGrainPool, startLoop, suspendSound } =
      await import("../sound");
    const pool = createGrainPool({ maxPerSecond: 40, minGap: 0.016 });
    startLoop({ kind: "noise", gain: 0.05 });
    const muted = sources[0];
    suspendSound();
    expect(muted?.stop).toHaveBeenCalled();
    expect(muted?.disconnect).toHaveBeenCalledOnce();

    startLoop({ kind: "noise", gain: 0.05 });
    const live = sources[1];
    Object.defineProperty(document, "hidden", {
      value: true,
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(live?.disconnect).toHaveBeenCalledOnce();
    live?.dispatchEvent(new Event("ended"));
    expect(live?.disconnect).toHaveBeenCalledOnce();

    expect(pool.play(grain)).toBe(false);
    const handle = startLoop({ kind: "noise", gain: 0.05 });
    expect(sources).toHaveLength(2);
    handle.setLevel(1);
    handle.stop();
  });

  it("reads the sound preference from <html>", async () => {
    const { isSoundOn } = await import("../sound");
    Object.defineProperty(document, "documentElement", {
      value: { dataset: { sound: "off" } },
      configurable: true,
    });
    expect(isSoundOn()).toBe(false);
    Object.defineProperty(document, "documentElement", {
      value: { dataset: { sound: "on" } },
      configurable: true,
    });
    expect(isSoundOn()).toBe(true);
  });

  it("marks the audio session ambient where the API exists", async () => {
    const audioSession = { type: "auto" };
    vi.stubGlobal("navigator", { audioSession });
    const { playTick } = await import("../sound");
    playTick("link");
    expect(audioSession.type).toBe("ambient");
  });
  it("caps out-of-order delayed grains within any one-second window", async () => {
    const { createGrainPool } = await import("../sound");
    const pool = createGrainPool({ maxPerSecond: 3, minGap: 0.01 });
    expect(pool.play(grain, { delay: 0.9 })).toBe(true);
    expect(pool.play(grain)).toBe(true);
    expect(pool.play(grain, { delay: 0.05 })).toBe(true);
    expect(pool.play(grain, { delay: 0.1 })).toBe(false);
  });

  it("replaces non-finite play options instead of throwing", async () => {
    const { createGrainPool, playVoice, TICK_VOICES } =
      await import("../sound");
    expect(
      playVoice(
        { ...TICK_VOICES.button },
        { gain: Number.NaN, detune: 0, delay: Infinity }
      )
    ).toBe(true);
    const source = sources[0];
    expect(source?.frequency.setValueAtTime).toHaveBeenCalledWith(1500, 0);
    expect(source?.start).toHaveBeenCalledWith(0);
    const [peak] = gains[1]?.gain.linearRampToValueAtTime.mock.calls[0] ?? [0];
    expect(peak).toBeCloseTo(0.15);

    const pool = createGrainPool({ maxPerSecond: 1, minGap: 0.01 });
    expect(pool.play(grain, { delay: Number.NaN })).toBe(true);
    expect(pool.play(grain, { delay: 0.5 })).toBe(false);
  });

  it("ignores non-finite loop levels, rates and releases", async () => {
    const { startLoop } = await import("../sound");
    const loop = startLoop({ kind: "noise", gain: 0.05 });
    const source = sources[0];
    const gain = gains[1];
    loop.setLevel(Number.NaN);
    loop.setRate(Infinity);
    expect(gain?.gain.setTargetAtTime).not.toHaveBeenCalled();
    expect(source?.playbackRate.setTargetAtTime).not.toHaveBeenCalled();
    loop.stop(Number.NaN);
    expect(source?.stop).toHaveBeenCalled();
    expect(source?.disconnect).toHaveBeenCalledOnce();
  });

  it("resumes a muted context before checking the live budget", async () => {
    const { playVoice, suspendSound, TICK_VOICES } = await import("../sound");
    playVoice({ ...TICK_VOICES.button }, { delay: 1 });
    const audio = contexts[0];
    if (!audio) throw new Error("no context");
    for (let index = 0; index < 3; index++) {
      audio.currentTime += 0.1;
      playVoice({ ...TICK_VOICES.button }, { delay: 1 });
    }
    suspendSound();
    expect(audio.state).toBe("suspended");
    audio.currentTime += 0.1;
    expect(playVoice({ ...TICK_VOICES.link })).toBe(false);
    expect(audio.resume).toHaveBeenCalled();
  });
});
