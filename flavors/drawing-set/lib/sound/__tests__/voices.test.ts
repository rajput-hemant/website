// @vitest-environment jsdom

import { voiceFor, VOICES } from "@/flavors/drawing-set/lib/sound/voices";
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
  it("taps links with the lead and clicks buttons with the clutch", () => {
    const link = mount('<a href="/lab" data-target>Lab</a>');
    expect(voiceFor(link, click)).toBe(VOICES.lead);
    const button = mount("<button data-target>Send</button>");
    expect(voiceFor(button, click)).toBe(VOICES.clutch);
    const cta = mount('<a href="/ask" class="press" data-target>Ask</a>');
    expect(voiceFor(cta, click)).toBe(VOICES.clutch);
  });

  it("reverses the clutch when the click turns a switch off", () => {
    // ClickSound hears the click in the capture phase, before the toggle.
    const off = mount('<span role="switch" aria-checked="false" data-target>');
    expect(voiceFor(off, click)).toBe(VOICES.clutch);
    const on = mount('<span role="switch" aria-checked="true" data-target>');
    expect(voiceFor(on, click)).toBe(VOICES.clutchOff);
  });

  it("clicks a new segmented option, and stays quiet on the chosen one", () => {
    const next = mount('<span role="radio" aria-checked="false" data-target>');
    expect(voiceFor(next, click)).toBe(VOICES.clutch);
    const same = mount('<span role="radio" aria-checked="true" data-target>');
    expect(voiceFor(same, click)).toBeNull();
  });

  it("honours data-voice and keeps the command menu silent", () => {
    const named = mount('<button data-voice="stamp" data-target>');
    expect(voiceFor(named, click)).toBe(VOICES.stamp);
    const none = mount('<button data-voice="none" data-target>');
    expect(voiceFor(none, click)).toBeNull();
    const unknown = mount('<button data-voice="toString" data-target>');
    expect(voiceFor(unknown, click)).toBe(VOICES.clutch);
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
    // The drafting room stays under 0.2 gain.
    expect(voice.gain).toBeGreaterThan(0);
    expect(voice.gain).toBeLessThan(0.2);
    for (const layer of voice.layers) {
      // Exponential ramps need strictly positive endpoints.
      for (const hz of [...layer.freq, ...(layer.filter?.freq ?? [])]) {
        expect(Number.isFinite(hz) && hz > 0).toBe(true);
      }
      expect(layer.gain).toBeGreaterThan(0);
      expect(layer.gain).toBeLessThanOrEqual(1);
      expect(layer.attack).toBeGreaterThan(0);
      expect(layer.decay).toBeGreaterThan(layer.attack);
      expect(layer.decay).toBeLessThanOrEqual(0.2);
    }
  });

  it("keeps the stamp dry and high, clear of Press's 120 to 58Hz stamp", () => {
    const [body] = VOICES.stamp.layers;
    expect(body?.freq).toEqual([220, 140]);
    for (const layer of VOICES.stamp.layers) {
      expect(layer.decay).toBeLessThanOrEqual(0.06);
    }
  });

  it("puts the loud clutch tick first for on and last for off", () => {
    const loudDelay = (voice: Voice) =>
      voice.layers.find((layer) => layer.gain === 1)?.delay;
    expect(loudDelay(VOICES.clutch)).toBe(0);
    expect(loudDelay(VOICES.clutchOff)).toBeCloseTo(0.024);
  });

  it("lands the drawer's stop thump at the end of the runner", () => {
    const [runner, stop] = VOICES.drawer.layers;
    expect(stop?.delay).toBeCloseTo(runner?.decay ?? 0);
    expect(stop?.freq).toEqual([72, 72]);
  });
});
