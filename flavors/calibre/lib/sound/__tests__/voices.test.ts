// @vitest-environment jsdom
import { voiceFor, voices } from "@/flavors/calibre/lib/sound/voices";
import { describe, expect, it } from "vitest";

const el = (html: string) => {
  const host = document.createElement("div");
  host.innerHTML = html;
  const first = host.firstElementChild;
  if (!first) throw new Error("no element");
  return first;
};

describe("calibre voices", () => {
  it("has six quiet voices and no stamp or pencil", () => {
    expect(Object.keys(voices).sort()).toEqual([
      "caseback",
      "crown",
      "detent",
      "ratchet",
      "repeater",
      "tick",
    ]);
    for (const voice of Object.values(voices)) {
      expect(voice.gain).toBeLessThanOrEqual(0.12);
      expect(voice.layers.length).toBeLessThanOrEqual(2);
    }
  });

  it("maps links, switches and buttons to their voices", () => {
    expect(voiceFor(el('<a href="/x">x</a>'))).toBe(voices.tick);
    expect(voiceFor(el('<button role="switch"></button>'))).toBe(voices.detent);
    expect(voiceFor(el("<button></button>"))).toBe(voices.crown);
  });

  it("lets an element name its voice, and stays silent for an unknown name", () => {
    expect(voiceFor(el('<button data-voice="repeater"></button>'))).toBe(
      voices.repeater
    );
    expect(voiceFor(el('<button data-voice="stamp"></button>'))).toBeNull();
  });
});
