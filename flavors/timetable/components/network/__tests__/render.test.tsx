import { ScenePoster } from "@/flavors/timetable/components/site/scene-poster";
import { buildNetwork } from "@/flavors/timetable/lib/network";
import { poses, type SceneRoute } from "@/flavors/timetable/lib/scene/poses";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { experience } from "@/content/fallback/experience";
import { site } from "@/content/site";
import { deriveSiteIdentity } from "@/lib/data/identity";
import { SiteIdentityProvider } from "@/components/semantic/identity/site-identity";

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

const ada = deriveSiteIdentity({
  name: "Ada Lovelace",
  headline: "",
  links: [],
});

describe("scene poster", () => {
  it.each(Object.keys(poses) as SceneRoute[])("draws the %s board", (route) => {
    const html = renderToStaticMarkup(
      <SiteIdentityProvider identity={ada}>
        <ScenePoster route={route} />
      </SiteIdentityProvider>
    );
    expect(html).not.toMatch(/NaN|Infinity/);
  });

  it("plates the resolved handle, never the configured one", () => {
    const html = renderToStaticMarkup(
      <SiteIdentityProvider identity={ada}>
        <ScenePoster route="home" />
      </SiteIdentityProvider>
    );
    expect(html).toContain("ADA-LOVELACE");
    expect(html).not.toContain(site.handle.toUpperCase());
  });
});
