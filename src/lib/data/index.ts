import 'server-only';
import { sanityFetch } from '~/sanity/lib/fetch';
import {
  CHANGELOG_QUERY,
  EDUCATION_QUERY,
  EXPERIENCE_QUERY,
  NOW_QUERY,
  PROFILE_QUERY,
  PROJECTS_QUERY,
  SKILLS_QUERY,
} from '~/sanity/lib/queries';
import { sanityTags } from '~/sanity/lib/tags';
import type {
  CHANGELOG_QUERY_RESULT,
  EDUCATION_QUERY_RESULT,
  EXPERIENCE_QUERY_RESULT,
  NOW_QUERY_RESULT,
  PROFILE_QUERY_RESULT,
  PROJECTS_QUERY_RESULT,
  SKILLS_QUERY_RESULT,
} from '~/sanity/types';

export type Profile = PROFILE_QUERY_RESULT;
export type Experience = EXPERIENCE_QUERY_RESULT;
export type ExperienceRole = Experience[number];
export type Projects = PROJECTS_QUERY_RESULT;
export type Project = Projects[number];
export type Now = NOW_QUERY_RESULT;
export type Changelog = CHANGELOG_QUERY_RESULT;
export type ChangelogEntry = Changelog[number];
export type Education = EDUCATION_QUERY_RESULT;
export type EducationEntry = Education[number];
export type Skills = SKILLS_QUERY_RESULT;
export type SkillGroup = Skills[number];

export async function getProfile(): Promise<Profile> {
  return sanityFetch(PROFILE_QUERY, [
    sanityTags.profile,
    `${sanityTags.profile}:profile`,
  ]);
}

export async function getExperience(): Promise<Experience> {
  return sanityFetch(EXPERIENCE_QUERY, [sanityTags.experience]);
}

export async function getProjects(): Promise<Projects> {
  return sanityFetch(PROJECTS_QUERY, [sanityTags.project]);
}

export async function getNow(): Promise<Now> {
  return sanityFetch(NOW_QUERY, [sanityTags.now, `${sanityTags.now}:now`]);
}

export async function getChangelog(): Promise<Changelog> {
  return sanityFetch(CHANGELOG_QUERY, [sanityTags.update]);
}

export async function getSkills(): Promise<Skills> {
  return sanityFetch(SKILLS_QUERY, [sanityTags.skillGroup]);
}

export async function getEducation(): Promise<Education> {
  return sanityFetch(EDUCATION_QUERY, [sanityTags.education]);
}
