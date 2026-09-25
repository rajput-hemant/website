# Prose notes: facts to confirm

The fallback content in `content/fallback/*` (also what `scripts/seed.ts` writes into Sanity) was drafted from the CV and section 3.1 of the build plan. Everything below is either derived, assumed, or missing from those sources. Edit the content in Studio (or in `content/fallback/*`) once confirmed.

## Derived dates and continuations

- **FastLane end date: Sept 2025 (derived).** The CV says "June 2024 – continuing building at Blai". The end date is taken from the Blai start date.
- **Proghit end date: Jan 2026 (derived).** The CV says "Sept 2024 – continuing building at Zunta". The end date is taken from the Zunta start date.
- **Continuation notes.** `fastlane → blai`: "Moved with the same team". `proghit → zunta`: "Moved with my manager". The prose says the same thing in both directions (FastLane and Proghit end with the move; Blai and Zunta open with it). Confirm the wording.
- **Blai end date: May 2026** stored as `2026-05-01` with `endNote: "company sunset"`. The exact day is unknown.
- All start and end dates are stored as the first of the month; only the month is known.

## Profile

- **Email `hello@rajputhemant.dev` is a placeholder.** The CV hides the address behind a link. Confirm the address, or give the real one.
- **LinkedIn URL `https://www.linkedin.com/in/rajput-hemant` is assumed** from the GitHub handle. The CV only shows a "LinkedIn" label.
- **WhatsApp `https://wa.me/919897679924` is on the CV.** It is included as a public link. Confirm you want your phone number public on the site; remove it otherwise.
- **Headline and bio are new copy** adapted from the CV summary. The bio claims "Since 2024 I've led frontend work for remote teams in the US and UK", based on the Lightwork (London), Proghit (New York) and FastLane (Boston) lead titles.
- `availability` and `resumeNote` are left empty.

## Experience

- **Company display names drop the legal entities** shown on the CV: Codeblue Ventures (Zunta), Blai Inc. Labs (Blai), Proghit Inc, Lightwork Holding LTD, Reddy Builders (FastLane), MixR Holdings, Inc. Say if you want them shown, for example in the blurb.
- **Proghit's company name is "Proghit"**; the CV heading reads "Client Projects (Proghit Inc)".
- **Company URLs:** Zunta uses `https://zunta.com` (the CV also links `https://codeblue.ventures`); the rest are the links on the CV.
- **Lightwork `employmentType` is `full-time`** (what it ended as), with the note "Part-time, then full-time from Dec 2024". The schema allows one type only.
- **Zunta closes with "The work is still in progress."** because the CV has one bullet (Payments V2, frontend and backend). Anything you have shipped there would make this entry stronger.
- **Blai** closing sentence ("I learned a lot there about backend systems, AI agent orchestration and mobile development") rewrites the CV's "actively learning" bullet in the past tense.
- **Lightwork**: "I was an active reviewer on the team" rewrites "actively participated in code reviews". The module list says "including", matching the CV's "and more".
- **Proghit**: Kriah is described as "an ed-tech platform for Jewish children built around accessibility and engagement", from the CV's "designed for Jewish children to improve accessibility and engagement". The LobeChat plugin and ShellAI are presented as Proghit client work, as on the CV.
- **MixR**: "moving the entire codebase to Next.js" is stated as done; the CV uses past tense ("migrating").
- Names of clients and products (Simple, Gizber, Kriah, Felicity, ElizaOS) are used exactly as on the CV. Only ElizaOS is linked in the prose; Simple (`https://www.paysimple.io/`) and Gizber (`https://www.gizber.com/`) links from the CV are not used. Add them if you want them.

## Projects

