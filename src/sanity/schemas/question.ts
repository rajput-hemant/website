import { defineField, defineType } from 'sanity';
import { restrictedBlockContent } from './block-content';

const statusOptions = {
  list: [
    { title: 'Pending', value: 'pending' },
    { title: 'Unreviewed', value: 'unreviewed' },
    { title: 'Published', value: 'published' },
    { title: 'Rejected', value: 'rejected' },
    { title: 'Spam', value: 'spam' },
  ],
};

export const question = defineType({
  name: 'question',
  title: 'Question',
  type: 'document',
  fields: [
    defineField({
      name: 'body',
      title: 'Message',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().min(10).max(1000),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'object',
      validation: (rule) => rule.required(),
      fields: [
        defineField({
          name: 'kind',
          title: 'Kind',
          type: 'string',
          options: {
            list: [
              { title: 'Anonymous', value: 'anonymous' },
              { title: 'GitHub', value: 'github' },
              { title: 'Google', value: 'google' },
            ],
          },
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'name',
          title: 'Display name',
          type: 'string',
          description: 'Optional. Shown publicly next to the message.',
          validation: (rule) => rule.max(60),
        }),
        defineField({
          name: 'providerId',
          title: 'Provider ID',
          type: 'string',
          readOnly: true,
          description:
            'Private: the provider account id, or the anonymous cookie id. Set at submission.',
        }),
        defineField({
          name: 'email',
          title: 'Email',
          type: 'string',
          readOnly: true,
          description: 'Private: never rendered publicly. Set at submission.',
        }),
        defineField({
          name: 'avatarUrl',
          title: 'Avatar URL',
          type: 'url',
          readOnly: true,
          description: 'Not rendered at launch. Set at submission.',
        }),
        defineField({
          name: 'accountCreatedAt',
          title: 'Account created at',
          type: 'datetime',
          readOnly: true,
          description:
            'GitHub account creation date, used for the sign-in age check.',
        }),
      ],
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      description:
        'Anonymous messages default to pending; signed-in messages default to unreviewed.',
      options: { ...statusOptions, layout: 'radio' },
      initialValue: 'pending',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'array',
      of: restrictedBlockContent,
    }),
    defineField({
      name: 'replies',
      title: 'Replies',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'reply',
          fields: [
            defineField({
              name: 'by',
              title: 'By',
              type: 'string',
              options: {
                list: [
                  { title: 'Owner', value: 'owner' },
                  { title: 'Visitor', value: 'visitor' },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'createdAt',
              title: 'Created at',
              type: 'datetime',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'status',
              title: 'Status',
              type: 'string',
              options: statusOptions,
            }),
          ],
          preview: {
            select: { title: 'body', subtitle: 'by' },
          },
        },
      ],
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description:
        'Generated at submission as an 8-character id; not editable in Studio.',
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'about',
      title: 'About',
      type: 'reference',
      to: [{ type: 'project' }, { type: 'update' }],
      description: 'Optional. Unused by the public UI at launch.',
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted at',
      type: 'datetime',
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      readOnly: true,
      description: 'Set automatically by the Publish action.',
    }),
    defineField({
      name: 'closedAt',
      title: 'Closed at',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'moderation',
      title: 'Moderation',
      type: 'object',
      readOnly: true,
      description:
        'Private: set by the submission process, not editable in Studio.',
      fields: [
        defineField({
          name: 'heuristicsScore',
          title: 'Heuristics score',
          type: 'number',
        }),
        defineField({
          name: 'perspective',
          title: 'Perspective scores',
          type: 'object',
          fields: [
            defineField({
              name: 'toxicity',
              title: 'Toxicity',
              type: 'number',
            }),
            defineField({
              name: 'severeToxicity',
              title: 'Severe toxicity',
              type: 'number',
            }),
            defineField({ name: 'threat', title: 'Threat', type: 'number' }),
          ],
        }),
        defineField({ name: 'botid', title: 'BotID result', type: 'string' }),
        defineField({
          name: 'ipHash',
          title: 'IP hash',
          type: 'string',
          description: 'Salted SHA-256, 12 characters.',
        }),
        defineField({ name: 'ua', title: 'User agent', type: 'string' }),
        defineField({ name: 'elapsedMs', title: 'Elapsed ms', type: 'number' }),
      ],
    }),
  ],
  orderings: [
    {
      title: 'Submitted, newest',
      name: 'submittedAtDesc',
      by: [{ field: 'submittedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      body: 'body',
      status: 'status',
      name: 'author.name',
      kind: 'author.kind',
    },
    prepare: ({ body, status, name, kind }) => ({
      title: typeof body === 'string' ? body : 'Untitled message',
      subtitle: [status, name ?? kind].filter(Boolean).join(' · '),
    }),
  },
});
