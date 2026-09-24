import { defineLocations } from 'sanity/presentation';
import type { PresentationPluginOptions } from 'sanity/presentation';

export const presentationResolve: NonNullable<
  PresentationPluginOptions['resolve']
> = {
  locations: {
    profile: defineLocations({
      select: { name: 'name' },
      resolve: () => ({ locations: [{ title: 'Home', href: '/' }] }),
    }),
    experience: defineLocations({
      select: { company: 'company' },
      resolve: (doc) => ({
        locations: [
          {
            title: typeof doc?.company === 'string' ? doc.company : 'Work',
            href: '/work',
          },
        ],
      }),
    }),
    project: defineLocations({
      select: { name: 'name' },
      resolve: (doc) => ({
        locations: [
          {
            title: typeof doc?.name === 'string' ? doc.name : 'Projects',
            href: '/projects',
          },
        ],
      }),
    }),
    now: defineLocations({
      select: { updatedAt: 'updatedAt' },
      resolve: () => ({ locations: [{ title: 'Now', href: '/now' }] }),
    }),
    update: defineLocations({
      select: { text: 'text' },
      resolve: (doc) => ({
        locations: [
          {
            title: typeof doc?.text === 'string' ? doc.text : 'Changelog',
            href: '/changelog',
          },
        ],
      }),
    }),
    skillGroup: defineLocations({
      select: { title: 'title' },
      resolve: () => ({
        locations: [{ title: 'Skills on Work', href: '/work' }],
      }),
    }),
    education: defineLocations({
      select: { institution: 'institution' },
      resolve: () => ({
        locations: [{ title: 'Education on Work', href: '/work' }],
      }),
    }),
  },
};
