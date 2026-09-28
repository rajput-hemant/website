import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Voice } from "../sound";

const sources: MockSource[] = [];
const contexts: MockAudioContext[] = [];
const compressors: MockNode[] = [];
const panners: MockNode[] = [];

class MockNode extends EventTarget {
  connections: MockNode[] = [];
  disconnect = vi.fn();

  connect(node: MockNode) {
    this.connections.push(node);
    return node;
  }
}

class MockSource extends MockNode {
  frequency = {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
  start = vi.fn();
  stop = vi.fn();

  constructor() {
    super();
    sources.push(this);
  }
}

class MockGain extends MockNode {
  gain = {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
}

class MockFilter extends MockNode {
  frequency = {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
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
  vi.stubGlobal("document", new MockDocument());
  vi.stubGlobal("AudioContext", MockAudioContext);
  vi.stubGlobal("GainNode", MockGain);
  vi.stubGlobal("OscillatorNode", MockSource);
  vi.stubGlobal("AudioBufferSourceNode", MockSource);
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
});
