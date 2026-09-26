# Brief shared by every design direction

Client: Hemant Rajput, fullstack engineer (TypeScript, React, Next.js, Node, React Native). Portfolio for recruiters, clients and peers equally; no single CTA. Must feel award-level (Awwwards SOTD), professional, built by a senior studio designer. Later a literal, interactive 3D scene (React Three Fiber) lives in the hero and persists across pages; the mock must show where it sits (draw a static SVG stand-in of the 3D object).

Real content (use it, no lorem ipsum):
- Name: Hemant Rajput. Headline: "Fullstack engineer crafting fast, pixel-perfect web experiences". Location: Mathura, India (remote). Email: hello@rajputhemant.dev. Links: GitHub, LinkedIn.
- Bio: "Since 2024 I've led frontend work for remote teams in the US and UK, from payments to an on-chain game."
- Experience (newest first): Zunta, Fullstack Engineer, 2026-01 to now. Blai, Full-stack Developer (React Native), 2025-09 to 2026-05. Proghit, Sr. Fullstack Engineer (Frontend Lead), 2024-09 to 2026-01. Lightwork AI, Product Engineer (Frontend Lead), 2024-09 to 2025-07. FastLane, Lead Frontend Engineer, 2024-06 to 2025-09. MixR, Frontend Developer, 2024-07 to 2025-02.
- Projects (14 total; 4 featured): Infinitunes (2022, maintained) "A music player for the web, powered by my own JioSaavn API" [Next.js, TypeScript, Tailwind, shadcn/ui]; JioSaavn API (2023, archived) "An unofficial TypeScript wrapper for JioSaavn, on Hono and Bun"; Lipi (2023, in progress) "A Notion-style workspace app with real-time collaboration"; leetcode (2022, maintained) "My LeetCode solutions in Rust, Go and Java, as a VitePress site"; ShellAI (2025, maintained) "A terminal AI chat app for command-line tasks and questions".
- Nav: Projects, Experience, Lab, About; plus Resume and a ⌘K command menu. Footer items: Now, Ask (moderated public Q&A), RSS.
- Status: available for work.

Deliverable: ONE self-contained HTML file (inline CSS, inline SVG, Google Fonts only via <link>, no JS frameworks; tiny vanilla JS allowed only for a hover or theme demo). It must contain:
1. The home hero at exactly 1440x900 on first view (header/nav included), fully composed like a finished site.
2. Below it, a "Selected projects" (or equivalent) section showing 3-4 projects in the direction's own pattern.
3. A responsive layout that also works at 390px wide (real mobile layout, not just shrunk).
4. Both a dark and a light theme if the direction supports it: `data-theme` on <html>, toggled by a small button.
Also write a sibling notes file `<name>.md` (under 350 words): thesis (why this world fits this engineer), palette as 4-6 named hex values, type (display/text/utility, Google Fonts), layout concept, THE signature element, how the 3D scene would look in this world, the motion idea, and how each page would map (projects, experience, now/changelog, ask, about).

Quality bar: read `home.html` (the "Drawing Set" direction the client liked) in this folder for the level of rigour: every structural device encodes a true fact from the content, type is deliberate, one signature element, restraint everywhere else. Do NOT copy its look. Avoid AI-design defaults: warm cream + high-contrast serif + terracotta; near-black + single acid accent; generic broadsheet hairlines; Inter/Geist/Space Grotesk/Space Mono/Fraunces/Playfair/Instrument Serif. No emoji. No em dashes. Real accessible HTML (landmarks, headings, AA contrast, visible focus). Sentence-case, plain, specific copy.

Rules: write ONLY your two files in /private/tmp/claude-501/-Users-rajput-hemant-Projects-NextJS-website/0f43fe56-2b60-4a66-9708-12507ec664ab/scratchpad/mock/. Do not run Node, npm, bun or servers; do not use the browser. Report in under 150 words: file names, the signature, and one sentence on what makes it unmistakable.

## Round 2 additions (apply to every new direction)

- A REAL three.js element is required, as a lightweight scene loaded through this import map: {"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.186.1/examples/jsm/"}}.
  - One canvas, DPR capped at 1.5.
  - Render only on change or during short animations: no idle 60fps loop.
  - Responds to pointer and touch drag.
  - prefers-reduced-motion gets a static pose.
  - Keep an SVG/CSS fallback for when WebGL is missing; the canvas is aria-hidden.
  - Geometry is procedural only (no model files).
  - Extra 3D touches beyond the hero are optional. Justify the 3D density under "3D" in the .md.
  - three.js cannot parse CSS oklch() colours: pass hex or rgb to THREE.Color.
- Already taken, so do NOT overlap with any of them in world, palette, typefaces or signature:
  1. Drawing Set: cyanotype and whiteprint engineering drawings, title block, Archivo, Newsreader, Azeret Mono.
  2. Control Surface: hardware faceplate, rotary knob, LCD readouts, signal yellow.
  3. Timetable: transit route map, split-flap board.
  4. Field Survey: topographic relief, contours, loupe, map lettering.
  5. Press Proof: riso and offset overprint, registration marks, pink and blue inks.
  6. Silkscreen: PCB soldermask and traces (cut, but still off-limits).
- Double-check your HTML for typos before finishing (a missing space in `<h1 class>` broke a previous mock). Re-read your markup once, end to end.
