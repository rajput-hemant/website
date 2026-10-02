// @vitest-environment jsdom
import * as React from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { SiteIdentity } from "@/lib/data/identity";

import { SiteIdentityProvider, useSiteIdentity } from "../site-identity";

const identity: SiteIdentity = {
  name: "Ada Lovelace",
  firstName: "Ada",
  shortName: "ada",
  handle: "ada-lovelace",
  initials: "AL",
  description: "Analyst",
  url: "https://example.com",
  locale: "en_US",
};

function Initials() {
  return <span>{useSiteIdentity().initials}</span>;
}

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

afterEach(() => {
  document.body.replaceChildren();
});

describe("useSiteIdentity", () => {
  it("reaches a separate React root, as a 3D scene's world is", () => {
    const page = document.createElement("div");
    const scene = document.createElement("div");
    document.body.append(page, scene);

    React.act(() => {
      createRoot(page).render(
        <SiteIdentityProvider identity={identity}>
          <p>page</p>
        </SiteIdentityProvider>
      );
    });
    React.act(() => {
      createRoot(scene).render(<Initials />);
    });

    expect(scene.textContent).toBe("AL");
  });

  it("personalizes ExperimentStage aria-label to reflect configured identity", async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));

    const { ExperimentStage } =
      await import("@/flavors/minimal/components/lab/experiment-stage");
    const { labExperiments } = await import("@/content/lab");
    const exp = labExperiments[0];

    const container = document.createElement("div");
    document.body.append(container);

    React.act(() => {
      createRoot(container).render(
        <SiteIdentityProvider identity={identity}>
          <ExperimentStage slug={exp.slug} label={exp.label} hint={exp.hint} />
        </SiteIdentityProvider>
      );
    });

    const img = container.querySelector('[role="img"]');
    const label = img?.getAttribute("aria-label") ?? "";
    expect(label).toContain("ada");
    expect(label).not.toContain("hemant");
  });
});
