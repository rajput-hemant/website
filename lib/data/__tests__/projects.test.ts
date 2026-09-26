import type { PROJECTS_QUERY_RESULT } from "@/sanity.types";
import { describe, expect, it } from "vitest";

import { mapProject, sortProjects } from "../projects";
import type { Project } from "../types";

type ProjectResult = PROJECTS_QUERY_RESULT[number];

function result(overrides: Partial<ProjectResult> = {}): ProjectResult {
  return {
    _id: "project-lipi",
    slug: null,
    name: null,
    tagline: null,
    description: null,
    image: null,
    stack: null,
    github: null,
    live: null,
    featured: null,
    status: null,
    year: null,
    ...overrides,
  };
}

function project(id: string, featured: boolean): Project {
  return {
    id,
    slug: id,
    name: id,
    tagline: "",
    description: [],
    stack: [],
    featured,
    status: "active",
    year: 2025,
  };
}

describe("mapProject", () => {
  it("fills defaults and derives the slug from the id when missing", () => {
    expect(mapProject(result())).toEqual({
      id: "lipi",
      slug: "lipi",
      name: "",
      tagline: "",
      description: [],
      stack: [],
      github: undefined,
      live: undefined,
      featured: false,
      status: "active",
      year: null,
    });
  });

  it("keeps a missing year null instead of coercing to zero", () => {
    expect(mapProject(result({ year: null })).year).toBeNull();
    expect(mapProject(result({ year: 2024 })).year).toBe(2024);
  });

  it("prefers the stored slug", () => {
    const mapped = mapProject(
      result({
        slug: "lipi-editor",
        name: "Lipi",
        stack: ["TypeScript"],
        github: "https://github.com/example/lipi",
        featured: true,
        status: "archived",
        year: 2024,
      })
    );
    expect(mapped).toMatchObject({
      id: "lipi",
      slug: "lipi-editor",
      name: "Lipi",
      stack: ["TypeScript"],
      github: "https://github.com/example/lipi",
      live: undefined,
      featured: true,
      status: "archived",
      year: 2024,
    });
  });
});

describe("sortProjects", () => {
  it("puts featured projects first and keeps the incoming order within each group", () => {
    const sorted = sortProjects([
      project("a", false),
      project("b", true),
      project("c", false),
      project("d", true),
    ]);
    expect(sorted.map((p) => p.id)).toEqual(["b", "d", "a", "c"]);
  });

  it("returns a new array without mutating the input", () => {
    const input = [project("a", false), project("b", true)];
    const sorted = sortProjects(input);
    expect(sorted).not.toBe(input);
    expect(input.map((p) => p.id)).toEqual(["a", "b"]);
  });
});
