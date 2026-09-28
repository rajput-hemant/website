// @vitest-environment jsdom
import {
  onToggle,
  voiceFor,
  voices,
} from "@/flavors/jacquard/lib/sound/voices";
import { describe, expect, it } from "vitest";

import type { Voice } from "@/lib/sound";

const el = (html: string) => {
  const host = document.createElement("div");
  host.innerHTML = html;
  const first = host.firstElementChild;
  if (!first) throw new Error("no element");
  return first;
};

describe("loom palette", () => {
  it("has six voices, none of them stamp or graphite", () => {
    const names = Object.keys(voices);
    expect(new Set(names.map((n) => n.replace(/Up|Down$/, "")))).toEqual(
      new Set(["shuttle", "heddle", "beater", "card", "bobbin", "snip"])
    );
    expect(names.join(" ")).not.toMatch(/stamp|pencil|graphite/i);
  });

  it("keeps every voice quiet and short", () => {
    const all: Voice[] = Object.values(voices);
    for (const voice of all) {
      expect(voice.gain).toBeLessThanOrEqual(0.12);
      for (const layer of voice.layers) {
        expect((layer.delay ?? 0) + layer.decay).toBeLessThan(0.2);
      }
    }
  });
});

describe("voiceFor", () => {
  it("throws the shuttle for links and lifts a heddle for buttons", () => {
    expect(voiceFor(el('<a href="/">x</a>'))).toBe(voices.shuttle);
    expect(voiceFor(el("<button>x</button>"))).toBe(voices.heddle);
  });

  it("winds the bobbin by the state a switch is leaving", () => {
    expect(
      voiceFor(el('<button role="switch" aria-checked="false"></button>'))
    ).toBe(voices.bobbinUp);
    expect(
      voiceFor(el('<button role="switch" aria-checked="true"></button>'))
    ).toBe(voices.bobbinDown);
  });

  it("plays a named voice, and ignores unknown names", () => {
    expect(voiceFor(el('<button data-voice="beater"></button>'))).toBe(
      voices.beater
    );
    expect(voiceFor(el('<button data-voice="stamp"></button>'))).toBe(
      voices.heddle
    );
  });
});

describe("onToggle", () => {
  it("advances the card on open and snips on close", () => {
    const details = document.createElement("details");
    details.open = true;
    expect(onToggle(details)).toBe(voices.card);
    details.open = false;
    expect(onToggle(details)).toBe(voices.snip);
  });
});
