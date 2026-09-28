import type { Project } from "@/lib/data/types";

import { richText } from "./rich-text";

export const projects: Project[] = [
  {
    id: "infinitunes",
    slug: "infinitunes",
    name: "Infinitunes",
    tagline: "A music player for the web, powered by my own JioSaavn API",
    description: richText(
      "A music streaming web app in the spirit of JioSaavn.com, with recently played tracks and playlists you build yourself. The music comes from my unofficial JioSaavn API.",
      "It is built with Next.js 14 and TypeScript, styled with Tailwind CSS and shadcn/ui. NextAuth.js and Zod handle sign-in and validation, PostgreSQL runs through Supabase and Drizzle ORM, and Jotai manages client state."
    ),
    stack: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "shadcn/ui",
      "Supabase",
      "Drizzle",
      "NextAuth.js",
      "Jotai",
    ],
    github: "https://github.com/rajput-hemant/infinitunes",
    live: "https://infinitunes.rajputhemant.dev",
    featured: true,
    status: "maintained",
    year: 2022,
  },
  {
    id: "jiosaavn-api",
    slug: "jiosaavn-api",
    name: "JioSaavn API",
    tagline: "An unofficial TypeScript wrapper for JioSaavn, on Hono and Bun",
    description: richText(
      "An unofficial wrapper around JioSaavn covering songs, albums, playlists, artists, radio stations, podcasts, lyrics and recommendations, with high-quality downloads and lyrics where available. It uses Hono's RegExpRouter and runs on Bun, Node.js, Vercel or Cloudflare Workers.",
      "It started life in Rust with Axum. Free hosting for the Rust runtime was too limited, so I ported it to TypeScript, adding a smaller payload option and camelCase keys in the JSON along the way."
    ),
    stack: ["TypeScript", "Hono", "Bun"],
    github: "https://github.com/rajput-hemant/jiosaavn-api",
    live: "https://jiosaavn.rajputhemant.dev",
    featured: true,
    status: "archived",
    year: 2023,
  },
  {
    id: "lipi",
    slug: "lipi",
    name: "Lipi",
    tagline: "A Notion-style workspace app with real-time collaboration",
    description: richText(
      "A SaaS take on Notion: workspaces, folders and files that several people can edit at once through Supabase Realtime, with Stripe handling payments.",
      "Next.js 14 and TypeScript, Valtio for state, shadcn/ui and Tailwind CSS for the interface, NextAuth.js and Zod for auth and validation, and PostgreSQL through Supabase and Drizzle ORM. Still a work in progress."
    ),
    stack: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "shadcn/ui",
      "Supabase",
      "Drizzle",
      "Valtio",
      "Stripe",
    ],
    github: "https://github.com/rajput-hemant/lipi",
    live: "https://lipi.rajputhemant.dev",
    featured: true,
    status: "wip",
    year: 2023,
  },
  {
    id: "leetcode",
    slug: "leetcode",
    name: "leetcode",
    tagline: "My LeetCode solutions in Rust, Go and Java, as a VitePress site",
    description: richText(
      "A running collection of my LeetCode solutions in Rust, Go and Java. Every six hours, GitHub Actions and a few build scripts regenerate the READMEs, VitePress turns them into a static site, and the result deploys to GitHub Pages."
    ),
    stack: ["VitePress", "Rust", "Go", "Java", "GitHub Actions"],
    github: "https://github.com/rajput-hemant/leetcode",
    live: "https://rajput-hemant.github.io/leetcode/",
    featured: true,
    status: "maintained",
    year: 2022,
  },
  {
    id: "threejs-journey",
    slug: "threejs-journey",
    name: "Three.js Journey",
    tagline: "Practice projects from Bruno Simon's Three.js Journey course",
    description: richText(
      "The source code for the projects I built while working through Bruno Simon's Three.js Journey course, written with React Three Fiber, Drei and Vite. Each project is deployed on the accompanying site."
    ),
    stack: ["Three.js", "React", "React Three Fiber", "Drei", "Vite"],
    github: "https://github.com/rajput-hemant/threejs-journey",
    live: "https://threejs-journey.rajputhemant.dev",
    featured: false,
    status: "maintained",
    year: 2023,
  },
  {
    id: "calculator",
    slug: "calculator",
    name: "Calculator",
    tagline: "A Material Design calculator with unit and currency conversion",
    description: richText(
      "A Flutter calculator following Google's Material Design, with basic and scientific modes, unit conversion across area, length, speed, weight, data, power, energy, pressure, volume, temperature, time, plane angle, frequency and fuel economy, and currency conversion from exchange rates.",
      "It is published on IzzyOnDroid. Currency support is limited because the app relies on the free tier of an exchange-rate API."
    ),
    stack: ["Flutter", "Dart"],
    github: "https://github.com/rajput-hemant/calculator",
    live: "https://android.izzysoft.de/repo/apk/com.capybara.calculator",
    featured: false,
    status: "maintained",
    year: 2022,
  },
  {
    id: "jiosaavn-api-rs",
    slug: "jiosaavn-api-rs",
    name: "JioSaavn API (Rust)",
    tagline: "The original Rust and Axum version of my JioSaavn API",
    description: richText(
      "The first version of my JioSaavn wrapper, written in Rust with the Axum web framework. Free deployment options for the Rust runtime turned out to be too limited, so I migrated it to [TypeScript and Hono](https://github.com/rajput-hemant/jiosaavn-api) and archived this one."
    ),
    stack: ["Rust", "Axum"],
    github: "https://github.com/rajput-hemant/jiosaavn-api-rs",
    featured: false,
    status: "archived",
    year: 2023,
  },
  {
    id: "rajputhemant-me",
    slug: "rajputhemant-me",
    name: "rajputhemant.me",
    tagline: "My previous landing page and portfolio, before this site",
    description: richText(
      "Two sites under one name: a landing page built with QwikCity, and a portfolio built with Next.js, both in TypeScript and Tailwind CSS. The portfolio lived in the same repository as this site, which replaces both."
    ),
    stack: ["Qwik", "QwikCity", "Next.js", "TypeScript", "Tailwind CSS"],
    github: "https://github.com/rajput-hemant/landing",
    live: "https://rajputhemant.me",
    featured: false,
    status: "archived",
    year: 2023,
  },
  {
    id: "shellai",
    slug: "shellai",
    name: "ShellAI",
    tagline: "A terminal AI chat app for command-line tasks and questions",
    description: richText(
      "A terminal-based AI chat app that works with models from several providers, built to help developers with command-line tasks and queries. I built it during my client work with Proghit."
    ),
    stack: ["CLI", "LLMs"],
    featured: false,
    status: "maintained",
    year: 2025,
  },
];
