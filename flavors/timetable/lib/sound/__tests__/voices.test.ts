// @vitest-environment jsdom

import {
  ringDetune,
  voiceFor,
  VOICES,
} from "@/flavors/timetable/lib/sound/voices";
import { afterEach, describe, expect, it } from "vitest";

import type { Voice } from "@/lib/sound";

const click = new MouseEvent("click", { detail: 1 });

function mount(html: string): Element {
  document.body.innerHTML = html;
  const el = document.querySelector("[data-target]");
  if (!el) throw new Error("no [data-target] in fixture");
  return el;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("voiceFor", () => {
  it("plays the relay in the direction the click turns the switch", () => {
    // ClickSound hears the click in the capture phase, before the toggle.
    const off = mount('<span role="switch" aria-checked="false" data-target>');
    expect(voiceFor(off, click)).toBe(VOICES.relayOn);
    const on = mount('<span role="switch" aria-checked="true" data-target>');
    expect(voiceFor(on, click)).toBe(VOICES.relayOff);
  });

  it("turns a radio on, and stays quiet on the option already chosen", () => {
    const next = mount('<span role="radio" aria-checked="false" data-target>');
    expect(voiceFor(next, click)).toBe(VOICES.relayOn);
    const same = mount('<span role="radio" aria-checked="true" data-target>');
    expect(voiceFor(same, click)).toBeNull();
  });

  it("taps platforms fully, other links softly, and clunks buttons", () => {
    const platform = mount(
      '<a href="/work" data-scene-item="platform:/work" data-target>Work</a>'
    );
    expect(voiceFor(platform, click)).toBe(VOICES.tap);
    const link = mount('<a href="/lab" data-target>Lab</a>');
    expect(voiceFor(link, click)).toBe(VOICES.softTap);
    expect(VOICES.softTap.gain).toBeCloseTo(VOICES.tap.gain * 0.6);
    const button = mount("<button data-target>Send</button>");
    expect(voiceFor(button, click)).toBe(VOICES.clunk);
    const cta = mount('<a href="/ask" class="press" data-target>Ask</a>');
    expect(voiceFor(cta, click)).toBe(VOICES.clunk);
  });

  it("honours data-voice and keeps the command menu silent", () => {
    const named = mount('<button data-voice="chime" data-target>');
    expect(voiceFor(named, click)).toBe(VOICES.chime);
    const none = mount('<button data-voice="none" data-target>');
    expect(voiceFor(none, click)).toBeNull();
    const unknown = mount('<button data-voice="nope" data-target>');
    expect(voiceFor(unknown, click)).toBe(VOICES.clunk);
    const menu = mount('<div cmdk-root><a href="/" data-target>Home</a></div>');
    expect(voiceFor(menu, click)).toBeNull();
    const plain = mount("<div data-target>");
    expect(voiceFor(plain, click)).toBeNull();
  });
});

describe("recipes", () => {
  const entries: [string, Voice][] = Object.entries(VOICES);

  it.each(entries)("%s is a playable voice", (_name, voice) => {
    expect(voice.layers.length).toBeGreaterThan(0);
    // The engine allows at most 4 live click sources.
    expect(voice.layers.length).toBeLessThanOrEqual(4);
    expect(voice.gain).toBeGreaterThan(0);
    expect(voice.gain).toBeLessThanOrEqual(0.12);
    for (const layer of voice.layers) {
      // Exponential ramps need strictly positive endpoints.
      for (const hz of [...layer.freq, ...(layer.filter?.freq ?? [])]) {
        expect(Number.isFinite(hz) && hz > 0).toBe(true);
      }
      expect(layer.gain).toBeGreaterThan(0);
      expect(layer.gain).toBeLessThanOrEqual(1);
      expect(layer.attack).toBeGreaterThan(0);
      expect(layer.decay).toBeGreaterThan(layer.attack);
      expect(layer.decay).toBeLessThanOrEqual(0.5);
    }
  });

  it("orders the relay up for on and down for off", () => {
    const pitches = (voice: Voice) => voice.layers.map((l) => l.freq[0]);
    expect(pitches(VOICES.relayOn)).toEqual([1400, 1700]);
    expect(pitches(VOICES.relayOff)).toEqual([1700, 1400]);
  });
});

describe("ringDetune", () => {
  it("rings only past 60px and scales pitch by release speed", () => {
    expect(ringDetune(60, 5)).toBeNull();
    expect(ringDetune(-40, 5)).toBeNull();
    expect(ringDetune(80, 0)).toBeCloseTo(0.9);
    expect(ringDetune(-80, -1)).toBeCloseTo(1);
    expect(ringDetune(200, 9)).toBeCloseTo(1.1);
  });
});
