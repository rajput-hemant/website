import type { Experience, Project, ProjectStatus } from "@/lib/data/types";
import { formatTenure, monthIndex, parseIsoDate } from "@/lib/format";

import { archetypeFor, hash, type Archetype } from "./frame-art";

/** The invented film stock the whole roll is shot on: TypeScript, 2026. */
export const STOCK = "Halide TS·26";
export const ROLL = 26;

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** Edge print under a frame: the arrowed number and its half-frame code, the last one reads End. */
export const edgeCodes = (n: number, last: boolean) => ({
  arrow: `▸${n}`,
  half: last ? "End" : `${n}A`,
});

export type Development = {
  /** The darkroom word, set in the list and on the tag. */
  word: string;
  /** What it means, in plain words. */
  meaning: string;
  /** The grease-pencil tag on a marked frame. */
  tag: string;
};

/** A project's status as a stage of the print. */
export const development: Record<ProjectStatus, Development> = {
  active: { word: "In the tray", meaning: "Active", tag: "hot" },
  maintained: { word: "Fixed", meaning: "Maintained", tag: "keep" },
  wip: { word: "Developing", meaning: "In progress", tag: "wip" },
  archived: { word: "Sleeved", meaning: "Archived", tag: "sleeve" },
};

export type Frame = {
  project: Project;
  /** Frame number on the roll, from 1. */
  n: number;
  /** Featured projects are the selects: crop marks and a tag. */
  select: boolean;
  archetype: Archetype;
  /** Picks a variant of the picture, stable per slug. */
  seed: number;
};

/** The contact sheet: every project in roll order, the featured ones marked. */
export function contactSheet(projects: readonly Project[]): Frame[] {
  return projects.map((project, i) => ({
    project,
    n: i + 1,
    select: project.featured,
    archetype: archetypeFor(project),
    seed: hash(project.slug),
  }));
}

export type RollMark = { year: number; text: string };

export type RollStrip = {
  marks: RollMark[];
  years: number;
  roles: number;
  frames: number;
};

/**
 * The 35mm strip under the hero: the first frame, the first role and the
 * current one, as edge marks, then the roll's totals. Every mark is a date
 * from the data.
 */
export function rollStrip(
  projects: readonly Project[],
  experience: readonly Experience[],
  today: Date
): RollStrip {
  const years = projects
    .map((p) => p.year)
    .filter((y): y is number => y !== null);
  const firstFrame = years.length ? Math.min(...years) : null;
  const starts = experience.map((role) => parseIsoDate(role.startDate).year);
  const firstRole = starts.length ? Math.min(...starts) : null;
  const current = experience.find((role) => !role.endDate);
  const marks: RollMark[] = [];
  if (firstFrame !== null)
    marks.push({ year: firstFrame, text: "first frame" });
  if (firstRole !== null) marks.push({ year: firstRole, text: "first role" });
  if (current) {
    marks.push({
      year: parseIsoDate(current.startDate).year,
      text: current.company,
    });
  }
  const from = Math.min(
    firstFrame ?? today.getFullYear(),
    firstRole ?? today.getFullYear()
  );
  return {
    marks,
    years: today.getFullYear() - from,
    roles: experience.length,
    frames: projects.length,
  };
}

export type RollFrame = {
  role: Experience;
  /** Frame number, counted from the first role: the oldest is frame 1. */
  n: number;
  /** Dated edge code, `24·09` for September 2024. */
  code: string;
  current: boolean;
  tenure: string;
  /** Length in months, which sets the frame's width on the strip. */
  months: number;
};

const dated = (iso: string) => {
  const { year, month } = parseIsoDate(iso);
  return `${String(year).slice(-2)}·${pad2(month)}`;
};

/**
 * The experience roll: one frame per role, newest first as the data comes,
 * numbered from the oldest, with its start date printed on the edge.
 */
export function filmRoll(
  roles: readonly Experience[],
  today: Date
): RollFrame[] {
  const order = [...roles].sort(
    (a, b) =>
      monthIndex(a.startDate) - monthIndex(b.startDate) ||
      a.company.localeCompare(b.company)
  );
  return roles.map((role) => {
    const end = role.endDate ? monthIndex(role.endDate) : monthIndex(today);
    return {
      role,
      n: order.indexOf(role) + 1,
      code: dated(role.startDate),
      current: !role.endDate,
      tenure: formatTenure(role.startDate, role.endDate ?? today),
      months: Math.max(1, end - monthIndex(role.startDate) + 1),
    };
  });
}
