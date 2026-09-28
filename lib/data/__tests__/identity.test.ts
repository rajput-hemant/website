import { describe, expect, it, vi } from "vitest";

import { site } from "@/content/site";
import {
  deriveSiteIdentity,
  handleFromLinks,
  initialsOf,
  personalize,
  slugifyName,
} from "@/lib/data/identity";

const ada = deriveSiteIdentity({
  name: "Ada Lovelace",
  headline: "Analyst of engines",
  links: [],
});

vi.mock("@/lib/data", () => ({
  getSiteIdentity: () => Promise.resolve(ada),
}));

describe("deriveSiteIdentity", () => {
  it("derives every field from the profile", () => {
    expect(ada).toMatchObject({
      name: "Ada Lovelace",
      firstName: "Ada",
      shortName: "ada",
      handle: "ada-lovelace",
      initials: "AL",
      description: "Analyst of engines",
      url: site.url,
    });
  });

  it("takes the handle from a GitHub link first, then LinkedIn", () => {
    const links = [
      { label: "LinkedIn", url: "https://www.linkedin.com/in/ada-l/" },
      { label: "GitHub", url: "https://github.com/countess" },
    ];
    expect(handleFromLinks(links)).toBe("countess");
    expect(handleFromLinks(links.slice(0, 1))).toBe("ada-l");
    expect(
      handleFromLinks([{ label: "Repo", url: "https://github.com/a/b" }])
    ).toBeUndefined();
  });

  it("handles single-word and non-ASCII names", () => {
    const cher = deriveSiteIdentity({ name: "Cher", headline: "", links: [] });
    expect(cher).toMatchObject({
      firstName: "Cher",
      shortName: "cher",
      handle: "cher",
      initials: "C",
    });
    expect(slugifyName("José  Núñez")).toBe("jose-nunez");
    expect(initialsOf("Łukasz Żuk")).toBe("ŁŻ");
    expect(initialsOf("हेमंत राजपूत")).toBe("हेरा");
    expect(slugifyName("李 小龍")).toBe("李-小龍");
  });

  it("falls back to the configured identity only when the profile is blank", () => {
    const blank = deriveSiteIdentity({ name: " ", headline: "", links: [] });
    expect(blank).toMatchObject({
      name: site.name,
      shortName: site.shortName,
      handle: site.handle,
      description: site.description,
    });
  });

  it("personalizes fallback copy written about the configured owner", () => {
    expect(personalize(`About ${site.name}`, ada)).toBe("About Ada Lovelace");
    expect(personalize(`The word “${site.shortName}”`, ada)).toBe(
      "The word “ada”"
    );
  });
});

describe("a non-owner profile", () => {
  it("never names the configured owner in page metadata", async () => {
    const { pageMetadata } = await import("@/lib/metadata");
    const metadata = await pageMetadata({
      description: `About ${site.name}`,
      path: "/",
    });
    const text = JSON.stringify(metadata);
    expect(text).toContain("Ada Lovelace");
    expect(text).not.toContain(site.name);
    expect(text).not.toContain(site.handle);
  });
});
