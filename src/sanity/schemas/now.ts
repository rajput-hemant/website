import { defineField, defineType } from 'sanity';

export const now = defineType({
  name: 'now',
  title: 'Now',
  type: 'document',
  fields: [
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Text',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'link',
              title: 'Link',
              type: 'url',
            }),
          ],
          preview: {
            select: { title: 'text', subtitle: 'link' },
          },
        },
      ],
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated at',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Now' }),
  },
});
