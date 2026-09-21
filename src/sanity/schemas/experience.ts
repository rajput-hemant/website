import { defineField, defineType } from 'sanity';
import { restrictedBlockContent } from './block-content';

export const experience = defineType({
  name: 'experience',
  title: 'Experience',
  type: 'document',
  fields: [
    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'companyUrl',
      title: 'Company URL',
      type: 'url',
    }),
    defineField({
      name: 'companyBlurb',
      title: 'Company blurb',
      type: 'string',
      description: 'One sentence about the company.',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'remote',
      title: 'Remote',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'employmentType',
      title: 'Employment type',
      type: 'string',
      options: {
        list: [
          { title: 'Full-time', value: 'Full-time' },
          { title: 'Part-time', value: 'Part-time' },
          { title: 'Contract', value: 'Contract' },
          { title: 'Freelance', value: 'Freelance' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'startDate',
      title: 'Start date',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'End date',
      type: 'date',
    }),
    defineField({
      name: 'endNote',
      title: 'End note',
      type: 'string',
      description: 'e.g. "company sunset"',
    }),
    defineField({
      name: 'continuedInto',
      title: 'Continued into',
      type: 'reference',
      to: [{ type: 'experience' }],
    }),
    defineField({
      name: 'continuationNote',
      title: 'Continuation note',
      type: 'string',
      description: 'e.g. "moved with the same team"',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: restrictedBlockContent,
    }),
    defineField({
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
    }),
  ],
  orderings: [
    {
      title: 'Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Start date, newest',
      name: 'startDateDesc',
      by: [{ field: 'startDate', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'company',
      subtitle: 'title',
    },
  },
});
