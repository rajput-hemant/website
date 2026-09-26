import type { Experience, Project, ProjectStatus } from "@/lib/data/types";
import { formatTenure, monthIndex } from "@/lib/format";

/** Two plates in register: P1 pink is interface, P2 blue is systems. */
export type Plate = "p1" | "p2";

const INTERFACE = [
  "react",
  "next",
  "native",
  "expo",
  "tailwind",
  "shadcn",
  "css",
  "html",
  "vue",
  "svelte",
  "astro",
  "vitepress",
  "motion",
  "framer",
  "three",
  "radix",
  "ui",
  "figma",
  "redux",
  "zustand",
  "tanstack",
  "vite",
];

/** Which plate a technology prints on. Anything not interface is systems. */
export function plateFor(tech: string): Plate {
  const words = tech.toLowerCase().split(/[^a-z0-9]+/);
  return words.some((word) => INTERFACE.includes(word)) ? "p1" : "p2";
}

/** A stack split into its two separations, in the order given. */
export function separate(stack: readonly string[]) {
  const plates: Record<Plate, string[]> = { p1: [], p2: [] };
  for (const tech of stack) plates[plateFor(tech)].push(tech);
  return plates;
}

export type PrintStatus = {
  label: string;
  /** What the stamp means, in plain words. */
  meaning: string;
  stamp: "solid" | "dashed" | "struck";
};

/** A project's status as the stamp on its signature. */
export const printStatus: Record<ProjectStatus, PrintStatus> = {
  active: { label: "On press", meaning: "Active", stamp: "solid" },
  maintained: { label: "In print", meaning: "Maintained", stamp: "solid" },
  wip: { label: "Proofing", meaning: "In progress", stamp: "dashed" },
  archived: { label: "Out of print", meaning: "Archived", stamp: "struck" },
};

export const pad2 = (n: number) => String(n).padStart(2, "0");

export type PressRun = {
  role: Experience;
  /** Run number, counted from the first role: the oldest is run 01. */
  run: number;
  /** Where the run starts and how long it is, as fractions of the log's axis. */
  start: number;
  length: number;
  current: boolean;
  tenure: string;
};

export type PressLog = {
  runs: PressRun[];
  /** Year ticks on the axis, as fractions. */
  years: { year: number; at: number }[];
  /** Most runs on press at once. */
  peak: number;
};

/**
 * The press log: every role as a run on one month axis from the first start
 * to `today`. Runs keep the order they came in (newest first); the run number
 * counts from the oldest.
 */
export function pressLog(roles: readonly Experience[], today: Date): PressLog {
  const now = monthIndex(today);
  const spans = roles.map((role) => {
    const from = monthIndex(role.startDate);
    const to = role.endDate ? Math.max(from, monthIndex(role.endDate)) : now;
    return { role, from, to };
  });
  if (spans.length === 0) return { runs: [], years: [], peak: 0 };

  const first = Math.min(...spans.map((s) => s.from));
  const last = Math.max(now, ...spans.map((s) => s.to)) + 1;
  const width = last - first;
  const order = [...spans].sort(
    (a, b) => a.from - b.from || a.role.company.localeCompare(b.role.company)
  );

  const runs = spans.map((span) => ({
    role: span.role,
    run: order.indexOf(span) + 1,
    start: (span.from - first) / width,
    length: (span.to + 1 - span.from) / width,
    current: !span.role.endDate,
    tenure: formatTenure(span.role.startDate, span.role.endDate ?? today),
  }));

  const years: PressLog["years"] = [];
  for (let m = Math.ceil(first / 12) * 12; m < last; m += 12) {
    years.push({ year: m / 12, at: (m - first) / width });
  }

  let peak = 0;
  for (let m = first; m < last; m++) {
    const on = spans.filter((s) => s.from <= m && m <= s.to).length;
    peak = Math.max(peak, on);
  }

  return { runs, years, peak };
}

/** The control strip: one patch per project, solid when it is featured. */
export function controlStrip(projects: readonly Project[]) {
  return projects.map((project) => ({
    slug: project.slug,
    name: project.name,
    solid: project.featured,
    plate: plateFor(project.stack[0] ?? ""),
  }));
}
