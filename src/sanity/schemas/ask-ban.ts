import { defineField, defineType } from 'sanity';
import { authorKindOptions } from './question';

export const askBan = defineType({
  name: 'askBan',
  title: 'Banned user',
  type: 'document',
  description: 'Private: created by the Ban author action.',
  fields: [
    defineField({
      name: 'providerId',
      title: 'Provider ID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'kind',
      title: 'Kind',
      type: 'string',
      options: authorKindOptions,
      readOnly: true,
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      readOnly: true,
      description: 'Private: never rendered.',
    }),
    defineField({
      name: 'ipHash',
      title: 'IP hash',
      type: 'string',
      readOnly: true,
    }),
    defineField({ name: 'reason', title: 'Reason', type: 'text', rows: 3 }),
    defineField({
      name: 'bannedAt',
      title: 'Banned at',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: 'Banned, newest',
      name: 'bannedAtDesc',
      by: [{ field: 'bannedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      name: 'name',
      providerId: 'providerId',
      kind: 'kind',
      bannedAt: 'bannedAt',
    },
    prepare: ({ name, providerId, kind, bannedAt }) => ({
      title: name ?? providerId,
      subtitle: [kind, typeof bannedAt === 'string' && bannedAt.slice(0, 10)]
        .filter(Boolean)
        .join(' · '),
    }),
  },
});
