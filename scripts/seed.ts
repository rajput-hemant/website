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
      "Zunta is a healthcare fintech platform that automates and validates private-pay billing for skilled nursing facilities, where accuracy and compliance are the whole point. I joined in January 2026, moving over from Proghit with my manager, and I'm working on Payments V2 across both the frontend and the backend.",
      'zunta-p1',
    ),
  ],
  'experience-blai': [
    paragraph(
      'Blai was a personal AI crypto advisor: an app that read the markets continuously and turned that into clear, tailored insight for its users. I came over from FastLane in September 2025 with the same team, and worked mostly on the backend - the mobile APIs, built on top of ElizaOS for the agent layer.',
      'blai-p1',
    ),
    paragraph(
      'Those APIs were agentic, so keeping them up was as much of the job as adding to them; I ran the deployment pipelines and the uptime monitoring alongside the feature work. I also worked with the mobile team on the React Native app itself, on feature integration and performance. Blai shut down in May 2026.',
      'blai-p2',
    ),
  ],
  'experience-proghit': [
    paragraph(
      'Proghit is a development firm I freelanced with for a little over a year, as frontend lead across products with nothing in common: a payments platform, an ad manager, an ed-tech app and two developer tools. The stack stayed the same - React and TypeScript - and the domain changed every few months.',
      'proghit-p1',
    ),
    paragraph(
      "Most of it was building against other teams' backends and designs. In January 2026 my manager and I both moved on to Zunta, where I'm still building.",
      'proghit-p2',
    ),
  ],
  'experience-lightwork': [
    paragraph(
      'Lightwork AI built Felicity, an assistant for property teams that took on the repetitive end of the job: customer communication, maintenance, compliance, payments and scheduling. I led the frontend, in React, starting part-time in September 2024 and going full-time that December.',
      'lightwork-p1',
    ),
    paragraph(
      'The platform grew module by module, and I built and maintained several of the key ones. Where a feature needed work on the other side of the line I picked up backend tasks too, usually to keep data consistent between the two. I left in July 2025.',
      'lightwork-p2',
    ),
  ],
  'experience-fastlane': [
    paragraph(
      'FastLane was a fully on-chain game on the Oasis Network: an endlessly extending road with hidden obstacles, somewhere between Subway Surfers and an NFT mechanic. Every checkpoint was a claimable NFT, so players raced for distance and competed for ownership at the same time, and could earn ETH from either.',
      'fastlane-p1',
    ),
    paragraph(
      'I built and maintained the site and the game mechanics, and ran the server side - operations and continuous deployment. I started part-time in June 2024, and in September 2025 the whole team, me included, moved on to Blai.',
      'fastlane-p2',
    ),
  ],
  'experience-mixr': [
    paragraph(
      'MixR was a community-first marketplace that pulled separate online stores into a single browsing and checkout flow. I ran the frontend on contract, migrated the whole codebase to Next.js for the performance, and handled the integration work against the backend.',
      'mixr-p1',
    ),
  ],
} satisfies Record<string, PortableTextBlock[]>;

