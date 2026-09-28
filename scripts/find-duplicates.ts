/**
 * Content doctor: finds content documents that duplicate each other (for
 * example a hand-entered copy of a seeded education entry) and legacy /ask
 * threads whose `answer` has not been folded into `replies` yet.
 *
 *   bun scripts/find-duplicates.ts          report only
 *   bun scripts/find-duplicates.ts --fix    delete duplicates and migrate answers, in one transaction
 *
 * Seed-owned documents (`<type>-<id>`, see scripts/seed.ts) always stay, so
 * Studio edits to them survive. Bun loads `.env.local` automatically.
 */
import { createClient, type SanityClient } from "@sanity/client";

import {
  changelog,
  education,
  experience,
  projects,
  skills,
} from "@/content/fallback";
import {
  migrateLegacyAnswer,
  type LegacyAnswerDocument,
} from "@/lib/ask/legacy-answer";
import { env } from "@/lib/env";

import {
  DUPLICATE_TYPES,
  findDuplicateGroups,
  formatDuplicateReport,
  idsToDelete,
  seedOwnedIds,
  type ContentDocument,
} from "./lib/duplicates";

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

const contentQuery = `*[_type in $types && !(_id in path("versions.**"))]{
  _id, _type, _updatedAt,
  institution, degree, endYear,
  company, startDate,
  "slug": slug.current,
  title,
  date, text
}`;

const legacyAnswerQuery = `*[_type == "question" && defined(answer) && !(_id in path("versions.**"))]`;

async function planMigrations(client: SanityClient) {
  const questions =
    await client.fetch<LegacyAnswerDocument[]>(legacyAnswerQuery);
  return questions.flatMap((question) => {
    const migration = migrateLegacyAnswer(question);
    return migration ? [migration] : [];
  });
}

async function doctor() {
  const fix = process.argv.includes("--fix");
  const config = readConfig();
  const client = createClient({
    ...config,
    useCdn: false,
    perspective: "raw",
  });
  console.log(`Checking ${config.projectId}/${config.dataset}…\n`);

  const documents = await client.fetch<ContentDocument[]>(contentQuery, {
    types: DUPLICATE_TYPES,
  });
  const seedIds = seedOwnedIds({
    education,
    experience,
    projects,
    skills,
    changelog,
  });
  const groups = findDuplicateGroups(documents, seedIds);
  const deletions = idsToDelete(groups);
  console.log(formatDuplicateReport(groups));

  const migrations = await planMigrations(client);
  console.log(
    migrations.length === 0
      ? "\nNo legacy answers to migrate."
      : `\nLegacy answers to fold into replies: ${migrations.map((item) => item.id).join(", ")}`
  );

  if (deletions.length === 0 && migrations.length === 0) return;
  if (!fix) {
    console.log(
      `\nRun \`bun run doctor --fix\` to delete ${deletions.length} document(s) and migrate ${migrations.length} answer(s).`
    );
    return;
  }

  const transaction = client.transaction();
  for (const id of deletions) transaction.delete(id);
  for (const { id, operations } of migrations) {
    transaction.patch(id, operations);
  }
  await transaction.commit({ visibility: "sync" });
  console.log(
    `\nDeleted ${deletions.length} document(s) and migrated ${migrations.length} answer(s).`
  );
}

doctor().catch((error: unknown) => {
  console.error(
    "Doctor failed:",
    error instanceof Error ? error.message : error
  );
  process.exit(1);
});
