import type { Experience } from "@/lib/data/types";

/**
 * Where a continuity bracket passes through one row of the timeline:
 * - `start`: the upper role of the pair (the successor, in a newest-first list); the bracket leaves its dot and runs down.
 * - `through`: a role between the pair; the bracket runs the full height of the row.
 * - `end`: the lower role (the predecessor); the bracket arrives at its dot from above.
 */
export type LaneSegment = {
  /** 1 is the lane nearest the rail. */
  lane: number;
  kind: "start" | "through" | "end";
  /** The tick to the dot passes over a nearer lane's line and needs a gap cut into it. */
  crossesInnerLane: boolean;
};

export type ContinuityLanes = {
  /** One entry per role, in the order given. */
  rows: LaneSegment[][];
  laneCount: number;
};

type Bracket = { top: number; bottom: number; lane: number };

const overlaps = (a: Bracket, b: Bracket) =>
  a.top < b.bottom && b.top < a.bottom;

/**
 * Assigns each `continuedInto` link a lane beside the timeline rail, the way a
 * git graph lays out branches. Shorter links take nearer lanes so nested
 * links do not cross; links that only share an end row can share a lane,
 * which draws a chain of moves as one line.
 */
export function computeContinuityLanes(
  roles: readonly Experience[]
): ContinuityLanes {
  const indexById = new Map(roles.map((role, index) => [role.id, index]));

  const pending = roles.flatMap((role, index) => {
    const successor = role.continuedInto
      ? indexById.get(role.continuedInto.id)
      : undefined;
    if (successor === undefined || successor === index) return [];
    return [
      {
        top: Math.min(index, successor),
        bottom: Math.max(index, successor),
        lane: 0,
      },
    ];
  });

  pending.sort(
    (a, b) => a.bottom - a.top - (b.bottom - b.top) || a.top - b.top
  );

  const placed: Bracket[] = [];
  for (const bracket of pending) {
    let lane = 1;
    while (
      placed.some((other) => other.lane === lane && overlaps(other, bracket))
    ) {
      lane += 1;
    }
    placed.push({ ...bracket, lane });
  }

  const passesThrough = (row: number, lane: number) =>
    placed.some((b) => b.lane === lane && b.top < row && row < b.bottom);

  const rows = roles.map((_, row) =>
    placed
      .filter((b) => b.top <= row && row <= b.bottom)
      .map((b): LaneSegment => {
        const kind =
          row === b.top ? "start" : row === b.bottom ? "end" : "through";
        const crossesInnerLane =
          kind !== "through" &&
          Array.from({ length: b.lane - 1 }, (_, i) => i + 1).some((inner) =>
            passesThrough(row, inner)
          );
        return { lane: b.lane, kind, crossesInnerLane };
      })
      .sort((a, b) => a.lane - b.lane)
  );

  return {
    rows,
    laneCount: placed.reduce((max, b) => Math.max(max, b.lane), 0),
  };
}