- **Featured (four):** Infinitunes, JioSaavn API (TypeScript), Lipi, leetcode. Confirm the choice. Three.js Journey has more GitHub stars than leetcode and is a candidate swap.
- **JioSaavn API (TypeScript) is archived on GitHub** (`rajput-hemant/jiosaavn-api`, description "Project Discontinued"), so its status is `archived` even though it is featured. The old site linked `rajput-hemant/jiosaavn-api-ts`, which appears to have been renamed to `jiosaavn-api`. Confirm whether it should stay featured and whether `https://jiosaavn.rajputhemant.dev` is still live.
- **Years come from GitHub repository creation dates**, not release dates: Infinitunes 2022, Calculator 2022, leetcode 2022, Three.js Journey 2023, JioSaavn API (Rust) 2023, JioSaavn API (TypeScript) 2023, Lipi 2023, rajputhemant.me 2023 (landing repo created Nov 2023, portfolio repo Sept 2023).
- **ShellAI has no public repo or live URL** that I could find, and no year or tech stack on the CV. The year `2025` is a placeholder inside the Proghit period (Sept 2024 – Jan 2026). The `stack` is the generic tags "CLI" and "LLMs". Supply the year, stack and link, or confirm it should be listed at all given it was client work.
- **The LobeChat web-search plugin** is not listed as a project; it appears only in the Proghit role. Add it if you want it.
- **Statuses are my guesses** apart from the archived repos: Infinitunes, leetcode, Three.js Journey, Calculator and ShellAI are `maintained`; Lipi is `wip` (as on the CV); rajputhemant.me is `archived` because this site replaces it.
- **rajputhemant.me live URL `https://rajputhemant.me` is assumed** from the project name. The CV's link for it points at the landing repo. Its `github` is the landing repo (`rajput-hemant/landing`); the portfolio half lived in this repository (`rajput-hemant/website`), which the description mentions without a link.
- **Three.js Journey live URL** uses the CV's `https://threejs-journey.rajputhemant.dev`, not the old site's `threejs-journey-master.vercel.app`. **Infinitunes** likewise uses the CV's `infinitunes.rajputhemant.dev` over `infinitunes.vercel.app`.
- **JioSaavn API (Rust)** has no live URL. The old site listed `https://jiosaavn-api-rs.vercel.app/`; I left it out because the repo is archived and the deployment is probably gone.
- **leetcode's "every six hours" refresh** comes from the CV. The GitHub repo was last updated in Aug 2025, so the schedule may have stopped. Fixed the old site's `github.code` typo to `github.com`.
- **Infinitunes and Lipi stacks** say Next.js 14, as on the CV; the current code may be on a newer version.
- Other repos on the old site (Next.js Template, React Template Vite, Advent of Code, Hashira) are not carried over; the plan's list of nine does not include them.

## Now

- Three items, all from the CV or this rebuild: Payments V2 at Zunta; rebuilding this site; going deeper on backend systems and AI agent orchestration (from the Blai learning bullet). Confirm the third is still true. `updatedAt` is 2026-09-25.

## Changelog

- **Month assumed** for two entries: starting the B.Tech (`2020-08-01`) and graduating (`2024-06-01`). The CV gives only the years 2020 – 2024.
- **Project entries use repo creation months**: Infinitunes (Nov 2022), JioSaavn API in Rust (Aug 5, 2023) then TypeScript (Aug 31, 2023).
- **"Rebuilt this site" is dated 2026-09-25** (today). Change it to the real launch date.
- The Lightwork and Proghit starts are one entry, since both began in Sept 2024.

## Skills and education

- Skills follow the plan's grouping. "QwickCity" is corrected to QwikCity and "GoLang" to Go. Drizzle ORM stays under Frontend as on the CV, though it arguably belongs under Databases.
- The CV's soft-skills list is left out, per the plan.
- Education: the Matriculation board isn't named on the CV (only the Intermediate says CBSE), so no board is shown for it. GLA University's location is shortened to "Chaumuhan, Mathura, Uttar Pradesh", and the school's to "Mathura, Uttar Pradesh". The start year is unknown for both school entries.
