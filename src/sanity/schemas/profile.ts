import { defineField, defineType } from 'sanity';
import { restrictedBlockContent } from './block-content';

export const profile = defineType({
  name: 'profile',
  title: 'Profile',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: restrictedBlockContent,
    }),
    defineField({
      name: 'availability',
      title: 'Availability',
      type: 'string',
    }),
    defineField({
      name: 'avatar',
      title: 'Avatar',
      type: 'image',
      description:
        'Stylized or illustrated only, never a raw photograph. Leave empty and the layout adapts.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (rule) =>
                rule.required().uri({ scheme: ['http', 'https', 'mailto'] }),
            }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'url' },
          },
        },
      ],
    }),
    defineField({
      name: 'resumeNote',
      title: 'Resume note',
      type: 'string',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'headline', media: 'avatar' },
  },
});
