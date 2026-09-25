import type { Update } from "@/lib/data/types";

export const changelog: Update[] = [
  {
    id: "2026-09-site-rebuilt",
    date: "2026-09-25",
    text: "Rebuilt this site from scratch: static pages, content in Sanity, and a lab.",
    category: "site",
  },
  {
    id: "2026-05-blai-sunset",
    date: "2026-05-01",
    text: "Blai sunset, closing out my part-time role there.",
    category: "work",
  },
  {
    id: "2026-01-joined-zunta",
    date: "2026-01-01",
    text: "Joined Zunta to work on Payments V2, moving over from Proghit with my manager.",
    category: "work",
    link: "https://zunta.com",
  },
  {
    id: "2025-09-joined-blai",
    date: "2025-09-01",
    text: "Moved from FastLane to Blai with the same team.",
    category: "work",
    link: "https://blaiapp.io",
  },
  {
    id: "2024-09-joined-lightwork",
    date: "2024-09-01",
    text: "Started leading the frontend at Lightwork AI, and began freelancing with Proghit.",
    category: "work",
    link: "https://www.lightwork.co",
  },
  {
    id: "2024-06-graduated",
    date: "2024-06-01",
    text: "Graduated with a B.Tech in Computer Science and Engineering from GLA University.",
    category: "learning",
  },
  {
    id: "2023-08-jiosaavn-api",
    date: "2023-08-01",
    text: "Wrote a JioSaavn API wrapper in Rust, then ported it to TypeScript and Hono that same month.",
    category: "project",
    link: "https://github.com/rajput-hemant/jiosaavn-api",
  },
  {
    id: "2022-11-infinitunes",
    date: "2022-11-01",
    text: "Started Infinitunes, a music player for the web.",
    category: "project",
    link: "https://infinitunes.rajputhemant.dev",
  },
  {
    id: "2020-08-started-btech",
    date: "2020-08-01",
    text: "Started a B.Tech in Computer Science and Engineering at GLA University.",
    category: "learning",
  },
];
