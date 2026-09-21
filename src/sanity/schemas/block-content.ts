import { defineArrayMember } from 'sanity';

/**
 * Restricted Portable Text: paragraph + strong/em/code/link only.
 * Kept narrow so the markdown mirror and resume renderers stay honest.
 */
export const restrictedBlockContent = [
  defineArrayMember({
    type: 'block',
    styles: [{ title: 'Normal', value: 'normal' }],
    lists: [],
    marks: {
      decorators: [
        { title: 'Strong', value: 'strong' },
        { title: 'Emphasis', value: 'em' },
        { title: 'Code', value: 'code' },
      ],
      annotations: [
        {
          name: 'link',
          type: 'object',
          title: 'Link',
          fields: [
            {
              name: 'href',
              type: 'url',
              title: 'URL',
              validation: (rule) =>
                rule.uri({
                  allowRelative: true,
                  scheme: ['http', 'https', 'mailto'],
                }),
            },
          ],
        },
      ],
    },
  }),
];
