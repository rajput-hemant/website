import { stackSlug } from "@/lib/data/stack-slug";
import type {
  Experience,
  Project,
  ProjectStatus,
  SkillGroup,
} from "@/lib/data/types";
import { monthIndex } from "@/lib/format";

/**
 * The movement's figures, all read from the data (docs/calibre.md): one jewel
 * per project, one complication per skill group, one role arc per job. No
 * three.js here, so the pages, the poster and the scene share it.
 */

/** The calibre's name: the owner's initials and the year it was regulated. */
export const CALIBRE = "HR-26";

/** One hertz per stack the owner ships on. */
export const STACKS = ["web", "server", "mobile"] as const;
export const HZ = STACKS.length;
/** Two beats per oscillation, 3,600 seconds an hour. */
export const VPH = HZ * 2 * 3600;
/** Beats a second, and so steps of the seconds index a second. */
export const BEATS_PER_SECOND = HZ * 2;

/** A movement always has two pallet stones; every other jewel sits in a chaton. */
export const PALLET_STONES = 2;

export const pad2 = (n: number) => String(n).padStart(2, "0");

const ROMAN = [
  "XII",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
] as const;

/** The Roman mark for an hour on the dial, 0 and 12 both read XII. */
export const roman = (hour: number) => ROMAN[((hour % 12) + 12) % 12] ?? "XII";

export type State = {
  /** The watchmaker's word, set on the card and in the legend. */
  word: string;
  /** What it means, in plain words. */
  meaning: string;
  /** The legend's pip: full, half or empty. */
  pip: "full" | "half" | "empty";
};

/** A project's status as the state of its jewel. */
export const states: Record<ProjectStatus, State> = {
  active: { word: "Running", meaning: "Active", pip: "full" },
  maintained: { word: "In service", meaning: "Maintained", pip: "full" },
  wip: { word: "In assembly", meaning: "Being built", pip: "half" },
  archived: { word: "Retired", meaning: "Archived", pip: "empty" },
};

/** The legend's order: the states the data actually uses, service first. */
export function legend(projects: readonly Project[]): ProjectStatus[] {
  const used = new Set(projects.map((p) => p.status));
  return (["active", "maintained", "wip", "archived"] as const).filter((s) =>
    used.has(s)
  );
}

export type Jewel = {
  project: Project;
  /** Jewel number in the movement, from 1. */
  n: number;
  /** How many jewels the movement has: the project count. */
  of: number;
  /** Featured projects are set in view on the home page. */
  inView: boolean;
};

/** Every project as a jewel, in catalogue order. */
export function jewels(projects: readonly Project[]): Jewel[] {
  return projects.map((project, i) => ({
    project,
    n: i + 1,
    of: projects.length,
    inView: project.featured,
  }));
}

/** Each jewel's number and project name, for its tag over the movement. */
export const jewelTags = (list: readonly Jewel[]) =>
  list.map((jewel) => ({ n: jewel.n, name: jewel.project.name }));

export type Point = { x: number; y: number };

/**
 * `count` positions round a ring of radius `r` about (cx, cy), the first at
 * twelve o'clock, clockwise. The jewel map on every card uses it.
 */
export function ring(count: number, r: number, cx = 0, cy = 0): Point[] {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / Math.max(1, count)) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  });
}

/** How the jewels split between the chatons and the pallet fork. */
export function jewelling(count: number) {
  const pallet = Math.min(PALLET_STONES, count);
  return { chatons: count - pallet, pallet };
}

/**
 * What marks a project as shipping on each stack: its stack names, as
 * `stackSlug` prints them. A project can ship on more than one.
 */
const STACK_MARKS: Record<(typeof STACKS)[number], readonly string[]> = {
  web: [
    "angular",
    "astro",
    "css",
    "html",
    "next",
    "nuxt",
    "qwik",
    "qwikcity",
    "react",
    "remix",
    "solid",
    "svelte",
    "sveltekit",
    "tailwind-css",
    "three",
    "vite",
    "vitepress",
    "vue",
  ],
  server: [
    "actix-web",
    "axum",
    "bun",
    "deno",
    "django",
    "express",
    "fastapi",
    "fastify",
    "flask",
    "gin",
    "hono",
    "nestjs",
    "node",
    "rails",
    "spring",
  ],
  mobile: [
    "android",
    "dart",
    "expo",
    "flutter",
    "ios",
    "kotlin",
    "react-native",
    "swift",
    "swiftui",
  ],
};

/** Each stack behind the frequency, with how many projects ship on it. */
export function stackCounts(
  projects: readonly Project[]
): { stack: (typeof STACKS)[number]; jewels: number }[] {
  return STACKS.map((stack) => ({
    stack,
    jewels: projects.filter((p) =>
      p.stack.some((name) => STACK_MARKS[stack].includes(stackSlug(name)))
    ).length,
  }));
}

const listFormat = new Intl.ListFormat("en", { type: "conjunction" });

/**
 * How the movement was assembled, from the roles: remote, for the countries
 * the remote roles were based in (newest first), or on site. Nothing when
 * there are no roles.
 */
