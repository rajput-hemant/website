/**
 * The experience network: every role is a line on a true month axis. Lines
 * that run at the same time sit on separate tracks; a role that continued
 * into another (`continuedInto`) is a change at an interchange, and roles
 * that start in the same month share a joint departure. Pure, so the map,
 * the mobile line diagram and the tests all read the same layout.
 */
import type { Experience, IsoDate } from "@/lib/data/types";
import { parseIsoDate } from "@/lib/format";

export type NetworkRole = Pick<
  Experience,
  "id" | "company" | "title" | "startDate" | "endDate" | "continuedInto"
>;

export type NetworkLine = {
  id: string;
  company: string;
  title: string;
  /** Line colour slot, 1 to LINE_COLOURS, newest role first. */
  colour: number;
  /** Row on the map, 0 at the top. */
  row: number;
  /** First and last month in service (month index, inclusive). */
  from: number;
  to: number;
  current: boolean;
  /** Set when this line branches off a predecessor's row at `from`. */
  branchFrom: number | null;
  startDate: IsoDate;
  endDate?: IsoDate;
};

export type Interchange = {
  at: number;
  kind: "joint" | "change";
  rows: number[];
  ids: string[];
};

export type NetworkEvent = {
  at: number;
  kind: "start" | "end" | "change" | "here";
  text: string;
  ids: string[];
};

export type Network = {
  from: number;
  to: number;
  rows: number;
  lines: NetworkLine[];
  interchanges: Interchange[];
  /** The most lines in service at once, and the first run of months it held. */
  peak: { count: number; from: number; to: number };
  events: NetworkEvent[];
};

export const LINE_COLOURS = 6;

/** `2024-09-01` as a month index (year * 12 + month - 1). */
export function monthIndex(date: IsoDate | Date): number {
  if (date instanceof Date) return date.getFullYear() * 12 + date.getMonth();
  const { year, month } = parseIsoDate(date);
  return year * 12 + month - 1;
}

