import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { GlyphKind } from "../glyph-posters";
import { SceneGlyph } from "../scene-glyph";

const KINDS: GlyphKind[] = [
  "sheet",
  "stamp",
  "pin",
  "clip",
  "solid",
  "plotter",
  "dial",
];

describe("SceneGlyph", () => {
  it.each(KINDS)("holds its box with a %s poster the view can fade", (kind) => {
    const html = renderToStaticMarkup(<SceneGlyph kind={kind} slot="b" />);
    expect(html).toContain('data-scene-view="glyph-b"');
    expect(html).toContain(`data-glyph="${kind}"`);
    expect(html).toContain("data-scene-poster");
    expect(html).toContain("aria-hidden");
    expect(html).toContain("size-8");
  });

  it("passes the page's data to the view", () => {
    const html = renderToStaticMarkup(
      <SceneGlyph kind="stamp" slot="a" data={{ "data-press": "hover" }} />
    );
    expect(html).toContain('data-press="hover"');
  });
});
