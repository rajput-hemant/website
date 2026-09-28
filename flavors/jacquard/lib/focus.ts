import { kindNames, pad2, type Draft, type Kind } from "./weave";

/** What the draft is pointing at: one pick (a project) or one end (a technology). */
export type Focus = { type: "pick" | "end"; i: number } | null;

/** The draft reduced to what the page script needs to describe it. */
export type DraftSummary = {
  picks: { name: string; year: number | null; ends: number[] }[];
  ends: { tech: string; kind: Kind }[];
};

export function summarize(draft: Draft): DraftSummary {
  return {
    picks: draft.picks.map((pick) => ({
      name: pick.project.name,
      year: pick.project.year,
      ends: pick.ends,
    })),
    ends: draft.ends.map((end) => ({ tech: end.tech, kind: end.kind })),
  };
}

export const sameFocus = (a: Focus, b: Focus) =>
  a === b || (!!a && !!b && a.type === b.type && a.i === b.i);

/** The scene item the cloth answers to for a focus. */
export const sceneId = (focus: Focus) =>
  focus ? `${focus.type}:${focus.i}` : null;

/** The draft's caption line for a focus, or null to show the resting caption. */
export function readout(summary: DraftSummary, focus: Focus): string | null {
  if (!focus) return null;
  if (focus.type === "pick") {
    const pick = summary.picks[focus.i];
    if (!pick) return null;
    const techs = pick.ends.map((e) => summary.ends[e]?.tech ?? "").join(", ");
    const year = pick.year === null ? "" : `, ${pick.year}`;
    const n = pick.ends.length;
    return `Pick ${pad2(focus.i + 1)} · ${pick.name}${year} · ${n} ${n === 1 ? "end" : "ends"} raised: ${techs}.`;
  }
  const end = summary.ends[focus.i];
  if (!end) return null;
  const on = summary.picks.filter((pick) => pick.ends.includes(focus.i));
  return `End ${pad2(focus.i + 1)} · ${end.tech} · ${kindNames[end.kind]} · raised in ${on.length} of ${summary.picks.length} picks: ${on.map((p) => p.name).join(", ")}.`;
}

/** Whether an end is raised by the focus: the pick's own ends, or the end itself. */
export function raises(summary: DraftSummary, focus: Focus, end: number) {
  if (!focus) return false;
  return focus.type === "pick"
    ? (summary.picks[focus.i]?.ends.includes(end) ?? false)
    : focus.i === end;
}
