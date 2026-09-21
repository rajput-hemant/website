# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

- Add durable project-specific notes here as they are discovered through real work.

## Project notes

- `tsconfig.json` is the source of truth for strict TypeScript. It enables `noUncheckedIndexedAccess`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `isolatedModules`, and `forceConsistentCasingInFileNames`. TypeScript stays on 6.x because the type-aware lint toolchain does not support 7.x. Its temporary `ignoreDeprecations: "6.0"` bridge suppresses the TypeScript 6 deprecation diagnostic for `baseUrl`, which remains necessary for the `~/*` path alias.
- `eslint.config.mjs` uses `typescript-eslint` project service for type-aware linting; configured rules are errors. Prettier and staged-file hooks are configured in `.prettierrc.json`, `.lintstagedrc`, and `.husky/`.
- `src/app`, `src/components`, `src/lib`, `src/content`, and `src/sanity` are the application shape. The `~/*` alias maps to `src/*` in `tsconfig.json`.
- The validation gate is `bun install && bun run type-check && bun run lint && bun run build`.
- Do not add comments that only explain self-evident code. Tests should use real typing instead of `as any`-style casts.
- Design tokens live in `src/app/globals.css` and extend the Tailwind theme rather than duplicating it: the type scale is declared in `@theme static` so `text-*` utilities and plain CSS share it; spacing is Tailwind's `--spacing` multiplier (in CSS write `calc(var(--spacing) * N)`, never a parallel scale); colours are `light-dark()` values on `:root` (dark mode follows `color-scheme`, never a class) bridged as `bg`, `fg`, `fg-muted`, `rule`, `accent`; `--radius` on `:root` is the one live radius, bridged as `rounded-sm`; `max-w-measure` and `px-gutter` are the layout constants; fonts arrive as `--font-sans/serif/mono` from `src/lib/fonts.ts` on `<html>`.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
