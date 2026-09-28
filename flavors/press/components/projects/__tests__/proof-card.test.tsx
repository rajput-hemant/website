import { ProofCard } from "@/flavors/press/components/projects/proof-card";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { Project } from "@/lib/data/types";

const base: Project = {
  id: "draft",
  slug: "draft",
  name: "Draft proof",
  tagline: "Not dated yet",
  description: [],
  stack: ["TypeScript"],
  featured: false,
  status: "wip",
  year: null,
};

describe("ProofCard", () => {
  it("omits the year line when Sanity left the year unset", () => {
    const html = renderToStaticMarkup(<ProofCard project={base} sig={1} />);
    expect(html).toContain("Sig. 01");
    expect(html).not.toContain("/&nbsp;/&nbsp; 0");
    expect(html).not.toMatch(/\/\s*0/);
  });
});
