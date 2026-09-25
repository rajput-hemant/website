import { GraduationCap } from "lucide-react";
import { defineField, defineType } from "sanity";

export const education = defineType({
  name: "education",
  title: "Education",
  type: "document",
  icon: GraduationCap,
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