/** A month index back to the first of that month, `YYYY-MM-01`. */
export function monthDate(index: number): IsoDate {
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

const list = (names: string[]) =>
  names.length < 2
    ? (names[0] ?? "")
    : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;

/** Lays out `roles` (newest first, as `getExperience` returns them) up to `today`. */
export function buildNetwork(
  roles: readonly NetworkRole[],
  today: IsoDate | Date = new Date()
): Network {
  const now = monthIndex(today);
  const byId = new Map(roles.map((role) => [role.id, role]));
  const predecessor = new Map<string, string>();
  for (const role of roles) {
    const next = role.continuedInto?.id;
    if (next && byId.has(next)) predecessor.set(next, role.id);
  }

  const spans = roles.map((role, i) => {
    const from = monthIndex(role.startDate);
    return {
      role,
      colour: (i % LINE_COLOURS) + 1,
      from,
      to: role.endDate ? Math.max(from, monthIndex(role.endDate)) : now,
      current: !role.endDate,
    };
  });

  const order = [...spans].sort(
    (a, b) => a.from - b.from || roles.indexOf(b.role) - roles.indexOf(a.role)
  );
  const trackEnd: number[] = [];
  const trackOf = new Map<string, number>();
  for (const span of order) {
    const free = trackEnd
      .map((end, track) => ({ end, track }))
      .filter(({ end }) => end < span.from)
      .map(({ track }) => track);
    const pred = predecessor.get(span.role.id);
    const anchor = pred === undefined ? undefined : trackOf.get(pred);
    let track: number;
    if (free.length === 0) {
      track = trackEnd.length;
    } else if (anchor === undefined) {
      track = Math.min(...free);
    } else {
      track = free.reduce((best, t) =>
        Math.abs(t - anchor) < Math.abs(best - anchor) ? t : best
      );
    }
    trackEnd[track] = span.to;
    trackOf.set(span.role.id, track);
  }

  const rows = trackEnd.length;
  // The newest lines read first, so the highest track sits at the top.
  const rowOf = (id: string) => rows - 1 - (trackOf.get(id) ?? 0);

  const lines: NetworkLine[] = spans.map((span) => {
    const pred = predecessor.get(span.role.id);
    return {
      id: span.role.id,
      company: span.role.company,
      title: span.role.title,
      colour: span.colour,
      row: rowOf(span.role.id),
      from: span.from,
      to: span.to,
      current: span.current,
      branchFrom: pred === undefined ? null : rowOf(pred),
      startDate: span.role.startDate,
      endDate: span.role.endDate,
    };
  });
  const lineOf = new Map(lines.map((line) => [line.id, line]));

  const interchanges: Interchange[] = [];
  const startsAt = new Map<number, NetworkLine[]>();
  for (const line of lines) {
    const group = startsAt.get(line.from) ?? [];
    group.push(line);
    startsAt.set(line.from, group);
  }
  for (const [at, group] of startsAt) {
    const fresh = group.filter((line) => line.branchFrom === null);
    if (fresh.length > 1) {
      interchanges.push({
        at,
        kind: "joint",
        rows: fresh.map((line) => line.row).sort((a, b) => a - b),
        ids: fresh.map((line) => line.id),
      });
    }
  }
  for (const [next, prev] of predecessor) {
    const line = lineOf.get(next);
    const from = lineOf.get(prev);
    if (!line || !from) continue;
    interchanges.push({
      at: line.from,
      kind: "change",
      rows: [from.row],
      ids: [prev, next],
    });
  }
  interchanges.sort((a, b) => a.at - b.at);

  const first = Math.min(...lines.map((line) => line.from), now);
  const last = Math.max(...lines.map((line) => line.to), now);

  let peak = { count: 0, from: first, to: first };
  let run: { count: number; from: number } | null = null;
  for (let m = first; m <= last + 1; m++) {
    const count = lines.filter((l) => l.from <= m && m <= l.to).length;
    if (run && count !== run.count) {
      if (run.count > peak.count) peak = { ...run, to: m - 1 };
      run = null;
    }
    if (!run && m <= last) run = { count, from: m };
  }

  const events: NetworkEvent[] = [];
  const changed = new Set<string>();
  for (const [next, prev] of predecessor) {
    const line = lineOf.get(next);
    const from = lineOf.get(prev);
    if (!line || !from) continue;
    changed.add(next);
    changed.add(`end:${prev}`);
    events.push({
      at: line.from,
      kind: "change",
      text: `Change: ${from.company} to ${line.company}`,
      ids: [prev, next],
    });
  }
  const grouped = (kind: "start" | "end", pick: (l: NetworkLine) => number) => {
    const at = new Map<number, NetworkLine[]>();
    for (const line of lines) {
      if (kind === "start" && changed.has(line.id)) continue;
      if (kind === "end" && (line.current || changed.has(`end:${line.id}`)))
        continue;
      const group = at.get(pick(line)) ?? [];
      group.push(line);
      at.set(pick(line), group);
    }
    for (const [month, group] of at) {
      const sorted = [...group].sort((a, b) => b.row - a.row);
      const verb =
        kind === "start"
          ? sorted.length > 1
            ? "start"
            : "starts"
          : sorted.length > 1
            ? "end"
            : "ends";
      events.push({
        at: month,
        kind,
        text: `${list(sorted.map((l) => l.company))} ${verb}`,
        ids: sorted.map((l) => l.id),
      });
    }
  };
  grouped("start", (line) => line.from);
  grouped("end", (line) => line.to);
  const here = lines.filter((line) => line.current);
  if (here.length > 0) {
    events.push({
      at: now,
      kind: "here",
      text: `You are here, on ${list(here.map((line) => line.company))}`,
      ids: here.map((line) => line.id),
    });
  }
  const rank = { start: 0, change: 1, end: 2, here: 3 } as const;
  events.sort((a, b) => a.at - b.at || rank[a.kind] - rank[b.kind]);

  return { from: first, to: last, rows, lines, interchanges, peak, events };
}
