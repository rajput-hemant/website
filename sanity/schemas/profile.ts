import { UserRound } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

export const profile = defineType({
  name: "profile",
  title: "Profile",
  type: "document",
  icon: UserRound,
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "headline",
      type: "string",
      description: "One line under the name on the home page.",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({ name: "bio", type: "richText" }),
    defineField({
      name: "availability",
      type: "string",
      description: 'Optional, e.g. "Open to senior frontend roles".',
    }),
    defineField({
      name: "avatar",
      type: "image",
      description:
        "Stylized or illustrated only, never a raw photograph. Leave empty and the layout adapts.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          validation: (rule) =>
            rule.custom((alt, context) => {
              const parent = context.parent as { asset?: unknown } | undefined;
              return parent?.asset && !alt
                ? "Describe the avatar for screen readers"
                : true;
            }),
        }),
      ],
    }),
    defineField({
      name: "location",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "email",
      type: "string",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "links",
      type: "array",
      of: [defineArrayMember({ type: "link" })],
    }),
    defineField({
      name: "resumeNote",
      type: "string",
      description: "Optional line shown on /resume.",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "headline", media: "avatar" },
  },
});
