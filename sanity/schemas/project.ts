import { FolderGit2 } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

export const projectStatuses = [
  { title: "Active", value: "active" },
  { title: "Maintained", value: "maintained" },
  { title: "Work in progress", value: "wip" },
  { title: "Archived", value: "archived" },
];

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  icon: FolderGit2,
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name", maxLength: 64 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "description",
      type: "richText",
      description: "Short: one or two paragraphs.",
    }),
    defineField({
      name: "stack",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
    defineField({ name: "github", title: "GitHub URL", type: "url" }),
    defineField({ name: "live", title: "Live URL", type: "url" }),
    defineField({ name: "featured", type: "boolean", initialValue: false }),
    defineField({
      name: "status",
      type: "string",
      options: {
        list: projectStatuses,
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "active",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "year",
      type: "number",
      validation: (rule) => rule.required().integer().min(2000).max(2100),
    }),
    defineField({
      name: "order",
      type: "number",
      description: "Lower comes first, after featured projects.",
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "displayOrder",
      by: [
        { field: "featured", direction: "desc" },
        { field: "order", direction: "asc" },
      ],
    },
    {
      title: "Year, newest first",
      name: "yearDesc",
      by: [{ field: "year", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      name: "name",
      tagline: "tagline",
      featured: "featured",
      year: "year",
    },
    prepare: ({ name, tagline, featured, year }) => ({
      title: featured ? `★ ${name}` : name,
      subtitle: [year, tagline].filter(Boolean).join(" · "),
    }),
  },
});
