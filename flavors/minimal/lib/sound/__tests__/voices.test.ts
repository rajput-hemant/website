// @vitest-environment jsdom

import {
  playConfirmation,
  voiceFor,
  voiceForToggle,
  VOICES,
} from "@/flavors/minimal/lib/sound/voices";
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
  delete document.documentElement.dataset.theme;
  delete document.documentElement.dataset.sound;
});

describe("voiceFor", () => {
  it("flicks internal links and double-flicks external ones", () => {
    const internal = mount('<a href="/work" data-target>Work</a>');
    expect(voiceFor(internal, click)).toBe(VOICES.flick);
    const blank = mount('<a href="/cv.pdf" target="_blank" data-target>CV</a>');
    expect(voiceFor(blank, click)).toBe(VOICES.flickOut);
    const away = mount('<a href="https://example.com/" data-target>Site</a>');
    expect(voiceFor(away, click)).toBe(VOICES.flickOut);
    const mail = mount('<a href="mailto:a@b.c" data-target>Mail</a>');
    expect(voiceFor(mail, click)).toBe(VOICES.flickOut);
  });

  it("sets a card down for buttons", () => {
    const button = mount("<button data-target>Send</button>");
    expect(voiceFor(button, click)).toBe(VOICES.set);
    const role = mount('<div role="button" data-target>Go</div>');
    expect(voiceFor(role, click)).toBe(VOICES.set);
  });

  it("pitches the switch by the state the click turns it to", () => {
    // ClickSound hears the click in the capture phase, before the toggle.
    const off = mount('<span role="switch" aria-checked="false" data-target>');
    expect(voiceFor(off, click)).toBe(VOICES.setOn);
    const on = mount('<span role="switch" aria-checked="true" data-target>');
    expect(voiceFor(on, click)).toBe(VOICES.setOff);
  });

  it("sets a radio, and stays quiet on the option already chosen", () => {
    const next = mount('<span role="radio" aria-checked="false" data-target>');
    expect(voiceFor(next, click)).toBe(VOICES.set);
    const same = mount('<span role="radio" aria-checked="true" data-target>');
    expect(voiceFor(same, click)).toBeNull();
    const named = mount(
      '<button role="radio" aria-checked="true" data-voice="setDark" data-target>'
    );
    expect(voiceFor(named, click)).toBeNull();
  });

  it("pitches the theme toggle by the theme it turns to", () => {
    const toggle = '<button data-voice="theme" data-target>';
    document.documentElement.dataset.theme = "light";
    expect(voiceFor(mount(toggle), click)).toBe(VOICES.setDark);
    document.documentElement.dataset.theme = "dark";
    expect(voiceFor(mount(toggle), click)).toBe(VOICES.setLight);
    const light = mount(
      '<button role="radio" aria-checked="false" data-voice="setLight" data-target>'
    );
    expect(voiceFor(light, click)).toBe(VOICES.setLight);
  });

  it("honours data-voice and keeps the command menu silent", () => {
    const named = mount('<button data-voice="blot" data-target>');
    expect(voiceFor(named, click)).toBe(VOICES.blot);
    const none = mount('<button data-voice="none" data-target>');
    expect(voiceFor(none, click)).toBeNull();
    const unknown = mount('<button data-voice="stamp" data-target>');
    expect(voiceFor(unknown, click)).toBeNull();
    const menu = mount('<div cmdk-root><a href="/" data-target>Home</a></div>');
    expect(voiceFor(menu, click)).toBeNull();
    const plain = mount("<div data-target>");
    expect(voiceFor(plain, click)).toBeNull();
  });

  it("keeps touch UI clicks silent but lets confirmations through", () => {
    const touch = new PointerEvent("click", { pointerType: "touch" });
    const link = mount('<a href="/work" data-target>Work</a>');
    expect(voiceFor(link, touch)).toBeNull();
    const theme = mount('<button data-voice="theme" data-target>');
    expect(voiceFor(theme, touch)).toBeNull();
    const sent = mount('<button data-voice="sent" data-target>');
    expect(voiceFor(sent, touch)).toBe(VOICES.sent);
  });
});

describe("voiceForToggle", () => {
  it("turns the leaf up on open and down on close", () => {
    const details = document.createElement("details");
    details.open = true;
    expect(voiceForToggle(details)).toBe(VOICES.leafOpen);
    details.open = false;
    expect(voiceForToggle(details)).toBe(VOICES.leafClose);
  });
});

describe("playConfirmation", () => {
  it("does nothing while sound is off", () => {
    expect(playConfirmation("blot")).toBe(false);
  });
});

describe("recipes", () => {
  const entries: [string, Voice][] = Object.entries(VOICES);

  it.each(entries)("%s is a quiet, short, playable voice", (_name, voice) => {
    expect(voice.layers.length).toBeGreaterThan(0);
    // The engine allows at most 4 live click sources.
    expect(voice.layers.length).toBeLessThanOrEqual(4);
    expect(voice.gain).toBeGreaterThan(0);
    // Paper and nib: every voice at gain 0.07 or less (audit 2.2).
    expect(voice.gain).toBeLessThanOrEqual(0.07);
    for (const layer of voice.layers) {
      // Exponential ramps need strictly positive endpoints.
      for (const hz of [...layer.freq, ...(layer.filter?.freq ?? [])]) {
        expect(Number.isFinite(hz) && hz > 0).toBe(true);
      }
      expect(layer.gain).toBeGreaterThan(0);
      expect(layer.gain).toBeLessThanOrEqual(1);
      expect(layer.attack).toBeGreaterThan(0);
      expect(layer.decay).toBeGreaterThan(layer.attack);
      expect(layer.decay).toBeLessThanOrEqual(0.25);
      expect((layer.delay ?? 0) + layer.decay).toBeLessThanOrEqual(0.35);
    }
  });

  it("follows the audit's dedupe recipes for flick and blot", () => {
    expect(VOICES.flick.gain).toBe(0.03);
    expect(VOICES.flick.layers[0]?.filter).toMatchObject({
      type: "highpass",
      freq: [5000, 5000],
    });
    expect(VOICES.flick.layers[0]?.decay).toBe(0.008);
    const [body, felt] = VOICES.blot.layers;
    expect(body?.freq).toEqual([140, 90]);
    expect(felt?.filter).toMatchObject({ type: "lowpass", freq: [600, 600] });
    expect(felt?.decay).toBe(0.04);
  });

  it("encodes on/off and light/dark by pitch", () => {
    const body = (voice: Voice) =>
      voice.layers.find((layer) => layer.kind === "osc")?.freq[0] ?? 0;
    expect(body(VOICES.setOn)).toBeGreaterThan(body(VOICES.setOff));
    expect(body(VOICES.setLight)).toBeGreaterThan(body(VOICES.setDark));
    const sweep = (voice: Voice) => voice.layers[0]?.filter?.freq ?? [0, 0];
    const [openFrom, openTo] = sweep(VOICES.leafOpen);
    const [closeFrom, closeTo] = sweep(VOICES.leafClose);
    expect(openTo).toBeGreaterThan(openFrom);
    expect(closeTo).toBeLessThan(closeFrom);
  });
});
