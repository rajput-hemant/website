// @vitest-environment jsdom
import { voiceFor, voices } from "@/flavors/maquette/lib/sound/voices";
import { describe, expect, it } from "vitest";

const el = (html: string) => {
  const host = document.createElement("div");
  host.innerHTML = html;
  const first = host.firstElementChild;
  if (!first) throw new Error("no element");
  return first;
};

describe("maquette voices", () => {
  it("has six quiet voices and no stamp or pencil", () => {
    expect(Object.keys(voices).sort()).toEqual([
      "card",
      "dowel",
      "knife",
      "lamp",
      "pin",
      "slide",
    ]);
    for (const voice of Object.values(voices)) {
      expect(voice.gain).toBeLessThanOrEqual(0.12);
      expect(voice.layers.length).toBeLessThanOrEqual(2);
    }
  });

  it("maps links, switches and buttons to their voices", () => {
    expect(voiceFor(el('<a href="/x">x</a>'))).toBe(voices.card);
    expect(voiceFor(el('<button role="switch"></button>'))).toBe(voices.lamp);
    expect(voiceFor(el("<button></button>"))).toBe(voices.knife);
  });

  it("lets an element name its voice, and stays silent for an unknown name", () => {
    expect(voiceFor(el('<button data-voice="dowel"></button>'))).toBe(
      voices.dowel
    );
    expect(voiceFor(el('<button data-voice="stamp"></button>'))).toBeNull();
  });
});
