/**
 * Writes the bundled fallback content (content/fallback) into Sanity.
 * Idempotent: ids are deterministic and every document is replaced, so
 * re-running overwrites edits made in Studio to seeded documents.
 *
 *   bun scripts/seed.ts
 */
import {
  createClient,
  type IdentifiedSanityDocumentStub,
} from "@sanity/client";

import {
  changelog,
  education,
  experience,
  now,
  profile,
  projects,
  skills,
} from "@/content/fallback";
import { env } from "@/lib/env";

const REQUIRED_ENV = [
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "SANITY_API_WRITE_TOKEN",
] as const;

function readConfig() {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    console.error(
      `Missing ${missing.join(", ")}. Add them to .env.local (see docs/sanity.md) and re-run.`
    );
    process.exit(1);
  }
  return {
    projectId: env.sanity.projectId,
    dataset: env.sanity.dataset,
    apiVersion: env.sanity.apiVersion,
    token: process.env.SANITY_API_WRITE_TOKEN,
  };
}

const docId = (type: string, id: string) => `${type}-${id}`;

const reference = (id: string) => ({ _type: "reference", _ref: id });

function withKeys<T extends object>(prefix: string, items: T[]) {
  return items.map((item, index) => ({ _key: `${prefix}${index}`, ...item }));
}

function buildDocuments(): IdentifiedSanityDocumentStub[] {
  const profileDoc = {
    _id: "profile",
    _type: "profile",
    name: profile.name,
    headline: profile.headline,
    bio: profile.bio,
    availability: profile.availability,
    location: profile.location,
    email: profile.email,
    links: withKeys("link", profile.links).map((link) => ({
      _type: "link",
      ...link,
    })),
    resumeNote: profile.resumeNote,
    resumeUrl: profile.resumeUrl,
  };

  const experienceDocs = experience.map((role) => ({
    _id: docId("experience", role.id),
    _type: "experience",
    company: role.company,
    companyUrl: role.companyUrl,
    companyBlurb: role.companyBlurb,
    title: role.title,
    location: role.location,
    remote: role.remote,
    employmentType: role.employmentType,
    employmentNote: role.employmentNote,
    startDate: role.startDate,
    endDate: role.endDate,
    endNote: role.endNote,
    continuedInto: role.continuedInto
      ? reference(docId("experience", role.continuedInto.id))
      : undefined,
    continuationNote: role.continuedInto?.note,
    body: role.body,
    highlights: role.highlights,
  }));

  const projectDocs = projects.map((project, index) => ({
    _id: docId("project", project.id),
    _type: "project",
    name: project.name,
    slug: { _type: "slug", current: project.slug },
    tagline: project.tagline,
    description: project.description,
    stack: project.stack,
    github: project.github,
    live: project.live,
    featured: project.featured,
    status: project.status,
    year: project.year,
    order: index,
  }));

  const nowDoc = {
    _id: "now",
    _type: "now",
    items: withKeys("item", now.items).map((item) => ({
      _type: "nowItem",
      ...item,
    })),
    updatedAt: now.updatedAt,
  };

  const updateDocs = changelog.map((entry) => ({
    _id: docId("update", entry.id),
    _type: "update",
    date: entry.date,
    text: entry.text,
    category: entry.category,
    link: entry.link,
  }));

  const skillDocs = skills.map((group, index) => ({
    _id: docId("skillGroup", group.id),
    _type: "skillGroup",
    title: group.title,
    items: group.items,
    order: index,
  }));

  const educationDocs = education.map((entry, index) => ({
    _id: docId("education", entry.id),
    _type: "education",
    institution: entry.institution,
    degree: entry.degree,
    location: entry.location,
    startYear: entry.startYear,
    endYear: entry.endYear,
    score: entry.score,
    order: index,
  }));

  return [
    profileDoc,
    nowDoc,
    ...experienceDocs,
    ...projectDocs,
    ...updateDocs,
    ...skillDocs,
    ...educationDocs,
  ];
}

async function seed() {
  const config = readConfig();
  const client = createClient({ ...config, useCdn: false });
  const documents = buildDocuments();

  const transaction = documents.reduce(
    (tx, document) => tx.createOrReplace(document),
    client.transaction()
  );
  await transaction.commit({ visibility: "sync" });

  const counts = Object.entries(
    Object.groupBy(documents, (document) => document._type)
  ).map(([type, docs]) => `${type}: ${docs?.length ?? 0}`);
  console.log(
    `Seeded ${documents.length} documents into ${config.projectId}/${config.dataset} (${counts.join(", ")}).`
  );
}

seed().catch((error: unknown) => {
  console.error(
    "Seeding failed:",
    error instanceof Error ? error.message : error
  );
  process.exit(1);
});
