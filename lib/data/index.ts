/**
 * Server-only data accessors, the one entry point pages use for content.
 *
 * With a Sanity project configured, every accessor reads Sanity only: a failed
 * request or a missing singleton throws, so a build fails loudly instead of
 * shipping stale bundled content. Without one, accessors serve the bundled
 * fallback and make no network calls. Each accessor is deduplicated per
 * render with React `cache()`.
 */
import { cache } from "react";
import type {
  CHANGELOG_QUERY_RESULT,
  EDUCATION_QUERY_RESULT,
  EXPERIENCE_QUERY_RESULT,
  NOW_QUERY_RESULT,
  PROFILE_QUERY_RESULT,
  PROJECTS_QUERY_RESULT,
  QUESTIONS_QUERY_RESULT,
  SKILLS_QUERY_RESULT,
} from "@/sanity.types";

import { isSanityConfigured } from "@/lib/env";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  CHANGELOG_QUERY,
  EDUCATION_QUERY,
  EXPERIENCE_QUERY,
  NOW_QUERY,
  PROFILE_QUERY,
  PROJECTS_QUERY,
  QUESTIONS_QUERY,
  SKILLS_QUERY,
} from "@/sanity/lib/queries";

import { mapUpdate, sortChangelog } from "./changelog";
import { dedupeDocuments } from "./dedupe";
import { mapEducation } from "./education";
import { linkContinuations, mapExperience } from "./experience";
import { getFallbackContent } from "./fallback";
import { mapNow } from "./now";
import { mapProfile } from "./profile";
import { mapProject, sortProjects } from "./projects";
import { mapQuestion } from "./questions";
import { mapSkillGroup } from "./skills";
import type {
  Education,
  Experience,
  Now,
  Profile,
  Project,
  Question,
  SkillGroup,
  Update,
} from "./types";

export type * from "./types";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function missingSingleton(id: string): never {
  throw new Error(
    `[data] Sanity has no "${id}" document. Run \`bun scripts/seed.ts\` or create it in /studio.`
  );
}

export const getProfile = cache(async (): Promise<Profile> => {
  if (!isSanityConfigured) return getFallbackContent().profile;
  const result = await sanityFetch<PROFILE_QUERY_RESULT>({
    query: PROFILE_QUERY,
    tags: ["profile"],
  });
  return result ? mapProfile(result) : missingSingleton("profile");
});

/** Newest first, with `continuedFrom` derived on successor roles. */
export const getExperience = cache(async (): Promise<Experience[]> => {
  if (!isSanityConfigured)
    return linkContinuations(getFallbackContent().experience);
  const results = await sanityFetch<EXPERIENCE_QUERY_RESULT>({
    query: EXPERIENCE_QUERY,
    tags: ["experience"],
  });
  return linkContinuations(
    dedupeDocuments("experience", results).map(mapExperience)
  );
});

/** Featured first, then by `order`. */
export const getProjects = cache(async (): Promise<Project[]> => {
  if (!isSanityConfigured) return sortProjects(getFallbackContent().projects);
  const results = await sanityFetch<PROJECTS_QUERY_RESULT>({
    query: PROJECTS_QUERY,
    tags: ["project"],
  });
  return dedupeDocuments("project", results).map(mapProject);
});

export const getNow = cache(async (): Promise<Now> => {
  if (!isSanityConfigured) return getFallbackContent().now;
  const result = await sanityFetch<NOW_QUERY_RESULT>({
    query: NOW_QUERY,
    tags: ["now"],
  });
  return result ? mapNow(result) : missingSingleton("now");
});

/** Newest first. */
export const getChangelog = cache(async (): Promise<Update[]> => {
  if (!isSanityConfigured) return sortChangelog(getFallbackContent().changelog);
  const results = await sanityFetch<CHANGELOG_QUERY_RESULT>({
    query: CHANGELOG_QUERY,
    tags: ["update"],
  });
  return dedupeDocuments("update", results).map(mapUpdate);
});

export const getSkills = cache(async (): Promise<SkillGroup[]> => {
  if (!isSanityConfigured) return getFallbackContent().skills;
  const results = await sanityFetch<SKILLS_QUERY_RESULT>({
    query: SKILLS_QUERY,
    tags: ["skillGroup"],
  });
  return dedupeDocuments("skillGroup", results).map(mapSkillGroup);
});

export const getEducation = cache(async (): Promise<Education[]> => {
  if (!isSanityConfigured) return getFallbackContent().education;
  const results = await sanityFetch<EDUCATION_QUERY_RESULT>({
    query: EDUCATION_QUERY,
    tags: ["education"],
  });
  return dedupeDocuments("education", results).map(mapEducation);
});

const fetchQuestionsPage = cache(
  async (
    page: number,
    pageSize: number
  ): Promise<{ items: Question[]; total: number }> => {
    if (!isSanityConfigured) return { items: [], total: 0 };
    const start = (page - 1) * pageSize;
    const result = await sanityFetch<QUESTIONS_QUERY_RESULT>({
      query: QUESTIONS_QUERY,
      params: { start, end: start + pageSize },
      tags: ["question"],
    });
    return { items: result.items.map(mapQuestion), total: result.total };
  }
);

/** Published threads only (with published replies), latest activity first. `page` is 1-based. */
export function getQuestions(
  opts: { page?: number; pageSize?: number } = {}
): Promise<{ items: Question[]; total: number }> {
  const page = Math.max(1, Math.floor(opts.page ?? 1));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(opts.pageSize ?? DEFAULT_PAGE_SIZE))
  );
  return fetchQuestionsPage(page, pageSize);
}
