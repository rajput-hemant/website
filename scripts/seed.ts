import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../src/sanity/env';
import type {
  Education,
  Experience,
  Now,
  Profile,
  Project,
  SkillGroup,
  Update,
} from '../src/sanity/types';
import { writeEnv } from './env';

type PortableTextBlock = NonNullable<Experience['body']>[number];

const skills = [
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

const education = [
  {
    institution: 'GLA University',
    degree: 'B.Tech Computer Science and Engineering',
    location: 'Chaumuhan, Mathura',
    startYear: 2020,
    endYear: 2024,
    score: 'CPI 7.22',
    order: 1,
  },
  {
    institution: 'Gyan Deep Shiksha Bharati',
    degree: 'Intermediate (CBSE)',
    location: 'Mathura',
    startYear: 2020,
    endYear: 2020,
    score: '75.8%',
    order: 2,
  },
  {
    institution: 'Gyan Deep Shiksha Bharati',
    degree: 'Matriculation',
    location: 'Mathura',
    startYear: 2018,
    endYear: 2018,
    score: '87.6%',
    order: 3,
  },
] as const;

function paragraph(text: string, key: string): PortableTextBlock {
  return {
    _type: 'block',
    _key: key,
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: `${key}-span`,
        text,
        marks: [],
      },
    ],
  };
}

const experienceBodies = {
  'experience-zunta': [
    paragraph(
      'Zunta (Codeblue Ventures) automates private-pay billing for skilled nursing facilities. Fullstack Engineer, Lakewood NJ (remote), Jan 2026 to present. Continued from Proghit with my manager.',
      'zunta-body-1',
    ),
  ],
  'experience-blai': [
    paragraph(
      'Blai App (Blai Inc. Labs) was an AI crypto advisor. Full-stack Developer (React Native), Cambridge MA (remote), Sept 2025 to May 2026 (company sunset). Continued from FastLane with the same team.',
      'blai-body-1',
    ),
  ],
  'experience-proghit': [
    paragraph(
      'Client projects at Proghit Inc (Simple, Gizber, Kriah). Sr. Fullstack Engineer (Frontend Lead), New York NY (remote), Sept 2024 to Jan 2026. Continued into Zunta with my manager.',
      'proghit-body-1',
    ),
  ],
  'experience-lightwork': [
    paragraph(
      'Lightwork AI (Lightwork Holding LTD) builds Felicity, an AI property-management assistant. Product Engineer (Frontend Lead), London UK (remote), Sept 2024 to July 2025 (part-time, then full-time from Dec 2024).',
      'lightwork-body-1',
    ),
  ],
  'experience-fastlane': [
    paragraph(
      'FastLane (Reddy Builders) is an on-chain game on Oasis Network. Lead Frontend Engineer, Boston MA (remote), June 2024 to Sept 2025. Continued into Blai with the same team.',
      'fastlane-body-1',
    ),
  ],
  'experience-mixr': [
    paragraph(
      'MixR (MixR Holdings, Inc) is a community-first marketplace. Frontend Developer, Houston TX (remote), July 2024 to Feb 2025.',
      'mixr-body-1',
    ),
  ],
} satisfies Record<string, PortableTextBlock[]>;

type SeedDocument<T> = T extends unknown
  ? Omit<T, '_createdAt' | '_updatedAt' | '_rev'>
  : never;

type PortfolioDocument = SeedDocument<
  Profile | Now | Experience | Project | Update | SkillGroup | Education
>;

