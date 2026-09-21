import { defineField, defineType } from 'sanity';

export const update = defineType({
  name: 'update',
  title: 'Changelog entry',
  type: 'document',
  fields: [
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'string',
      description: 'One line.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Project', value: 'project' },
          { title: 'Work', value: 'work' },
          { title: 'Site', value: 'site' },
          { title: 'Learning', value: 'learning' },
          { title: 'Life', value: 'life' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'url',
    }),
  ],
  orderings: [
    {
      title: 'Date, newest',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'text',
      subtitle: 'date',
    },
  },
});
