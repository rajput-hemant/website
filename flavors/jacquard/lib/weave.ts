import type { Experience, Project, UpdateCategory } from "@/lib/data/types";
import { formatTenure, monthIndex } from "@/lib/format";

/**
 * The loom's model (docs/flavors/jacquard.md). Technologies are the warp, set up once
 * and reused; every project with a recorded stack is one pick across them.
 * Each end is threaded on a shaft by its kind, and each kind has its yarn.
 */
export type Kind = "lang" | "ui" | "data" | "run" | "three";

/** Shaft order, bottom to top: shaft 1 is Language. */
export const KINDS = ["lang", "ui", "data", "run", "three"] as const;

export const kindNames: Record<Kind, string> = {
  lang: "Language",
  ui: "Interface",
  data: "Data and state",
  run: "Runtime and tooling",
  three: "3D",
};

const THREE = ["three", "r3f", "drei", "webgl", "webgpu", "babylon"];
const LANG = [
  "typescript",
  "javascript",
  "rust",
  "go",
  "golang",
  "java",
  "dart",
  "python",
  "kotlin",
  "swift",
  "ruby",
  "php",
  "elixir",
  "c",
  "cpp",
  "zig",
];
const DATA = [
  "supabase",
  "drizzle",
  "prisma",
  "postgres",
  "postgresql",
  "sql",
  "sqlite",
  "mysql",
  "mongodb",
  "redis",
  "nextauth",
  "auth",
  "clerk",
  "jotai",
  "valtio",
  "zustand",
  "redux",
  "stripe",
  "sanity",
  "firebase",
  "zod",
  "tanstack",
  "graphql",
  "trpc",
];
const UI = [
  "next",
  "react",
  "tailwind",
  "shadcn",
  "vitepress",
  "flutter",
  "qwik",
  "qwikcity",
  "vue",
  "svelte",
  "sveltekit",
  "nuxt",
  "astro",
  "css",
  "html",
  "native",
  "expo",
  "radix",
  "motion",
  "framer",
  "remix",
  "solid",
  "gsap",
];

const words = (tech: string) =>
  tech
    .toLowerCase()
    .replace(/\+\+/g, "pp")
    .split(/[^a-z0-9]+/);

/**
 * The shaft a technology is threaded on. 3D first (React Three Fiber is not
 * an interface library), then languages, data and state, interface; anything
 * else is runtime and tooling.
 */
export function kindFor(tech: string): Kind {
  const w = words(tech);
  const has = (list: readonly string[]) =>
    w.some((word) => list.includes(word));
  if (has(THREE) || /react three/i.test(tech)) return "three";
  if (has(LANG)) return "lang";
  if (has(DATA)) return "data";
  if (has(UI)) return "ui";
  return "run";
}

export type End = { index: number; tech: string; kind: Kind };

export type Pick = {
  index: number;
  project: Project;
  /** Indices of the ends this pick raises, ascending. */
  ends: number[];
};

export type Draft = {
  ends: End[];
  picks: Pick[];
  /** `raised[pick][end]`. */
  raised: boolean[][];
  /** Projects left out of the draft because no stack is recorded. */
  omitted: number;
  years: { from: number; to: number } | null;
};

/** Oldest first, projects without a year last; otherwise the order given. */
export function byYear<T extends { year: number | null }>(
  projects: readonly T[]
): T[] {
  return projects
    .map((project, i) => ({ project, i }))
    .sort(
      (a, b) =>
        (a.project.year ?? Infinity) - (b.project.year ?? Infinity) || a.i - b.i
    )
    .map(({ project }) => project);
}

const endKey = (tech: string) => tech.trim().toLowerCase();

/**
 * The weaving draft: every project with a recorded stack is a pick, oldest
 * first; every technology is an end, in the order it first appears.
 */
export function buildDraft(projects: readonly Project[]): Draft {
  const woven = byYear(projects.filter((p) => p.stack.length > 0));
  const ends: End[] = [];
  const byKey = new Map<string, number>();
  for (const project of woven) {
    for (const tech of project.stack) {
      const key = endKey(tech);
      if (!key || byKey.has(key)) continue;
      byKey.set(key, ends.length);
      ends.push({ index: ends.length, tech: tech.trim(), kind: kindFor(tech) });
    }
  }
  const picks = woven.map((project, index) => ({
    index,
    project,
    ends: [
      ...new Set(
        project.stack.flatMap((tech) => {
          const end = byKey.get(endKey(tech));
          return end === undefined ? [] : [end];
        })
      ),
    ].sort((a, b) => a - b),
  }));
  const years = projects.flatMap((p) => (p.year === null ? [] : [p.year]));
  return {
    ends,
    picks,
    raised: picks.map((pick) =>
      ends.map((end) => pick.ends.includes(end.index))
    ),
    omitted: projects.length - woven.length,
    years: years.length
      ? { from: Math.min(...years), to: Math.max(...years) }
      : null,
  };
}

/** The end a technology is threaded as, if it is in the draft. */
export function endFor(draft: Draft, tech: string): End | undefined {
  const key = endKey(tech);
  return draft.ends.find((end) => endKey(end.tech) === key);
}

