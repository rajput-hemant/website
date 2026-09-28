import { beforeEach, describe, expect, it, vi } from "vitest";

import { getProjects } from "@/lib/data";
import type { Project } from "@/lib/data/types";

import {
  loadProjectPage,
  projectMetadata,
  projectStaticParams,
} from "../project-page";

vi.mock("@/lib/data", () => ({ getProjects: vi.fn() }));

const projects: Project[] = [
  {
    id: "first",
    slug: "first",
    name: "First project",
    tagline: "First tagline",
    description: [],
    stack: [],
    featured: false,
    status: "active",
    year: 2024,
  },
  {
    id: "second",
    slug: "second",
    name: "Second project",
    tagline: "Second tagline",
    description: [],
    stack: [],
    featured: true,
    status: "maintained",
    year: 2025,
  },
  {
    id: "third",
    slug: "third",
    name: "Third project",
    tagline: "Third tagline",
    description: [],
    stack: [],
    featured: false,
    status: "archived",
    year: null,
  },
];

describe("project page loaders", () => {
  beforeEach(() => {
    vi.mocked(getProjects).mockResolvedValue(projects);
  });

  it("returns static params in data accessor order", async () => {
    expect(await projectStaticParams()).toEqual([
      { slug: "first" },
      { slug: "second" },
      { slug: "third" },
    ]);
  });

  it("returns null for a missing slug", async () => {
    expect(await loadProjectPage("missing")).toBeNull();
  });

  it("uses the supplied order to resolve the project and its neighbors", async () => {
    const result = await loadProjectPage("second", (items) =>
      [...items].reverse()
    );

    expect(result).toEqual({
      project: projects[1],
      projects: [projects[2], projects[1], projects[0]],
      index: 1,
      previous: projects[2],
      next: projects[0],
    });
  });

  it("builds canonical project metadata", async () => {
    const metadata = await projectMetadata("second");

    expect(metadata.title).toBe("Second project");
    expect(metadata.description).toBe("Second tagline");
    expect(metadata.alternates?.canonical).toBe("/projects/second");
    expect(metadata.openGraph?.url).toBe("/projects/second");
  });
});
