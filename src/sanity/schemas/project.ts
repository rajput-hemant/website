import { defineField, defineType } from 'sanity';
import { restrictedBlockContent } from './block-content';

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: restrictedBlockContent,
    }),
    defineField({
      name: 'stack',
      title: 'Stack',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'github',
      title: 'GitHub',
      type: 'url',
    }),
    defineField({
      name: 'live',
      title: 'Live URL',
      type: 'url',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
      description:
        'Shown in the "Selected projects" section on the homepage (max 4) and listed first on /projects.',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      description:
        'Active: currently being developed. Maintained: stable, updated as needed. Archived: no longer maintained. WIP: in progress, not finished.',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Maintained', value: 'maintained' },
          { title: 'Archived', value: 'archived' },
          { title: 'WIP', value: 'wip' },
        ],
      },
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Sort position among projects. Lower numbers appear first.',
    }),
  ],
  orderings: [
    {
      title: 'Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'tagline',
    },
  },
});