export function pickFor(draft: Draft, slug: string): Pick | undefined {
  return draft.picks.find((pick) => pick.project.slug === slug);
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * Accession numbers, the way a museum numbers a sample book: the year, then
 * the object's place in that year's intake, oldest first, after the
 * owner's initials. `AL 2023.2`.
 */
export function accessions(
  projects: readonly Project[],
  initials: string
): Map<string, string> {
  const counts = new Map<number | null, number>();
  const out = new Map<string, string>();
  for (const project of byYear(projects)) {
    const n = (counts.get(project.year) ?? 0) + 1;
    counts.set(project.year, n);
    out.set(
      project.slug,
      `${initials} ${project.year === null ? "n.d." : project.year}.${n}`
    );
  }
  return out;
}

/**
 * A project's swatch: its own pick stepped one end per row, the way a twill
 * steps. Each cell is the end it shows, or -1 where the weft floats.
 */
export function twill(draft: Draft, pick: Pick | undefined): number[][] {
  const n = Math.max(1, draft.ends.length);
  const on = new Set(pick?.ends ?? []);
  return Array.from({ length: n }, (_, y) =>
    Array.from({ length: n }, (_, x) => {
      const end = (x + y) % n;
      return on.has(end) ? end : -1;
    })
  );
}

/** The yarn a changelog entry is woven in on the loom log. */
export const categoryYarn: Record<UpdateCategory, Kind> = {
  work: "lang",
  project: "ui",
  site: "data",
  learning: "three",
  life: "run",
};

/** Thread colours in the order threads start: the oldest thread is woad. */
const THREAD_YARNS = ["lang", "run", "data", "ui", "three"] as const;

export type ThreadRow = {
  role: Experience;
  thread: number;
  yarn: Kind;
  /** Where the role starts and how long it runs, as fractions of the axis. */
  start: number;
  length: number;
  current: boolean;
  tenure: string;
};

export type Loom = {
  /** One row per role, in the order given (newest first). */
  rows: ThreadRow[];
  threads: number;
  /** A thread carrying on: from the earlier role's row into the later one's. */
  carries: { from: number; to: number; yarn: Kind }[];
  years: { year: number; at: number }[];
  /** First month on the axis, as `YYYY-MM`. */
  from: string;
};

const monthLabel = (m: number) =>
  `${Math.floor(m / 12)}-${String((m % 12) + 1).padStart(2, "0")}`;

/**
 * Roles as threads over time. A role that continued into another (the team
 * moved, and so did I) is the same thread, so six roles can be four threads.
 * Threads are numbered by when they start.
 */
export function loomThreads(roles: readonly Experience[], today: Date): Loom {
  const now = monthIndex(today);
  if (roles.length === 0) {
    return { rows: [], threads: 0, carries: [], years: [], from: "" };
  }
  const spans = roles.map((role) => {
    const from = monthIndex(role.startDate);
    const to = role.endDate ? Math.max(from, monthIndex(role.endDate)) : now;
    return { role, from, to };
  });

  const index = new Map(roles.map((role, i) => [role.id, i]));
  const root = roles.map((_, i) => i);
  const find = (i: number): number => {
    let r = i;
    while (root[r] !== r) r = root[r] ?? r;
    return r;
  };
  const carries: { from: number; to: number }[] = [];
  roles.forEach((role, i) => {
    const next = role.continuedInto
      ? index.get(role.continuedInto.id)
      : undefined;
    if (next === undefined || next === i) return;
    root[find(next)] = find(i);
    carries.push({ from: i, to: next });
  });

  const chainStart = new Map<number, { from: number; company: string }>();
  spans.forEach((span, i) => {
    const r = find(i);
    const best = chainStart.get(r);
    if (
      !best ||
      span.from < best.from ||
      (span.from === best.from && span.role.company < best.company)
    ) {
      chainStart.set(r, { from: span.from, company: span.role.company });
    }
  });
  const order = [...chainStart.entries()]
    .sort(
      ([, a], [, b]) => a.from - b.from || a.company.localeCompare(b.company)
    )
    .map(([r]) => r);

  const first = Math.min(...spans.map((s) => s.from));
  const last = Math.max(now, ...spans.map((s) => s.to)) + 1;
  const width = last - first;
  const yarnOf = (thread: number) =>
    THREAD_YARNS[thread % THREAD_YARNS.length] ?? "lang";

  const rows = spans.map((span, i) => {
    const thread = order.indexOf(find(i));
    return {
      role: span.role,
      thread,
      yarn: yarnOf(thread),
      start: (span.from - first) / width,
      length: (span.to + 1 - span.from) / width,
      current: !span.role.endDate,
      tenure: formatTenure(span.role.startDate, span.role.endDate ?? today),
    };
  });

  const years: Loom["years"] = [];
  for (let m = Math.ceil(first / 12) * 12; m < last; m += 12) {
    years.push({ year: m / 12, at: (m - first) / width });
  }

  return {
    rows,
    threads: order.length,
    carries: carries.map((c) => ({
      ...c,
      yarn: rows[c.from]?.yarn ?? "lang",
    })),
    years,
    from: monthLabel(first),
  };
}

/** The dye each kind is spun in; also the CSS colour token `--color-<dye>`. */
export const kindDye: Record<Kind, string> = {
  lang: "woad",
  ui: "madder",
  data: "weld",
  run: "walnut",
  three: "orchil",
};

/** Sets `--y`, the element's yarn, to a kind's dye. Literal, so Tailwind sees it. */
export const yarnClass: Record<Kind, string> = {
  lang: "[--y:var(--color-woad)]",
  ui: "[--y:var(--color-madder)]",
  data: "[--y:var(--color-weld)]",
  run: "[--y:var(--color-walnut)]",
  three: "[--y:var(--color-orchil)]",
};

/** The ends raised in the most picks, most used first (ties keep draft order). */
export function topEnds(draft: Draft, n: number): End[] {
  const uses = (end: End) =>
    draft.raised.filter((row) => row[end.index]).length;
  return [...draft.ends]
    .sort((a, b) => uses(b) - uses(a) || a.index - b.index)
    .slice(0, n);
}
