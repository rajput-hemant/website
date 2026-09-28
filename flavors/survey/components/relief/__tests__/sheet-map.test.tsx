// @vitest-environment jsdom
import { SheetMap } from "@/flavors/survey/components/relief/sheet-map";
import { buildRelief } from "@/flavors/survey/lib/relief";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { experience } from "@/content/fallback/experience";
import { projects } from "@/content/fallback/projects";

// The scene loader asks for the router; nothing here navigates.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
}));

const relief = buildRelief(experience, projects, new Date(2026, 8, 20));

describe("SheetMap sites", () => {
  document.body.innerHTML = renderToStaticMarkup(
    <SheetMap relief={relief} board="" focus={{ x: relief.coast, p: 0 }}>
      {null}
    </SheetMap>
  );
  const links = [
    ...document.querySelectorAll<SVGAElement>('a[href^="/projects/"]'),
  ];

  it("letters every site on the sheet, not only the selected ones", () => {
    expect(links).toHaveLength(relief.sites.length);
    for (const site of relief.sites) {
      const link = document.querySelector(`a[href="/projects/${site.slug}"]`);
      const lettering = link?.querySelector("g:not([aria-hidden]) text");
      expect(lettering?.textContent).toBe(site.name);
      expect(lettering?.closest(".opacity-0")).toBeNull();
    }
  });

  it("names each site link by the project title alone", () => {
    for (const site of relief.sites) {
      const link = document.querySelector(`a[href="/projects/${site.slug}"]`);
      expect(link?.getAttribute("aria-label")).toBe(site.name);
    }
  });
});
