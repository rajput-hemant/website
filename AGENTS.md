# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

- Add durable project-specific notes here as they are discovered through real work.

## Project notes

- `tsconfig.json` is the source of truth for strict TypeScript. It enables `noUncheckedIndexedAccess`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `isolatedModules`, and `forceConsistentCasingInFileNames`. TypeScript stays on 6.x because the type-aware lint toolchain does not support 7.x. Its temporary `ignoreDeprecations: "6.0"` bridge suppresses the TypeScript 6 deprecation diagnostic for `baseUrl`, which remains necessary for the `~/*` path alias.
- `eslint.config.mjs` uses `typescript-eslint` project service for type-aware linting; configured rules are errors. Prettier and staged-file hooks are configured in `.prettierrc.json`, `.lintstagedrc`, and `.husky/`.
- `src/app`, `src/components`, `src/lib`, `src/content`, and `src/sanity` are the application shape. The `~/*` alias maps to `src/*` in `tsconfig.json`.
- The validation gate is `bun install`, `bun run type-check`, `bun run lint`, `bun run build`, and `bun run typegen`, run sequentially. Sanity setup and required env values are in `README.md`.
- Do not add comments that only explain self-evident code. Tests should use real typing instead of `as any`-style casts.
- Design tokens live in `src/app/globals.css` and extend the Tailwind theme rather than duplicating it. Type scale: `@theme static` replaces `--text-*` with one fluid base and fixed 1.25 ratios, so `text-lg` and `var(--text-lg)` are the same value. Spacing: Tailwind's `--spacing` multiplier only (in CSS write `calc(var(--spacing) * N)`, never a parallel scale); the 16px gutter is `px-4` on `body`. Fonts: `src/lib/fonts.ts` puts `--font-bricolage`, `--font-fraunces` and `--font-martian-mono` on `<html>`, and `@theme static` replaces `--font-*` with `--font-sans/serif/mono` pointing at them, so utilities and CSS share one switch point. Colours: `light-dark()` values on `:root` (dark mode follows `color-scheme`, never a class) bridged as `bg`, `fg`, `fg-muted`, `rule`, `accent`. `--radius` on `:root` is the one live radius, bridged as `rounded-sm`. Links: underlines exist only inside `.prose`; chrome links use the `quiet-link` utility.
- Page shell contract: `src/app/(site)/layout.tsx` renders the header and the text column (`max-w-measure`, 50ch, about 66 characters per line at 1440px). Every page renders `<main>` followed by `<Footer path="/…" />` from `src/components/site/footer.tsx`; the footer is a server component and derives the markdown mirror link from the path: `/` mirrors at `/index.md`, every other page at `<path>.md`. The markdown-mirror route must honour those paths.
- Visitor preferences (accent hue, body font, radius, texture, motion, smooth scroll, cursor, sound) live in `src/lib/prefs.ts`: read them with `usePrefs()`, never localStorage directly. An inline script from `PrefsSync` mirrors them onto `<html>` as `data-*` attributes and `--accent-hue`/`--radius` before first paint, so CSS can key off those. Theme stays with `next-themes`.
- The header wordmark carries the name. A page `h1` is a positioning line and never repeats the name.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
