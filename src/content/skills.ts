export const skills = [
  {
    title: 'Languages',
    items: ['JavaScript', 'TypeScript', 'Rust', 'Go'],
    order: 1,
  },
  {
    title: 'Frontend',
    items: [
      'HTML',
      'CSS',
      'React',
      'Next.js',
      'Vue',
      'Svelte',
      'SvelteKit',
      'Qwik',
      'QwikCity',
      'Three.js',
      'R3F',
      'React Query',
      'SWR',
      'Drizzle',
      'Zustand',
      'Jotai',
      'WebSockets',
      'Tailwind',
      'PWA',
      'Markdown',
    ],
    order: 2,
  },
  {
    title: 'Backend',
    items: ['Node', 'Bun', 'Hono'],
    order: 3,
  },
  {
    title: 'Databases',
    items: ['MySQL', 'PostgreSQL', 'Firebase', 'Supabase'],
    order: 4,
  },
  {
    title: 'Other',
    items: ['Git', 'GitHub', 'CI/CD', 'Docker', 'Vercel', 'Netlify', 'SEO'],
    order: 5,
  },
] as const;

export type SkillGroup = (typeof skills)[number];
