import { History } from "lucide-react";
import { defineField, defineType } from "sanity";

export const updateCategories = [
  { title: "Project", value: "project" },
  { title: "Work", value: "work" },
  { title: "Site", value: "site" },
  { title: "Learning", value: "learning" },
  { title: "Life", value: "life" },
];

export const update = defineType({
  name: "update",
  title: "Changelog entry",
  type: "document",
  icon: History,
  fields: [
    defineField({
      name: "date",
      type: "date",
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "text",
      type: "string",
      description: "One line.",
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: "category",
      type: "string",
      options: {
        list: updateCategories,
        layout: "radio",
        direction: "horizontal",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "link", type: "url" }),
  ],
  orderings: [
    {
      title: "Date, newest first",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
  preview: {
    select: { text: "text", date: "date", category: "category" },
    prepare: ({ text, date, category }) => ({
      title: text,
      subtitle: [date, category].filter(Boolean).join(" · "),
    }),
  },
});
