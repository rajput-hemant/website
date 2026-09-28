// @vitest-environment jsdom
import { onToggle, voiceFor, voices } from "@/flavors/mission/lib/sound/voices";
import { describe, expect, it } from "vitest";

import type { Voice } from "@/lib/sound";

const el = (html: string) => {
  const host = document.createElement("div");
  host.innerHTML = html;
  const first = host.firstElementChild;
  if (!first) throw new Error("no element");
  return first;
};

describe("console palette", () => {
  it("has six voices, none of them stamp or graphite", () => {
    const names = Object.keys(voices);
    expect(new Set(names.map((n) => n.replace(/Up|Down$/, "")))).toEqual(
      new Set(["key", "latch", "quindar", "hatch", "seal", "toggle"])
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
  it("keys links and latches buttons", () => {
    expect(voiceFor(el('<a href="/">x</a>'))).toBe(voices.key);
    expect(voiceFor(el("<button>x</button>"))).toBe(voices.latch);
  });

  it("throws a toggle by the state a switch is leaving", () => {
    expect(
      voiceFor(el('<button role="switch" aria-checked="false"></button>'))
    ).toBe(voices.toggleUp);
    expect(
      voiceFor(el('<button role="switch" aria-checked="true"></button>'))
    ).toBe(voices.toggleDown);
  });

  it("plays a named voice, and ignores unknown names", () => {
    expect(voiceFor(el('<button data-voice="quindar"></button>'))).toBe(
      voices.quindar
    );
    expect(voiceFor(el('<button data-voice="stamp"></button>'))).toBe(
      voices.latch
    );
  });
});

describe("onToggle", () => {
  it("unseals the hatch on open and seals it on close", () => {
    const details = document.createElement("details");
    details.open = true;
    expect(onToggle(details)).toBe(voices.hatch);
    details.open = false;
    expect(onToggle(details)).toBe(voices.seal);
  });
});
