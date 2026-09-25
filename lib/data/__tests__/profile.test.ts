import type { PROFILE_QUERY_RESULT } from "@/sanity.types";
import { describe, expect, it } from "vitest";

import { mapProfile } from "../profile";

type ProfileResult = NonNullable<PROFILE_QUERY_RESULT>;
type AvatarResult = NonNullable<ProfileResult["avatar"]>;

const ASSET_ID = "image-a1b2c3d4-1200x800-jpg";

function result(overrides: Partial<ProfileResult> = {}): ProfileResult {
  return {
    name: null,
    headline: null,
    bio: null,
    availability: null,
    avatar: null,
    location: null,
    email: null,
    links: null,
    resumeNote: null,
    ...overrides,
  };
}

function avatar(overrides: Partial<AvatarResult> = {}): AvatarResult {
  return {
    alt: "Illustrated portrait",
    asset: {
      _id: ASSET_ID,
      url: null,
      metadata: {
        lqip: "data:image/jpeg;base64,AAAA",
        dimensions: { width: 1200, height: 800 },
      },
    },
    crop: null,
    hotspot: null,
    ...overrides,
  };
}

describe("mapProfile", () => {
  it("fills defaults for empty fields", () => {
    expect(mapProfile(result())).toEqual({
      name: "",
      headline: "",
      bio: [],
      availability: undefined,
      avatar: null,
      location: "",
      email: "",
      links: [],
      resumeNote: undefined,
    });
  });

  it("keeps only links that have both a label and a url", () => {
    const mapped = mapProfile(
      result({
        links: [
          { label: "GitHub", url: "https://github.com/example" },
          { label: null, url: "https://example.com" },
          { label: "Empty", url: null },
        ],
      })
    );
    expect(mapped.links).toEqual([
      { label: "GitHub", url: "https://github.com/example" },
    ]);
  });

  describe("avatar", () => {
    it("is null when absent", () => {
      expect(mapProfile(result({ avatar: null })).avatar).toBeNull();
    });

    it("is null when the asset is missing", () => {
      expect(
        mapProfile(result({ avatar: avatar({ asset: null }) })).avatar
      ).toBeNull();
    });

    it("is null when the dimensions are unknown", () => {
      const noDimensions = avatar({
        asset: { _id: ASSET_ID, url: null, metadata: null },
      });
      const zeroWidth = avatar({
        asset: {
          _id: ASSET_ID,
          url: null,
          metadata: { lqip: null, dimensions: { width: 0, height: 800 } },
        },
      });
      expect(mapProfile(result({ avatar: noDimensions })).avatar).toBeNull();
      expect(mapProfile(result({ avatar: zeroWidth })).avatar).toBeNull();
    });

    it("maps a present image with its placeholder", () => {
      const mapped = mapProfile(result({ avatar: avatar() })).avatar;
      expect(mapped).toEqual({
        url: expect.stringContaining("a1b2c3d4-1200x800.jpg"),
        alt: "Illustrated portrait",
        width: 1200,
        height: 800,
        blurDataUrl: "data:image/jpeg;base64,AAAA",
      });
      expect(mapped?.url).toContain("auto=format");
    });

    it("reports the cropped size and omits a missing placeholder", () => {
      const mapped = mapProfile(
        result({
          avatar: avatar({
            alt: null,
            asset: {
              _id: ASSET_ID,
              url: null,
              metadata: {
                lqip: null,
                dimensions: { width: 1200, height: 800 },
              },
            },
            crop: {
              _type: "sanity.imageCrop",
              left: 0.25,
              right: 0.25,
              top: 0.1,
              bottom: 0,
            },
          }),
        })
      ).avatar;
      expect(mapped).toMatchObject({ alt: "", width: 600, height: 720 });
      expect(mapped).not.toHaveProperty("blurDataUrl");
      expect(mapped?.url).toContain("rect=300,80,600,720");
    });
  });
});