const experienceHighlights = {
  'experience-proghit': [
    'Simple: frontend and JavaScript SDK for a one-click payment platform in the shape of Stripe Link',
    'Gizber: extended the existing Ad Manager in both the React web app and the iOS tablet app, for donation-driven campaigns',
    'Kriah: frontend lead on an ed-tech platform for Jewish children, built around accessibility and engagement',
    'ShellAI: a terminal AI chat app that talks to several model providers, for CLI tasks and questions',
    'LobeChat plugin: gave LobeChat web search',
  ],
  'experience-lightwork': [
    'Modules I owned: Knowledge Base, Compliance, Lettings & Viewings, Calendar, and others after them',
  ],
};

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
      'Healthcare fintech automating and validating private-pay billing for skilled nursing facilities.',
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
    companyUrl: 'https://blaiapp.io',
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
    companyUrl: 'https://www.proghit.com',
    companyBlurb:
      'Development firm with projects across fintech, ad-tech, ed-tech, and developer tools.',
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
    highlights: experienceHighlights['experience-proghit'],
  },
  {
    _id: 'experience-lightwork',
    _type: 'experience',
    company: 'Lightwork AI (Lightwork Holding LTD)',
    companyUrl: 'https://lightwork.co',
    companyBlurb:
      'Felicity, an AI assistant for property teams covering communication, maintenance, compliance, payments, and scheduling.',
    title: 'Product Engineer (Frontend Lead)',
    location: 'London, UK',
    remote: true,
    employmentType: 'Part-time',
    startDate: '2024-09-01',
    endDate: '2025-07-01',
    body: experienceBodies['experience-lightwork'],
    highlights: experienceHighlights['experience-lightwork'],
  },
  {
    _id: 'experience-fastlane',
    _type: 'experience',
    company: 'FastLane (Reddy Builders)',
    companyUrl: 'https://fastlane.run',
    companyBlurb:
      'Fully on-chain, infinitely expanding game on the Oasis Network.',
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
    companyUrl: 'https://mixr.gg',
    companyBlurb:
      'Community-first marketplace connecting online stores for unified browsing and checkout.',
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
        'A simple music player web app built with Next.js, Tailwind CSS, shadcn/ui, Drizzle ORM, and more.',
        'infinitunes-desc',
      ),
    ],
    github: 'https://github.com/rajput-hemant/infinitunes',
    live: 'https://infinitunes.rajputhemant.dev',
    order: 1,
  },
  {
    _id: 'project-lipi',
    _type: 'project',
    name: 'Lipi',
    slug: { _type: 'slug', current: 'lipi' },
    tagline: 'Notion-style workspace (WIP)',
    description: [
      paragraph(
        'A Notion replica with real-time collaboration and customizable workspaces.',
        'lipi-desc',
      ),
    ],
    github: 'https://github.com/rajput-hemant/lipi',
    live: 'https://lipi.rajputhemant.dev',
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
        'An unofficial TypeScript wrapper for the JioSaavn API powered by Hono on Bun; originally developed in Rust with Axum.',
        'jiosaavn-ts-desc',
      ),
    ],
    stack: ['TypeScript', 'Hono', 'Bun'],
    github: 'https://github.com/rajput-hemant/jiosaavn-api',
    live: 'https://jiosaavn.rajputhemant.dev',
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
        'The original JioSaavn API wrapper written in Rust with Axum.',
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
        'A Flutter calculator with basic and scientific calculators, unit conversion, and currency conversion.',
        'calculator-desc',
      ),
    ],
    stack: ['Flutter', 'Dart'],
    github: 'https://github.com/rajput-hemant/calculator',
    live: 'https://android.izzysoft.de/repo/apk/com.capybara.calculator',
    order: 5,
  },
  {
    _id: 'project-website',
    _type: 'project',
    name: 'rajputhemant.me',
    slug: { _type: 'slug', current: 'rajputhemant-me' },
    tagline: 'Personal landing and portfolio',
    description: [
      paragraph(
        'Personal landing page and portfolio website built with Next.js, QwikCity, TypeScript and Tailwind CSS',
        'website-desc',
      ),
    ],
    stack: ['Next.js', 'QwikCity', 'TypeScript', 'Tailwind CSS'],
    github: 'https://github.com/rajput-hemant/landing',
    live: 'https://rajputhemant.me',
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
        'Curated LeetCode solutions in multiple languages, published with VitePress and refreshed every six hours.',
        'leetcode-desc',
      ),
    ],
    stack: ['VitePress', 'Markdown'],
    github: 'https://github.com/rajput-hemant/leetcode',
    live: 'https://rajput-hemant.github.io/leetcode',
    order: 7,
  },
  {
    _id: 'project-threejs-journey',
    _type: 'project',
    name: 'Three.js Journey',
    slug: { _type: 'slug', current: 'threejs-journey' },
    tagline: 'React Three Fiber practice',
    description: [
      paragraph(
        "Practice projects from Bruno Simon's Three.js course with React Three Fiber.",
        'r3f-desc',
      ),
    ],
    stack: ['Three.js', 'R3F'],
    github: 'https://github.com/rajput-hemant/threejs-journey',
    live: 'https://threejs-journey.rajputhemant.dev',
    order: 8,
  },
  {
    _id: 'project-shellai',
    _type: 'project',
    name: 'ShellAI',
    slug: { _type: 'slug', current: 'shellai' },
    tagline: 'Terminal-based AI chat app',
    description: [
      paragraph(
        'A terminal-based AI chat app supporting models from multiple providers for CLI tasks and queries.',
        'shellai-desc',
      ),
    ],
    stack: ['TypeScript'],
    github: 'https://github.com/proghit/shellai',
    order: 9,
  },
  {
    _id: 'project-lobechat-web-search',
    _type: 'project',
    name: 'LobeChat web-search plugin',
    slug: { _type: 'slug', current: 'lobechat-web-search' },
    tagline: 'Web-search plugin for LobeChat',
    description: [
      paragraph(
        'A LobeChat plugin that enables web search.',
        'lobechat-web-search-desc',
      ),
    ],
    stack: ['TypeScript'],
    order: 10,
  },
] satisfies SeedDocument<Project>[];

const profile = {
  _id: 'profile',
  _type: 'profile',
  name: 'Hemant Rajput',
  headline: 'Fullstack developer',
  bio: [
    paragraph(
      'Passionate fullstack developer adept in JavaScript and committed to crafting pixel-perfect web experiences. Eager to collaborate with teams to gain hands-on experience in delivering efficient, scalable, and visually appealing web applications.',
      'profile-bio-1',
    ),
  ],
  links: [
    {
      _key: 'whatsapp',
      label: 'WhatsApp',
      url: 'https://wa.me/919897679924',
    },
    {
      _key: 'github',
      label: 'GitHub',
      url: 'https://github.com/rajput-hemant',
    },
    {
      _key: 'linkedin',
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/rajput-hemant/',
    },
    {
      _key: 'website',
      label: 'Website',
      url: 'https://rajputhemant.me',
    },
  ],
  location: 'Mathura, India',
} satisfies SeedDocument<Profile>;

const nowDoc = {
  _id: 'now',
  _type: 'now',
  items: [
    {
      _key: 'payments-v2',
      text: 'Contributing to Payments V2 across frontend and backend systems at Zunta.',
    },
  ],
  updatedAt: '2026-09-01',
} satisfies SeedDocument<Now>;

const changelog = [
  {
    _id: 'update-rebuild-start',
    _type: 'update',
    date: '2026-09-21',
    text: 'Started rebuilding this portfolio with a clean Next.js scaffold.',
    category: 'site',
  },
  {
    _id: 'update-zunta',
    _type: 'update',
    date: '2026-01-01',
    text: 'Joined Zunta as Fullstack Engineer.',
    category: 'work',
  },
  {
    _id: 'update-blai-sunset',
    _type: 'update',
    date: '2026-05-01',
    text: 'Blai App sunset.',
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
