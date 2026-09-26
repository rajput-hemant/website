import { ScenePoster } from "@/flavors/timetable/components/site/scene-poster";
import { buildNetwork } from "@/flavors/timetable/lib/network";
import { poses, type SceneRoute } from "@/flavors/timetable/lib/scene/poses";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { experience } from "@/content/fallback/experience";

import { NetworkMap } from "../network-map";

describe("network map", () => {
  it("draws every role with finite geometry", () => {
    const html = renderToStaticMarkup(
      <NetworkMap network={buildNetwork(experience, "2026-09-26")} />
    );
    expect(html).not.toMatch(/NaN|Infinity/);
    for (const role of experience) expect(html).toContain(role.company);
    expect(html).toContain("You are here");
  });
});

describe("scene poster", () => {
  it.each(Object.keys(poses) as SceneRoute[])("draws the %s board", (route) => {
    const html = renderToStaticMarkup(<ScenePoster route={route} />);
    expect(html).not.toMatch(/NaN|Infinity/);
  });
});
