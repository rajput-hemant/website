import { defineQuery } from "next-sanity";

const imageProjection = /* groq */ `{
  alt,
  asset->{
    _id,
    url,
    metadata { lqip, dimensions { width, height } }
  },
  crop,
  hotspot
}`;

export const PROFILE_QUERY =
  defineQuery(`*[_type == "profile" && _id == "profile"][0]{
  name,
  headline,
  bio,
  availability,
  avatar ${imageProjection},
  location,
  email,
  links[]{ label, url },
  resumeNote
}`);

export const EXPERIENCE_QUERY =
  defineQuery(`*[_type == "experience"] | order(startDate desc){
  _id,
  company,
  companyUrl,
  companyBlurb,
  title,
  location,
  remote,
  employmentType,
  employmentNote,
  startDate,
  endDate,
  endNote,
  "continuedInto": continuedInto->{ _id, company },
  continuationNote,
  body,
  highlights
}`);

export const PROJECTS_QUERY =
  defineQuery(`*[_type == "project"] | order(featured desc, coalesce(order, 1000) asc, year desc){
  _id,
  "slug": slug.current,
  name,
  tagline,
  description,
  stack,
  github,
  live,
  featured,
  status,
  year
}`);

export const NOW_QUERY = defineQuery(`*[_type == "now" && _id == "now"][0]{
  items[]{ text, link },
  updatedAt
}`);

export const CHANGELOG_QUERY =
  defineQuery(`*[_type == "update"] | order(date desc, _createdAt desc){
  _id,
  date,
  text,
  category,
  link
}`);

export const SKILLS_QUERY =
  defineQuery(`*[_type == "skillGroup"] | order(coalesce(order, 1000) asc, title asc){
  _id,
  title,
  items
}`);

export const EDUCATION_QUERY =
  defineQuery(`*[_type == "education"] | order(coalesce(order, 1000) asc, endYear desc){
  _id,
  institution,
  degree,
  location,
  startYear,
  endYear,
  score
}`);

/**
 * Public projections for /ask. They must never select `author.email`,
 * `author.anonId`, `moderation`, or a reply's `anonId` / `moderation`, and
 * only published replies leave the dataset (replies added in Studio before
 * moderation existed have no status and count as published).
 */
const questionProjection = /* groq */ `{
  _id,
  slug,
  "by": select(author.kind == "owner" => "owner", "visitor"),
  body,
  "authorName": author.name,
  status,
  answer,
  "replies": replies[!defined(status) || status == "published"]{ _key, by, authorName, body, createdAt },
  submittedAt,
  publishedAt,
  lastActivityAt
}`;

export const QUESTIONS_QUERY = defineQuery(`{
  "items": *[_type == "question" && status == "published"] | order(coalesce(lastActivityAt, publishedAt, submittedAt) desc) [$start...$end] ${questionProjection},
  "total": count(*[_type == "question" && status == "published"])
}`);
