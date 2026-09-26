import type {
  EXPERIENCE_QUERY_RESULT,
  PROJECTS_QUERY_RESULT,
} from "@/sanity.types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as fallback from "@/content/fallback";
import type * as DataExports from "@/lib/data";
import type * as FetchExports from "@/sanity/lib/fetch";
import type * as QueryExports from "@/sanity/lib/queries";

vi.mock("@/sanity/lib/fetch", () => ({ sanityFetch: vi.fn() }));
vi.mock("next/headers", () => ({ draftMode: vi.fn() }));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

type DataModule = typeof DataExports;
type FetchModule = typeof FetchExports;
type Queries = typeof QueryExports;

async function load(projectId: string) {
  vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", projectId);
  vi.resetModules();
  const data: DataModule = await import("@/lib/data");
  const { sanityFetch }: FetchModule = await import("@/sanity/lib/fetch");
  const queries: Queries = await import("@/sanity/lib/queries");
  return { data, sanityFetch: vi.mocked(sanityFetch), queries };
}

let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("without a Sanity project", () => {
  it("serves the bundled profile, now, skills and education", async () => {
    const { data } = await load("");
    await expect(data.getProfile()).resolves.toEqual(fallback.profile);
    await expect(data.getNow()).resolves.toEqual(fallback.now);
    await expect(data.getSkills()).resolves.toEqual(fallback.skills);
    await expect(data.getEducation()).resolves.toEqual(fallback.education);
  });

  it("maps the missing avatar to null", async () => {
    const { data } = await load("");
    expect((await data.getProfile()).avatar).toBeNull();
  });

  it("serves experience newest first with continuedFrom derived", async () => {
    const { data } = await load("");
    const roles = await data.getExperience();

    expect(roles).toHaveLength(fallback.experience.length);
    const starts = roles.map((r) => r.startDate);
    expect(starts).toEqual([...starts].sort().reverse());

    for (const predecessor of fallback.experience) {
      if (!predecessor.continuedInto) continue;
      const successor = roles.find(
        (r) => r.id === predecessor.continuedInto?.id
      );
      expect(successor?.continuedFrom).toEqual({
        id: predecessor.id,
        company: predecessor.company,
        note: predecessor.continuedInto.note,
      });
    }
    expect(roles.find((r) => r.id === "zunta")?.continuedFrom?.id).toBe(
      "proghit"
    );
  });

  it("serves projects featured first", async () => {
    const { data } = await load("");
    const projects = await data.getProjects();
    const firstUnfeatured = projects.findIndex((p) => !p.featured);

    expect(projects).toHaveLength(fallback.projects.length);
    expect(firstUnfeatured).toBeGreaterThan(0);
    expect(projects.slice(firstUnfeatured).every((p) => !p.featured)).toBe(
      true
    );
  });

  it("serves the changelog newest first", async () => {
    const { data } = await load("");
    const dates = (await data.getChangelog()).map((u) => u.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("has no questions", async () => {
    const { data } = await load("");
    await expect(data.getQuestions()).resolves.toEqual({
      items: [],
      total: 0,
    });
  });

  it("makes no Sanity requests and warns once", async () => {
    const { data, sanityFetch } = await load("");
    await Promise.all([
      data.getProfile(),
      data.getExperience(),
      data.getProjects(),
      data.getNow(),
      data.getChangelog(),
      data.getSkills(),
      data.getEducation(),
      data.getQuestions(),
    ]);
    expect(sanityFetch).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledOnce();
  });
});

describe("with a Sanity project", () => {
  it("fetches and maps the profile under its tag", async () => {
    const { data, sanityFetch, queries } = await load("test-project");
    sanityFetch.mockResolvedValueOnce({
      name: "Hemant",
      headline: null,
      bio: null,
      availability: null,
      avatar: null,
      location: null,
      email: null,
      links: null,
      resumeNote: null,
      resumeUrl: null,
    });

    const profile = await data.getProfile();

    expect(sanityFetch).toHaveBeenCalledWith({
      query: queries.PROFILE_QUERY,
      tags: ["profile"],
    });
    expect(profile).toMatchObject({ name: "Hemant", avatar: null, bio: [] });
    expect(warn).not.toHaveBeenCalled();
  });

  it.each(["getProfile", "getNow"] as const)(
    "%s throws when the singleton is missing",
    async (accessor) => {
      const { data, sanityFetch } = await load("test-project");
      sanityFetch.mockResolvedValueOnce(null);
      await expect(data[accessor]()).rejects.toThrow(/has no "(profile|now)"/);
    }
  );

  it("propagates fetch errors instead of falling back", async () => {
    const { data, sanityFetch } = await load("test-project");
    const failure = new Error("Sanity is down");
    sanityFetch.mockRejectedValue(failure);

    await expect(data.getProfile()).rejects.toBe(failure);
    await expect(data.getExperience()).rejects.toBe(failure);
    await expect(data.getProjects()).rejects.toBe(failure);
    await expect(data.getQuestions()).rejects.toBe(failure);
    expect(warn).not.toHaveBeenCalled();
  });

  it("maps experience and derives continuedFrom", async () => {
    const { data, sanityFetch } = await load("test-project");
    const base = {
      companyUrl: null,
      companyBlurb: null,
      title: "Engineer",
      location: "Remote",
      remote: true,
      employmentType: "full-time",
      employmentNote: null,
      endDate: null,
      endNote: null,
      continuationNote: null,
      note: null,
      body: null,
      highlights: null,
    } as const;
    const results: EXPERIENCE_QUERY_RESULT = [
      {
        ...base,
        _id: "experience-new",
        company: "New",
        startDate: "2026-01-01",
        continuedInto: null,
      },
      {
        ...base,
        _id: "experience-old",
        company: "Old",
        startDate: "2024-01-01",
        continuedInto: { _id: "experience-new", company: "New" },
        continuationNote: "Moved with my manager",
      },
    ];
    sanityFetch.mockResolvedValueOnce(results);

    const roles = await data.getExperience();

    expect(roles.map((r) => r.id)).toEqual(["new", "old"]);
    expect(roles[0]?.continuedFrom).toEqual({
      id: "old",
      company: "Old",
      note: "Moved with my manager",
    });
  });

  it("keeps the query's project order", async () => {
    const { data, sanityFetch } = await load("test-project");
    const base = {
      slug: null,
      name: null,
      tagline: null,
      description: null,
      image: null,
      stack: null,
      github: null,
      live: null,
      status: null,
      year: null,
    };
    const results: PROJECTS_QUERY_RESULT = [
      { ...base, _id: "project-a", featured: true },
      { ...base, _id: "project-b", featured: false },
    ];
    sanityFetch.mockResolvedValueOnce(results);

    const projects = await data.getProjects();

    expect(projects.map((p) => [p.id, p.featured])).toEqual([
      ["a", true],
      ["b", false],
    ]);
  });

  it.each([
    [{}, { start: 0, end: 20 }],
    [
      { page: 3, pageSize: 10 },
      { start: 20, end: 30 },
    ],
    [
      { page: 0, pageSize: 0 },
      { start: 0, end: 1 },
    ],
    [
      { page: 2.7, pageSize: 1000 },
      { start: 100, end: 200 },
    ],
  ])("pages questions for %o as %o", async (opts, params) => {
    const { data, sanityFetch, queries } = await load("test-project");
    sanityFetch.mockResolvedValueOnce({ items: [], total: 0 });

    await data.getQuestions(opts);

    expect(sanityFetch).toHaveBeenCalledWith({
      query: queries.QUESTIONS_QUERY,
      params,
      tags: ["question"],
    });
  });

  it("maps a question page", async () => {
    const { data, sanityFetch } = await load("test-project");
    sanityFetch.mockResolvedValueOnce({
      items: [
        {
          _id: "q1",
          slug: "abcd1234",
          by: "visitor",
          body: "Hello?",
          authorName: null,
          status: "published",
          answer: null,
          replies: null,
          submittedAt: "2026-09-01",
          publishedAt: null,
          lastActivityAt: null,
        },
      ],
      total: 7,
    });

    const page = await data.getQuestions();

    expect(page.total).toBe(7);
    expect(page.items).toEqual([
      expect.objectContaining({ id: "q1", slug: "abcd1234", replies: [] }),
    ]);
  });
});
