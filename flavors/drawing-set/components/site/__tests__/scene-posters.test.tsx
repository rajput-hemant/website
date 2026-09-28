import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ScenePoster } from "../scene-posters";

describe("ScenePoster home", () => {
  it("draws only the partly open chest, without the side table ensemble", () => {
    const html = renderToStaticMarkup(<ScenePoster route="home" />);
    expect(html.match(/<polygon/g)?.length).toBe(66);
  });
});
