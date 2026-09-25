import { BriefcaseBusiness } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

import { formatMonthRange } from "./preview-format";

export const employmentTypes = [
  { title: "Full-time", value: "full-time" },
  { title: "Part-time", value: "part-time" },
  { title: "Contract", value: "contract" },
  { title: "Freelance", value: "freelance" },
];

export const experience = defineType({
  name: "experience",
  title: "Experience",
  type: "document",
  icon: BriefcaseBusiness,
  fields: [
    defineField({
      name: "company",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "companyUrl", title: "Company URL", type: "url" }),
    defineField({
      name: "companyBlurb",
      type: "string",
      description: "One sentence on what the company does.",
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "location",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "remote", type: "boolean", initialValue: true }),
    defineField({
      name: "employmentType",
      type: "string",
      options: {
        list: employmentTypes,
        layout: "radio",
        direction: "horizontal",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "employmentNote",
      type: "string",
      description:
        'Optional qualifier, e.g. "Part-time, then Full-time from Dec 2024".',
    }),
    defineField({
      name: "startDate",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "endDate",
      type: "date",
      description: "Leave empty for a current role.",
      validation: (rule) =>
        rule.custom((endDate, context) => {
          const startDate = (context.document as { startDate?: string })
            .startDate;
          return endDate && startDate && endDate < startDate
            ? "End date is before the start date"
            : true;
        }),
    }),
    defineField({
      name: "endNote",
      type: "string",
      description: 'Why it ended, if worth saying, e.g. "company sunset".',
    }),
    defineField({
      name: "continuedInto",
      type: "reference",
      to: [{ type: "experience" }],
      description:
        "The role this one moved into with the same team or manager.",
      options: {
        filter: ({ document }) => ({
          filter: "_id != $self && _id != $draft",
          params: {
            self: document._id.replace(/^drafts\./, ""),
            draft: `drafts.${document._id.replace(/^drafts\./, "")}`,
          },
        }),
      },
    }),
    defineField({
      name: "continuationNote",
      type: "string",
      description: 'e.g. "moved with the same team".',
      hidden: ({ document }) => !document?.continuedInto,
    }),
    defineField({ name: "body", type: "richText" }),
    defineField({
      name: "highlights",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
  ],
  orderings: [
    {
      title: "Start date, newest first",
      name: "startDateDesc",
      by: [{ field: "startDate", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      company: "company",
      title: "title",
      startDate: "startDate",
      endDate: "endDate",
    },
    prepare: ({ company, title, startDate, endDate }) => ({
      title: company,
      subtitle: `${title ?? "Untitled role"} · ${formatMonthRange(startDate, endDate)}`,
    }),
  },
});
