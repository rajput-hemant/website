import type { Experience, Project, ProjectStatus } from "@/lib/data/types";
import { monthIndex, parseIsoDate } from "@/lib/format";

/**
 * The mission model (docs/mission.md): the career read as one flight. T-0 is
 * the first role's start month; every role is a phase measured in months
 * from it, and the side projects before it are the pre-launch ground tests.
 * Pure, so the plot, the poster, the scene and the tests read one set of
 * numbers.
 */

const MON = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

export const pad2 = (n: number) => String(n).padStart(2, "0");

export type Phase = {
  /** The role's id, the anchor of its briefing on /work. */
  id: string;
  /** `PH-1` is the first role to start. */
  code: string;
  n: number;
  company: string;
  title: string;
  /** Start, in months from T-0. */
  a: number;
  /** End (exclusive), in months from T-0; null while the phase is still in flight. */
  b: number | null;
  /** Months served, to today for the current phase. */
  dur: number;
  /** Orbit inclination on the globe, degrees: whole months served x 4. */
  inc: number;
  /** Orbit node on the globe, degrees: the start month x 30. */
  node: number;
};

export type Flight = {
  /** T-0 as a month index (`year * 12 + month - 1`). */
  t0: number;
  /** Today, in months from T-0 (fractional). */
  now: number;
  phases: Phase[];
  /** The ground tests: years of side projects before launch, if any. */
  pre: { from: number; to: number; tests: Record<number, string[]> } | null;
};

/** The year and month of a month index. */
const ym = (index: number) => ({
  year: Math.floor(index / 12),
  month: (((index % 12) + 12) % 12) + 1,
});

/** Builds the flight from the roles and projects, as of `today`. */
export function flightPlan(
  experience: readonly Experience[],
  projects: readonly Project[],
  today: Date
): Flight {
  const roles = [...experience].sort(
    (x, y) => monthIndex(x.startDate) - monthIndex(y.startDate)
  );
  const first = roles[0];
  const t0 = first ? monthIndex(first.startDate) : monthIndex(today);
  const now = monthIndex(today) - t0 + (today.getDate() - 1) / 31;
  const phases = roles.map((role, i): Phase => {
    const a = monthIndex(role.startDate) - t0;
    const b = role.endDate ? monthIndex(role.endDate) + 1 - t0 : null;
    const dur = Math.max(0, (b ?? now) - a);
    return {
      id: role.id,
      code: `PH-${i + 1}`,
      n: i + 1,
      company: role.company,
      title: role.title,
      a,
      b,
      dur,
      inc: Math.round(dur) * 4,
      node: (parseIsoDate(role.startDate).month - 1) * 30,
    };
  });

  const launchYear = ym(t0).year;
  const tests: Record<number, string[]> = {};
  for (const project of projects) {
    if (project.year === null || project.year >= launchYear) continue;
    (tests[project.year] ??= []).push(project.name);
  }
  const years = Object.keys(tests).map(Number);
  const pre = years.length
    ? { from: Math.min(...years), to: launchYear, tests }
    : null;
  return { t0, now, phases, pre };
}

/** The phases on board at `t`. */
export const activeAt = (flight: Flight, t: number) =>
  flight.phases.filter((p) => t >= p.a && t < (p.b ?? Infinity));

export const isActive = (phase: Phase, t: number) =>
  t >= phase.a && t < (phase.b ?? Infinity);

/** `JUN 24` for a time in months from T-0. */
export function monthLabel(flight: Flight, t: number) {
  const { year, month } = ym(flight.t0 + Math.floor(t));
  return `${MON[month - 1] ?? ""} ${pad2(year % 100)}`;
}

/** `T+ 1Y 04M`. */
export function elapsed(t: number) {
  const m = Math.max(0, Math.floor(t));
  return `T+ ${Math.floor(m / 12)}Y ${pad2(m % 12)}M`;
}

/** A phase's dates as the phase list prints them: `SEP 24 to NOW`. */
export const phaseSpan = (flight: Flight, phase: Phase) =>
  `${monthLabel(flight, phase.a)} to ${phase.b === null ? "NOW" : monthLabel(flight, phase.b - 1)}`;

/** The first day of T-0, UTC, in ms: the MET clock counts from here. */
export function launchTime(flight: Flight) {
  const { year, month } = ym(flight.t0);
  return Date.UTC(year, month - 1, 1);
}

/** Mission elapsed time as `ddd:hh:mm:ss`. */
export function met(ms: number) {
  let s = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(s / 86_400);
  s %= 86_400;
  return `${String(days).padStart(3, "0")}:${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
}

/** The launch year of the first phase, for "T-0 June 2024". */
export function launchLabel(flight: Flight) {
  const { year, month } = ym(flight.t0);
  const name = MON[month - 1] ?? "";
  return `${name.charAt(0)}${name.slice(1).toLowerCase()} ${year}`;
}

/** What the readout names at `t`: a ground test year before launch, the crew after. */
export function readout(flight: Flight, t: number) {
  if (t < 0 && flight.pre) {
    const year = ym(flight.t0 + Math.floor(t)).year;
    const tests = flight.pre.tests[year];
    return {
      head: `Pre-launch · ${year}`,
      active: null,
      text: tests ? `${tests.join(", ")} launched` : "Ground test",
    };
  }
  const on = activeAt(flight, t);
  return {
    head: `${elapsed(t)} · ${monthLabel(flight, t)}`,
    active: `${on.length} active`,
    text: on.map((p) => `${p.code} ${p.company}`).join(", "),
  };
}

/** The flight plan's designation and revision: `HR-26`, `Rev 26.09`. */
export function revision(today: Date) {
  return {
    plan: `HR-${pad2(today.getFullYear() % 100)}`,
    rev: `Rev ${pad2(today.getFullYear() % 100)}.${pad2(today.getMonth() + 1)}`,
  };
}

/* Missions: the projects, each flown as its own mission with a patch. */

export type MissionState = "nominal" | "operational" | "inflight" | "deorbited";

export const missionState: Record<ProjectStatus, MissionState> = {
  maintained: "nominal",
  active: "operational",
  wip: "inflight",
  archived: "deorbited",
};

export const stateLabels: Record<MissionState, string> = {
  nominal: "Nominal",
  operational: "Operational",
  inflight: "In flight",
  deorbited: "Deorbited",
};

/** The orbits a patch can hold before the rings would touch the rim. */
export const MAX_ORBITS = 5;

const VOWELS = new Set(["A", "E", "I", "O", "U"]);

/**
 * A mission designation: the first letter and the next two consonants of the
 * name, then the launch year, so Infinitunes (2022) flies as `INF-22`.
 */
export function designation(project: Pick<Project, "name" | "year">) {
  const letters = project.name.toUpperCase().replace(/[^A-Z]/g, "");
  let code = letters.charAt(0);
  for (const ch of letters.slice(1)) {
    if (code.length === 3) break;
    if (!VOWELS.has(ch)) code += ch;
  }
  return project.year === null ? code : `${code}-${pad2(project.year % 100)}`;
}

/** Newest launch first, then by name, the order the manifest lists missions in. */
export const byLaunch = (projects: readonly Project[]) =>
  [...projects].sort(
    (x, y) => (y.year ?? 0) - (x.year ?? 0) || x.name.localeCompare(y.name)
  );
