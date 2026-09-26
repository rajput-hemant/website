import { GraduationCap } from "lucide-react";
import {
  defineField,
  defineType,
  type SanityDocument,
  type ValidationContext,
} from "sanity";

import { normalizeName } from "../../lib/normalize";
import { apiVersion } from "../env";

type EducationKey = { _id: string; institution?: string; degree?: string };

const text = (value: unknown) => (typeof value === "string" ? value : "");

/**
 * Warns (never blocks) when another published entry has the same school,
 * qualification and end year: the usual sign of a hand-entered copy of a
 * seeded document. `bun run doctor` cleans up existing ones.
 */
async function findDuplicate(
  document: SanityDocument | undefined,
  context: ValidationContext
): Promise<true | string> {
  const institution = text(document?.institution);
  const degree = text(document?.degree);
  const endYear = document?.endYear;
  if (!document || !institution || !degree || typeof endYear !== "number") {
    return true;
  }
  const publishedId = document._id.replace(/^drafts\./, "");
  const candidates = await context
    .getClient({ apiVersion })
    .fetch<EducationKey[]>(
      `*[_type == "education" && endYear == $endYear && _id != $publishedId]{ _id, institution, degree }`,
      { endYear, publishedId },
      { perspective: "published" }
    );
  const duplicate = candidates.find(
    (candidate) =>
      normalizeName(candidate.institution ?? "") ===
        normalizeName(institution) &&
      normalizeName(candidate.degree ?? "") === normalizeName(degree)
  );
  return duplicate
    ? `Another published entry (${duplicate._id}) has the same institution, degree and end year. Run \`bun run doctor\` to find duplicates.`
    : true;
}

export const education = defineType({
  name: "education",
  title: "Education",
  type: "document",
  icon: GraduationCap,
  validation: (rule) =>
    rule
      .custom((document, context) => findDuplicate(document, context))
      .warning(),
  fields: [
    defineField({
      name: "institution",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "degree",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "location",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "startYear",
      type: "number",
      validation: (rule) => rule.integer(),
    }),
    defineField({
      name: "endYear",
      type: "number",
      validation: (rule) => rule.required().integer(),
    }),
    defineField({
      name: "score",
      type: "string",
      description: 'e.g. "CPI 7.22" or "87.6%".',
    }),
    defineField({ name: "order", type: "number" }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "displayOrder",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      degree: "degree",
      institution: "institution",
      endYear: "endYear",
    },
    prepare: ({ degree, institution, endYear }) => ({
      title: degree,
      subtitle: [institution, endYear].filter(Boolean).join(" · "),
    }),
  },
});
