import { defineField, defineType } from 'sanity';
import { authorKindOptions } from './question';

export const askAuthor = defineType({
  name: 'askAuthor',
  title: 'Ask author',
  type: 'document',
  description:
    'Private: written by the API for signed-in users, never rendered.',
  readOnly: true,
  fields: [
    defineField({ name: 'providerId', title: 'Provider ID', type: 'string' }),
    defineField({
      name: 'kind',
      title: 'Kind',
      type: 'string',
      options: authorKindOptions,
    }),
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({
      name: 'lastSeenAt',
      title: 'Last seen at',
      type: 'datetime',
    }),
  ],
});