const experiences = [
  {
    _id: 'experience-zunta',
    _type: 'experience',
    company: 'Zunta (Codeblue Ventures)',
    companyUrl: 'https://codeblue.ventures',
    companyBlurb:
      'Healthcare fintech automating private-pay billing for skilled nursing facilities.',
    title: 'Fullstack Engineer',
    location: 'Lakewood, NJ, USA',
    remote: true,
    employmentType: 'Full-time',
    startDate: '2026-01-01',
    body: experienceBodies['experience-zunta'],
  },
  {
    _id: 'experience-blai',
    _type: 'experience',
    company: 'Blai App (Blai Inc. Labs)',
    companyBlurb: 'AI crypto advisor app.',
    title: 'Full-stack Developer (React Native)',
    location: 'Cambridge, MA, USA',
    remote: true,
    employmentType: 'Part-time',
    startDate: '2025-09-01',
    endDate: '2026-05-01',
    endNote: 'company sunset',
    body: experienceBodies['experience-blai'],
  },
  {
    _id: 'experience-proghit',
    _type: 'experience',
    company: 'Proghit Inc',
    companyBlurb: 'Client projects including Simple, Gizber, and Kriah.',
    title: 'Sr. Fullstack Engineer (Frontend Lead)',
    location: 'New York, NY, USA',
    remote: true,
    employmentType: 'Freelance',
    startDate: '2024-09-01',
    endDate: '2026-01-01',
    continuedInto: {
      _type: 'reference',
      _ref: 'experience-zunta',
    },
    continuationNote: 'moved with my manager',
    body: experienceBodies['experience-proghit'],
  },
  {
    _id: 'experience-lightwork',
    _type: 'experience',
    company: 'Lightwork AI (Lightwork Holding LTD)',
    companyUrl: 'https://lightwork.co',
    companyBlurb: 'Felicity, an AI property-management assistant.',
    title: 'Product Engineer (Frontend Lead)',
    location: 'London, UK',
    remote: true,
    employmentType: 'Part-time',
    startDate: '2024-09-01',
    endDate: '2025-07-01',
    body: experienceBodies['experience-lightwork'],
  },
  {
    _id: 'experience-fastlane',
    _type: 'experience',
    company: 'FastLane (Reddy Builders)',
    companyBlurb: 'On-chain game on Oasis Network.',
    title: 'Lead Frontend Engineer',
    location: 'Boston, MA, USA',
    remote: true,
    employmentType: 'Part-time',
    startDate: '2024-06-01',
    endDate: '2025-09-01',
    continuedInto: {
      _type: 'reference',
      _ref: 'experience-blai',
    },
    continuationNote: 'moved with the same team',
    body: experienceBodies['experience-fastlane'],
  },
  {
    _id: 'experience-mixr',
    _type: 'experience',
    company: 'MixR (MixR Holdings, Inc)',
    companyBlurb: 'Community-first marketplace.',
    title: 'Frontend Developer',
    location: 'Houston, TX, USA',
    remote: true,
    employmentType: 'Contract',
    startDate: '2024-07-01',
    endDate: '2025-02-01',
    body: experienceBodies['experience-mixr'],
  },
] satisfies SeedDocument<Experience>[];

const projects = [
  {
    _id: 'project-infinitunes',
    _type: 'project',
    name: 'Infinitunes',
    slug: { _type: 'slug', current: 'infinitunes' },
    tagline: 'A Simple Music Player Web App',
    description: [
      paragraph(
        'A Simple Music Player Web App built using Next.js, shadcn/ui, TailwindCSS, DrizzleORM and more',
        'infinitunes-desc',
      ),
    ],
    github: 'https://github.com/rajput-hemant/infinitunes',
    order: 1,
  },
  {
    _id: 'project-lipi',
    _type: 'project',
    name: 'Lipi',
    slug: { _type: 'slug', current: 'lipi' },
    tagline: 'Notion-style workspace (WIP)',
    description: [paragraph('A Notion replica in progress.', 'lipi-desc')],
    github: 'https://github.com/rajput-hemant/lipi',
    status: 'wip',
    order: 2,
  },
  {
    _id: 'project-jiosaavn-ts',
    _type: 'project',
    name: 'JioSaavn API',
    slug: { _type: 'slug', current: 'jiosaavn-api' },
    tagline: 'TypeScript API on Hono and Bun',
    description: [
      paragraph(
        'Unofficial JioSaavn API rewritten in TypeScript with Hono on Bun (originally Rust/Axum).',
        'jiosaavn-ts-desc',
      ),
    ],
    stack: ['TypeScript', 'Hono', 'Bun'],
    github: 'https://github.com/rajput-hemant/jiosaavn-api',
    order: 3,
  },
  {
    _id: 'project-jiosaavn-rust',
    _type: 'project',
    name: 'JioSaavn API (Rust)',
    slug: { _type: 'slug', current: 'jiosaavn-api-rust' },
    tagline: 'Original Rust/Axum implementation',
    description: [
      paragraph(
        'The original JioSaavn API written in Rust with Axum.',
        'jiosaavn-rust-desc',
      ),
    ],
    stack: ['Rust', 'Axum'],
    github: 'https://github.com/rajput-hemant/jiosaavn-api-rs',
    order: 4,
  },
  {
    _id: 'project-calculator',
    _type: 'project',
    name: 'Calculator',
    slug: { _type: 'slug', current: 'calculator' },
    tagline: 'Flutter calculator on IzzyOnDroid',
    description: [
      paragraph(
        'A Flutter calculator published on IzzyOnDroid.',
        'calculator-desc',
      ),
    ],
    stack: ['Flutter', 'Dart'],
    github: 'https://github.com/rajput-hemant/calculator',
    order: 5,
  },
  {
    _id: 'project-website',
    _type: 'project',
    name: 'rajputhemant.me',
    slug: { _type: 'slug', current: 'rajputhemant-me' },
    tagline: 'Personal landing and portfolio',
    description: [
      paragraph('This site: landing and portfolio.', 'website-desc'),
    ],
    stack: ['Next.js', 'TypeScript', 'Sanity'],
    github: 'https://github.com/rajput-hemant/website',
    order: 6,
  },
  {
    _id: 'project-leetcode',
    _type: 'project',
    name: 'leetcode',
    slug: { _type: 'slug', current: 'leetcode' },
    tagline: 'VitePress notes, updated every 6 hours',
    description: [
      paragraph(
        'LeetCode solution notes on VitePress, refreshed on a schedule.',
        'leetcode-desc',
      ),
    ],
    stack: ['VitePress', 'Markdown'],
    github: 'https://github.com/rajput-hemant/leetcode',
    order: 7,
  },
  {
    _id: 'project-threejs-journey',
    _type: 'project',
    name: 'Three.js Journey',
    slug: { _type: 'slug', current: 'threejs-journey' },
    tagline: 'React Three Fiber practice',
    description: [
      paragraph('Practice scenes from Three.js Journey with R3F.', 'r3f-desc'),
    ],
    stack: ['Three.js', 'R3F'],
    github: 'https://github.com/rajput-hemant/threejs-journey',
    order: 8,
  },
] satisfies SeedDocument<Project>[];

