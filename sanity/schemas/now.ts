import { Sparkles } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

export const now = defineType({
  name: "now",
  title: "Now",
  type: "document",
  icon: Sparkles,
  fields: [
    defineField({
      name: "items",
      type: "array",
      of: [
        defineArrayMember({
          name: "nowItem",
          type: "object",
          fields: [
            defineField({
              name: "text",
              type: "string",
              validation: (rule) => rule.required().max(200),
            }),
            defineField({
              name: "link",
              title: "Link (optional)",
              type: "url",
            }),
          ],
          preview: { select: { title: "text", subtitle: "link" } },
        }),
      ],
    }),
    defineField({
      name: "updatedAt",
      title: "Updated",
      type: "date",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { updatedAt: "updatedAt" },
    prepare: ({ updatedAt }) => ({
      title: "Now",
      subtitle: updatedAt ? `Updated ${updatedAt}` : undefined,
    }),
  },
});
