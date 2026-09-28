import type { SkillGroup } from "@/lib/data/types";

export const skills: SkillGroup[] = [
  {
    id: "languages",
    title: "Languages",
    items: ["JavaScript", "TypeScript", "Rust", "Go"],
  },
  {
    id: "frontend",
    title: "Frontend",
    items: [
      "HTML",
      "CSS",
      "React",
      "Next.js",
      "Vue",
      "Svelte",
      "SvelteKit",
      "Qwik",
      "QwikCity",
      "Three.js",
      "React Three Fiber",
      "React Query",
      "SWR",
      "Drizzle ORM",
      "Zustand",
      "Jotai",
      "WebSockets",
      "Tailwind CSS",
      "PWA",
      "Markdown",
    ],
  },
  { id: "backend", title: "Backend", items: ["Node.js", "Bun", "Hono"] },
  {
    id: "databases",
    title: "Databases",
    items: ["MySQL", "PostgreSQL", "Firebase", "Supabase"],
  },
  {
    id: "tooling",
    title: "Tooling",
    items: ["Git", "GitHub", "CI/CD", "Docker", "Vercel", "Netlify", "SEO"],
  },
];