const profile = {
  _id: 'profile',
  _type: 'profile',
  name: 'Hemant Rajput',
  headline: 'Fullstack engineer',
  bio: [
    paragraph(
      'Fullstack engineer. Currently at Zunta. Building tools and open source on the side.',
      'profile-bio-1',
    ),
  ],
  links: [
    {
      _key: 'github',
      label: 'GitHub',
      url: 'https://github.com/rajput-hemant',
    },
  ],
} satisfies SeedDocument<Profile>;

const nowDoc = {
  _id: 'now',
  _type: 'now',
  items: [
    {
      _key: 'rebuild',
      text: 'Rebuilding this portfolio from scratch with Next.js and Sanity.',
    },
  ],
  updatedAt: '2026-09-21',
} satisfies SeedDocument<Now>;

const changelog = [
  {
    _id: 'update-rebuild-start',
    _type: 'update',
    date: '2026-09-21',
    text: 'Started the portfolio rebuild with a clean Next.js scaffold.',
    category: 'site',
  },
  {
    _id: 'update-zunta',
    _type: 'update',
    date: '2026-01-01',
    text: 'Placeholder date (month only): Joined Zunta as Fullstack Engineer. Confirm the day before publishing.',
    category: 'work',
  },
  {
    _id: 'update-blai-sunset',
    _type: 'update',
    date: '2026-05-01',
    text: 'Placeholder date (month only): Blai App sunset; confirm the day before publishing.',
    category: 'work',
  },
] satisfies SeedDocument<Update>[];

const skillDocs = skills.map((group) => ({
  _id: `skillGroup-${group.title.toLowerCase().replace(/\s+/g, '-')}`,
  _type: 'skillGroup',
  title: group.title,
  items: [...group.items],
  order: group.order,
})) satisfies SeedDocument<SkillGroup>[];

const educationDocs = education.map((entry, index) => ({
  _id: `education-${index + 1}`,
  _type: 'education',
  institution: entry.institution,
  degree: entry.degree,
  location: entry.location,
  startYear: entry.startYear,
  endYear: entry.endYear,
  score: entry.score,
  order: entry.order,
})) satisfies SeedDocument<Education>[];

async function main() {
  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token: writeEnv.SANITY_API_WRITE_TOKEN,
    useCdn: false,
  });

  const docs: PortfolioDocument[] = [
    profile,
    nowDoc,
    ...experiences,
    ...projects,
    ...changelog,
    ...skillDocs,
    ...educationDocs,
  ];

  const transaction = client.transaction();
  for (const doc of docs) {
    if (process.argv.includes('--force')) {
      transaction.createOrReplace<PortfolioDocument>(doc);
    } else {
      transaction.createIfNotExists<PortfolioDocument>(doc);
    }
  }

  const result = await transaction.commit();
  console.log(`Seeded ${docs.length} documents.`, result.documentIds);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
