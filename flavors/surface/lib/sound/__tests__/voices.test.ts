// @vitest-environment jsdom

import { voiceFor, VOICES } from "@/flavors/surface/lib/sound/voices";
import { afterEach, describe, expect, it } from "vitest";

import type { Voice } from "@/lib/sound";

const click = new MouseEvent("click", { detail: 1 });
const keyboard = new MouseEvent("click", { detail: 0 });

function mount(html: string): Element {
  document.body.innerHTML = html;
  const el = document.querySelector("[data-target]");
  if (!el) throw new Error("no [data-target] in fixture");
  return el;
}

afterEach(() => {
  document.body.innerHTML = "";
  delete document.documentElement.dataset.motion;
});

describe("voiceFor", () => {
  it("slides switches, and latches only with motion off", () => {
    const off = mount(
      '<button role="switch" aria-checked="false" data-target>'
    );
    expect(voiceFor(off, click)).toBe(VOICES.slide);
    const named = mount(
      '<button role="switch" data-voice="slide" data-target>'
    );
    expect(voiceFor(named, click)).toBe(VOICES.slide);
    document.documentElement.dataset.motion = "off";
    expect(voiceFor(off, click)).toBe(VOICES.latch);
    expect(voiceFor(named, click)).toBe(VOICES.latch);
  });

  it("latches a new radio option and stays quiet on the chosen one", () => {
    const next = mount('<span role="radio" aria-checked="false" data-target>');
    expect(voiceFor(next, click)).toBe(VOICES.latch);
    const same = mount('<span role="radio" aria-checked="true" data-target>');
    expect(voiceFor(same, click)).toBeNull();
  });

  it("leaves pointer presses on links and keys to the key leaves", () => {
    const link = mount('<a href="/lab" data-target>Lab</a>');
    expect(voiceFor(link, click)).toBeNull();
    const key = mount('<button class="key" data-target>Send</button>');
    expect(voiceFor(key, click)).toBeNull();
    // A keyboard press has no pointer events, so the down leaf plays here.
    expect(voiceFor(key, keyboard)).toBe(VOICES.keyDown);
    const plain = mount("<button data-target>Close</button>");
    expect(voiceFor(plain, click)).toBe(VOICES.keyDown);
  });

  it("pulls the relay for a channel change, not for the current channel", () => {
    const other = mount(
      '<a href="/work" class="key" data-channel="1" data-target>'
    );
    expect(voiceFor(other, click)).toBe(VOICES.relay);
    const current = mount(
      '<a href="/" class="key" data-channel="0" aria-current="page" data-target>'
    );
    expect(voiceFor(current, click)).toBeNull();
  });

  it("honours data-voice and keeps the command menu silent", () => {
    const named = mount('<button data-voice="confirm" data-target>');
    expect(voiceFor(named, click)).toBe(VOICES.confirm);
    const none = mount('<button role="switch" data-voice="none" data-target>');
    expect(voiceFor(none, click)).toBeNull();
    const unknown = mount('<button data-voice="nope" data-target>');
    expect(voiceFor(unknown, click)).toBe(VOICES.keyDown);
    const inherited = mount('<button data-voice="toString" data-target>');
    expect(voiceFor(inherited, click)).toBe(VOICES.keyDown);
    const menu = mount(
      '<div cmdk-root><button data-voice="slide" data-target></button></div>'
    );
    expect(voiceFor(menu, keyboard)).toBeNull();
    const nothing = mount("<div data-target>");
    expect(voiceFor(nothing, click)).toBeNull();
  });
});

describe("recipes", () => {
  const entries: [string, Voice][] = Object.entries(VOICES);

  it.each(entries)("%s is a playable voice", (_name, voice) => {
    expect(voice.layers.length).toBeGreaterThan(0);
    // The engine allows at most 4 live click sources.
    expect(voice.layers.length).toBeLessThanOrEqual(4);
    expect(voice.gain).toBeGreaterThan(0);
    // Below 0.15 peak, so it sits under speech (audit appendix C §5).
    expect(voice.gain).toBeLessThan(0.15);
    for (const layer of voice.layers) {
      // Exponential ramps need strictly positive endpoints.
      for (const hz of [...layer.freq, ...(layer.filter?.freq ?? [])]) {
        expect(Number.isFinite(hz) && hz > 0).toBe(true);
      }
      expect(layer.gain).toBeGreaterThan(0);
      expect(layer.gain).toBeLessThanOrEqual(1);
      expect(layer.attack).toBeGreaterThan(0);
      expect(layer.decay).toBeGreaterThan(layer.attack);
      expect((layer.delay ?? 0) + layer.decay).toBeLessThanOrEqual(0.2);
    }
  });

  it("lands the slide's latch on the thumb's overshoot, 110ms in", () => {
    expect(VOICES.slide.layers.at(-1)?.delay).toBe(0.11);
    expect(VOICES.latch.layers).toHaveLength(1);
  });

  it("beeps up for OK and twice low for an alarm", () => {
    const pitches = (voice: Voice) => voice.layers.map((l) => l.freq[0]);
    expect(pitches(VOICES.confirm)).toEqual([1318, 1760]);
    expect(pitches(VOICES.alarm)).toEqual([440, 440]);
    for (const layer of [...VOICES.confirm.layers, ...VOICES.alarm.layers]) {
      expect(layer.type).toBe("square");
    }
  });
});
