import { MessageCircleQuestion } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

export const questionStatuses = [
  { title: "Pending", value: "pending" },
  { title: "Published", value: "published" },
  { title: "Rejected", value: "rejected" },
  { title: "Spam", value: "spam" },
] as const;

export type QuestionStatusValue = (typeof questionStatuses)[number]["value"];

const PRIVATE = "Private: never selected by public queries or rendered.";

const moderationFields = [
  defineField({
    name: "score",
    title: "Heuristics score",
    type: "number",
  }),
  defineField({
    name: "reasons",
    type: "array",
    of: [defineArrayMember({ type: "string" })],
  }),
  defineField({
    name: "ipHash",
    title: "IP hash",
    type: "string",
    description: "Salted SHA-256, truncated.",
  }),
  defineField({ name: "ua", title: "User agent", type: "string" }),
  defineField({
    name: "elapsedMs",
    title: "Time to submit (ms)",
    type: "number",
  }),
];

export const question = defineType({
  name: "question",
  title: "Question",
  type: "document",
  icon: MessageCircleQuestion,
  groups: [
    { name: "thread", title: "Thread", default: true },
    { name: "private", title: "Private" },
  ],
  fields: [
    defineField({
      name: "body",
      type: "text",
      rows: 5,
      group: "thread",
      validation: (rule) => rule.required().min(10).max(1000),
    }),
    defineField({
      name: "author",
      type: "object",
      group: ["thread", "private"],
      fields: [
        defineField({
          name: "kind",
          type: "string",
          options: {
            list: [
              { title: "Anonymous", value: "anonymous" },
              { title: "Owner", value: "owner" },
            ],
          },
          initialValue: "anonymous",
          readOnly: true,
        }),
        defineField({
          name: "name",
          title: "Display name",
          type: "string",
          validation: (rule) => rule.max(60),
        }),
        defineField({
          name: "email",
          type: "string",
          description: PRIVATE,
          readOnly: true,
        }),
        defineField({
          name: "anonId",
          title: "Anonymous id",
          type: "string",
          description: `${PRIVATE} The signed visitor cookie id.`,
          readOnly: true,
        }),
      ],
    }),
    defineField({
      name: "status",
      type: "string",
      group: "thread",
      options: {
        list: [...questionStatuses],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "pending",
      description:
        'Status of the opening message. Use the "Publish", "Reject" and "Mark spam" actions rather than editing this.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "answer",
      title: "Legacy answer",
      type: "richText",
      group: "thread",
      description:
        "Replaced by owner replies. `bun run doctor --fix` copies it into the thread; reply below instead.",
      readOnly: true,
      hidden: ({ value }) => !Array.isArray(value) || value.length === 0,
    }),
    defineField({
      name: "replies",
      type: "array",
      group: "thread",
      of: [
        defineArrayMember({
          name: "reply",
          type: "object",
          fields: [
            defineField({
              name: "by",
              type: "string",
              options: {
                list: [
                  { title: "Owner", value: "owner" },
                  { title: "Visitor", value: "visitor" },
                ],
                layout: "radio",
                direction: "horizontal",
              },
              initialValue: "owner",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "body",
              type: "text",
              rows: 3,
              // Above the 1000-character composer limit so migrated legacy answers fit.
              validation: (rule) => rule.required().min(1).max(4000),
            }),
            defineField({
              name: "authorName",
              title: "Display name",
              type: "string",
              validation: (rule) => rule.max(60),
            }),
            defineField({
              name: "createdAt",
              type: "datetime",
              initialValue: () => new Date().toISOString(),
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "status",
              type: "string",
              description:
                'Only published replies are public. Change it here and publish, or use "Approve replies".',
              options: {
                list: [...questionStatuses],
                layout: "radio",
                direction: "horizontal",
              },
              initialValue: "published",
            }),
            defineField({
              name: "anonId",
              title: "Anonymous id",
              type: "string",
              description: `${PRIVATE} The signed visitor cookie id.`,
              readOnly: true,
              hidden: ({ value }) => !value,
            }),
            defineField({
              name: "moderation",
              type: "object",
              description: PRIVATE,
              readOnly: true,
              hidden: ({ value }) => !value,
              options: { collapsible: true, collapsed: true },
              fields: moderationFields,
            }),
          ],
          preview: {
            select: {
              by: "by",
              name: "authorName",
              body: "body",
              status: "status",
            },
            prepare: ({ by, name, body, status }) => ({
              title: body,
              subtitle: [status ?? "published", name ?? by]
                .filter(Boolean)
                .join(" · "),
            }),
          },
        }),
      ],
    }),
    defineField({
      name: "slug",
      type: "string",
      group: "thread",
      description: "8-character permalink id, generated at submission.",
      readOnly: true,
      validation: (rule) => rule.required().length(8),
    }),
    defineField({
      name: "submittedAt",
      type: "datetime",
      group: "thread",
      readOnly: true,
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      group: "thread",
      description: "Set when the opening message is first published.",
      readOnly: true,
    }),
    defineField({
      name: "lastActivityAt",
      title: "Last activity",
      type: "datetime",
      group: "thread",
      description:
        "Latest published message in the thread; orders the /ask feed.",
      readOnly: true,
    }),
    defineField({
      name: "moderation",
      type: "object",
      group: "private",
      description: PRIVATE,
      readOnly: true,
      options: { collapsible: true, collapsed: true },
      fields: moderationFields,
    }),
  ],
  orderings: [
    {
      title: "Last activity, newest first",
      name: "lastActivityAtDesc",
      by: [
        { field: "lastActivityAt", direction: "desc" },
        { field: "submittedAt", direction: "desc" },
      ],
    },
    {
      title: "Submitted, newest first",
      name: "submittedAtDesc",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      body: "body",
      name: "author.name",
      status: "status",
      submittedAt: "submittedAt",
    },
    prepare: ({ body, name, status, submittedAt }) => ({
      title: body,
      subtitle: [
        status,
        name ?? "anonymous",
        typeof submittedAt === "string" ? submittedAt.slice(0, 10) : undefined,
      ]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});
