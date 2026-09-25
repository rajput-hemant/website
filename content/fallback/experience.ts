import type { Experience } from "@/lib/data/types";

import { richText } from "./rich-text";

export const experience: Experience[] = [
  {
    id: "zunta",
    company: "Zunta",
    companyUrl: "https://zunta.com",
    companyBlurb:
      "A healthcare fintech platform that automates and validates private-pay billing for skilled nursing facilities.",
    title: "Fullstack Engineer",
    location: "Lakewood, NJ, USA",
    remote: true,
    employmentType: "full-time",
    startDate: "2026-01-01",
    body: richText(
      "I joined Zunta in January 2026, moving over from Proghit together with my manager. Zunta automates and validates private-pay billing for skilled nursing facilities, a domain where accuracy, compliance and clear visibility into every step matter.",
      "I work on Payments V2, which spans the frontend and the backend systems behind it. The work is still in progress."
    ),
    highlights: [],
  },
  {
    id: "blai",
    company: "Blai",
    companyUrl: "https://blaiapp.io",
    companyBlurb:
      "An AI crypto advisor app that analyses the markets around the clock and turns them into clear, tailored insights and trades.",
    title: "Full-stack Developer (React Native)",
    location: "Cambridge, MA, USA",
    remote: true,
    employmentType: "part-time",
    startDate: "2025-09-01",
    endDate: "2026-05-01",
    endNote: "company sunset",
    body: richText(
      "In September 2025 the team I had been working with at FastLane moved over to Blai, and I moved with them. Blai is an AI crypto advisor: an app that watches the markets around the clock and gives each user clear, tailored insights for smarter trades.",
      "Most of my time went into the backend. I built and maintained the mobile APIs, which are integrated with [ElizaOS](https://elizaos.ai), and ran the continuous deployment pipelines and uptime monitoring that kept the agentic APIs reliable. I also worked with the mobile team on the React Native app, integrating features and improving performance.",
      "Blai was an AI-first team, and I learned a lot there about backend systems, AI agent orchestration and mobile development. The company sunset in May 2026."
    ),
    highlights: [],
  },
  {
    id: "proghit",
    company: "Proghit",
    companyUrl: "https://www.proghit.com",
    companyBlurb:
      "A development firm building client products across fintech, ad-tech, ed-tech and developer tools.",
    title: "Sr. Fullstack Engineer (Frontend Lead)",
    location: "New York, NY, USA",
    remote: true,
    employmentType: "freelance",
    startDate: "2024-09-01",
    endDate: "2026-01-01",
    continuedInto: {
      id: "zunta",
      company: "Zunta",
      note: "Moved with my manager",
    },
    body: richText(
      "Proghit is a development firm that takes on client work across fintech, ad-tech, ed-tech and developer tools. I joined as a freelancer in September 2024 and led the frontend on several of those projects, mostly in React and TypeScript, working closely with the backend and design teams.",
      "For Simple, a one-click payment platform similar to Stripe Link, I built the frontend and a JavaScript SDK. For Gizber I improved the Ad Manager, which runs donation-driven ad campaigns, in both the React web app and the iOS tablet app. I was the lead frontend engineer on Kriah, an ed-tech platform for Jewish children built around accessibility and engagement. I also built two developer tools: a web-search plugin for LobeChat, and ShellAI, a terminal AI chat app that works with models from several providers and helps with command-line tasks and questions.",
      "In January 2026 my manager and I moved over to Zunta together."
    ),
    highlights: [
      "Simple: frontend and a JavaScript SDK for one-click payments",
      "Gizber: Ad Manager improvements on web and iOS tablet",
      "Kriah: lead frontend engineer",
      "LobeChat: a web-search plugin",
      "ShellAI: a terminal AI chat app for CLI work",
    ],
  },
  {
    id: "lightwork",
    company: "Lightwork AI",
    companyUrl: "https://www.lightwork.co",
    companyBlurb:
      "Makers of Felicity, an AI assistant that handles communication, maintenance, compliance, payments and scheduling for property teams.",
    title: "Product Engineer (Frontend Lead)",
    location: "London, UK",
    remote: true,
    employmentType: "full-time",
    employmentNote: "Part-time, then full-time from Dec 2024",
    startDate: "2024-09-01",
    endDate: "2025-07-01",
    body: richText(
      "Lightwork AI builds Felicity, an AI assistant for property teams that takes care of customer communication, maintenance, compliance, payments and scheduling. I joined in September 2024 as a part-time product engineer leading the frontend, and went full-time that December.",
      "I led frontend development in React and worked closely with design, backend and product so that features held together end to end. Where integration or consistent data flow needed it, I picked up backend tasks too, and I was an active reviewer on the team.",
      "By the time I left in July 2025 I had built and maintained several of the platform's core modules, including the Knowledge Base, Compliance, Lettings & Viewings and the Calendar."
    ),
    highlights: [
      "Knowledge Base",
      "Compliance",
      "Lettings & Viewings",
      "Calendar",
    ],
  },
  {
    id: "fastlane",
    company: "FastLane",
    companyUrl: "https://fastlane.run",
    companyBlurb:
      "A fully on-chain, endlessly expanding game on the Oasis Network where every checkpoint is a claimable NFT.",
    title: "Lead Frontend Engineer",
    location: "Boston, MA, USA",
    remote: true,
    employmentType: "part-time",
    startDate: "2024-06-01",
    endDate: "2025-09-01",
    continuedInto: {
      id: "blai",
      company: "Blai",
      note: "Moved with the same team",
    },
    body: richText(
      "FastLane is a fully on-chain game on the Oasis Network, a bit like Subway Surfers with NFT mechanics. Players race down an endlessly expanding road full of hidden obstacles, each checkpoint is a claimable NFT, and both gameplay and checkpoint ownership earn ETH. I joined part-time in June 2024 as the lead frontend engineer.",
      "I built and maintained the site and the game mechanics, and looked after server operations and continuous deployment so that updates went out smoothly.",
      "In September 2025 the team and I moved over to Blai together."
    ),
    highlights: [],
  },
  {
    id: "mixr",
    company: "MixR",
    companyUrl: "https://mixr.gg",
    companyBlurb:
      "A community-first marketplace that brings products from many online stores into one place with a single checkout.",
    title: "Frontend Developer",
    location: "Houston, TX, USA",
    remote: true,
    employmentType: "contract",
    startDate: "2024-07-01",
    endDate: "2025-02-01",
    body: richText(
      "MixR is a community-first marketplace that connects online stores so shoppers can browse them in one place and check out once. I joined on a contract in July 2024 to look after the frontend.",
      "I oversaw frontend development and its integration with the backend. The biggest piece of work was moving the entire codebase to Next.js for better performance."
    ),
    highlights: [],
  },
];
