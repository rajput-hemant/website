import { defineField, defineType } from "sanity";

export const link = defineType({
  name: "link",
  title: "Link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      validation: (rule) =>
        rule.required().uri({ scheme: ["http", "https", "mailto"] }),
    }),
  ],
  preview: { select: { title: "label", subtitle: "url" } },
});
