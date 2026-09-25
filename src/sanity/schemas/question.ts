import { defineField, defineType } from 'sanity';
import { askConfig, REACTION_KEYS, REACTIONS } from '../../lib/ask/config';

export const authorKindOptions = {
  list: [
    { title: 'Anonymous', value: 'anonymous' },
    { title: 'GitHub', value: 'github' },
    { title: 'Google', value: 'google' },
    { title: 'Dev', value: 'dev' },
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
      validation: (rule) =>
        rule
          .max(askConfig.body.max)
          .custom((value, context) =>
            value || context.document?.deletedAt ? true : 'Required',
          ),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      description:
        'Anonymous messages start pending; signed-in messages start published.',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Published', value: 'published' },
          { title: 'Hidden', value: 'hidden' },
          { title: 'Flagged', value: 'spam' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'thread',
      title: 'Thread',
      type: 'reference',
      to: [{ type: 'question' }],
      weak: true,
      readOnly: true,
      description: 'Set for replies, empty for thread starters.',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      readOnly: true,
      hidden: ({ document }) => Boolean(document?.thread),
      description: 'Thread starters only. Generated at submission.',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'object',
      readOnly: true,
      fields: [
        defineField({
          name: 'kind',
          title: 'Kind',
          type: 'string',
          options: authorKindOptions,
        }),
        defineField({ name: 'name', title: 'Display name', type: 'string' }),
        defineField({
          name: 'providerId',
          title: 'Provider ID',
          type: 'string',
          description:
            'Private: namespaced account id or anonymous cookie id, e.g. github:123.',
        }),
        defineField({ name: 'avatarUrl', title: 'Avatar URL', type: 'url' }),
        defineField({
          name: 'avatarSeed',
          title: 'Avatar seed',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted at',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'editedAt',
      title: 'Edited at',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'deletedAt',
      title: 'Deleted at',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'reactions',
      title: 'Reactions',
      type: 'array',
      readOnly: true,
      of: [
        {
          type: 'object',
          name: 'reaction',
          fields: [
            defineField({
              name: 'emoji',
              title: 'Emoji',
              type: 'string',
              options: {
                list: REACTION_KEYS.map((key) => ({
                  title: `${REACTIONS[key].emoji} ${REACTIONS[key].label}`,
                  value: key,
                })),
              },
            }),
            defineField({
              name: 'providerId',
              title: 'Provider ID',
              type: 'string',
              description: 'Private: who reacted.',
            }),
          ],
          preview: { select: { title: 'emoji', subtitle: 'providerId' } },
        },
      ],
    }),
    defineField({
      name: 'moderation',
      title: 'Moderation',
      type: 'object',
      readOnly: true,
      description: 'Private: set at submission.',
      fields: [
        defineField({
          name: 'heuristicsScore',
          title: 'Heuristics score',
          type: 'number',
        }),
        defineField({ name: 'botid', title: 'BotID result', type: 'string' }),
        defineField({
          name: 'ipHash',
          title: 'IP hash',
          type: 'string',
          description: 'Salted SHA-256, 12 characters.',
        }),
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
      thread: 'thread._ref',
      name: 'author.name',
      kind: 'author.kind',
    },
    prepare: ({ body, status, thread, name, kind }) => ({
      title: typeof body === 'string' && body ? body : 'Message deleted',
      subtitle: [status, thread ? 'reply' : 'question', name ?? kind]
        .filter(Boolean)
        .join(' · '),
    }),
  },
});