export function assembly(roles: readonly Experience[]): string | undefined {
  if (!roles.length) return undefined;
  const remote = [...roles]
    .filter((r) => r.remote)
    .sort((a, b) => monthIndex(b.startDate) - monthIndex(a.startDate));
  if (!remote.length) return "On site";
  const countries = [
    ...new Set(
      remote
        .map((r) => r.location.split(",").at(-1)?.trim() ?? "")
        .filter(Boolean)
    ),
  ];
  return countries.length
    ? `Remote, for teams in ${listFormat.format(countries)}`
    : "Remote";
}

export type Sheet = {
  hz: number;
  vph: number;
  /** The stacks behind the frequency, with the projects on each. */
  stacks: { stack: string; jewels: number }[];
  /** How it was assembled: remote or on site, from the roles. */
  assembly: string | undefined;
  jewels: number;
  inView: number;
  complications: number;
  /** The skill groups, one complication each. */
  groups: string[];
};

/** The technical sheet: every figure counted from the data. */
export function technicalSheet(
  projects: readonly Project[],
  skills: readonly SkillGroup[],
  roles: readonly Experience[]
): Sheet {
  return {
    hz: HZ,
    vph: VPH,
    stacks: stackCounts(projects),
    assembly: assembly(roles),
    jewels: projects.length,
    inView: projects.filter((p) => p.featured).length,
    complications: skills.length,
    groups: skills.map((g) => g.title),
  };
}

export type Arc = {
  role: Experience;
  /** Ring from the outside, 0 is the newest role. */
  ring: number;
  /** Start and end as fractions of the subdial's span. */
  from: number;
  to: number;
  current: boolean;
};

export type ServiceRecord = {
  /** Months the subdial spans: whole years back from this month. */
  months: number;
  /** The first month on the dial, as a month index. */
  start: number;
  /** Year marks round the rim, oldest first. */
  years: { year: number; at: number }[];
  arcs: Arc[];
};

/**
 * The service record: a subdial that spans whole years back from this month,
 * long enough for the oldest role, with one arc per role, newest outermost.
 */
export function serviceRecord(
  roles: readonly Experience[],
  today: Date
): ServiceRecord {
  const now = monthIndex(today) + 1;
  const first = roles.reduce(
    (min, r) => Math.min(min, monthIndex(r.startDate)),
    now - 1
  );
  const months = Math.max(12, Math.ceil((now - first) / 12) * 12);
  const start = now - months;
  const frac = (m: number) => Math.min(1, Math.max(0, (m - start) / months));
  const newestFirst = [...roles].sort(
    (a, b) => monthIndex(b.startDate) - monthIndex(a.startDate)
  );
  const years: { year: number; at: number }[] = [];
  for (let m = Math.ceil(start / 12) * 12; m < now; m += 12) {
    years.push({ year: m / 12, at: frac(m) });
  }
  return {
    months,
    start,
    years,
    arcs: newestFirst.map((role, i) => ({
      role,
      ring: i,
      from: frac(monthIndex(role.startDate)),
      to: role.endDate ? frac(monthIndex(role.endDate) + 1) : 1,
      current: !role.endDate,
    })),
  };
}

/** A role's span as the dial prints it: `2024 to 26`, or `2026 to now`. */
export function span(role: Experience): string {
  const from = role.startDate.slice(0, 4);
  if (!role.endDate) return `${from} to now`;
  const to = role.endDate.slice(0, 4);
  return to === from ? from : `${from} to ${to.slice(2)}`;
}

/** An SVG arc path on a circle of radius `r` about (cx, cy), fractions of a turn from twelve. */
export function arcPath(
  cx: number,
  cy: number,
  r: number,
  from: number,
  to: number
): string {
  const at = (f: number) => {
    const a = f * Math.PI * 2 - Math.PI / 2;
    return `${(cx + Math.cos(a) * r).toFixed(2)} ${(cy + Math.sin(a) * r).toFixed(2)}`;
  };
  const sweep = Math.max(0.002, Math.min(0.9999, to - from));
  const large = sweep > 0.5 ? 1 : 0;
  return `M${at(from)}A${r} ${r} 0 ${large} 1 ${at(from + sweep)}`;
}

const ONES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
] as const;
const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
] as const;

/** A count as the dial printer engraves it, in words below a hundred: `fourteen`. */
export function spell(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 99) return String(n);
  if (n < 20) return ONES[n] ?? String(n);
  const unit = n % 10;
  const tens = TENS[Math.floor(n / 10)] ?? "";
  return unit ? `${tens}-${ONES[unit] ?? ""}` : tens;
}

/**
 * The figures printed round the bezel, clockwise from half past ten: the
 * calibre, its jewel count in words, its rate and where it was regulated.
 */
export function bezelPrints(
  jewelCount: number,
  location: string
): [string, string, string, string] {
  const town = location.split(",")[0]?.trim() ?? location;
  return [
    `Calibre ${CALIBRE}`,
    `${spell(jewelCount)} ${jewelCount === 1 ? "jewel" : "jewels"}`,
    `${new Intl.NumberFormat("en-US").format(VPH)} vph`,
    town,
  ];
}
