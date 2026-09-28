import type { Experience, Project, ProjectStatus } from "@/lib/data/types";
import { formatTenure, monthIndex, parseIsoDate } from "@/lib/format";

/** The model's scale, printed beside the name. */
export const SCALE = "1:100";

export const pad2 = (n: number) => String(n).padStart(2, "0");

export type Material = "card" | "wood" | "grey" | "foam";

export type Finish = {
  material: Material;
  /** What the piece is cut from, set on its plaque. */
  word: string;
  /** The status it stands for, in plain words. */
  meaning: string;
};

/** Material shows state: white card stands, a basswood frame is still going up, grey card is shelved. */
export const finishes: Record<ProjectStatus, Finish> = {
  active: { material: "card", word: "White card", meaning: "Active" },
  maintained: { material: "card", word: "White card", meaning: "Maintained" },
  wip: { material: "wood", word: "Basswood frame", meaning: "In progress" },
  archived: { material: "grey", word: "Grey card", meaning: "Archived" },
};

export const FOAM: Finish = {
  material: "foam",
  word: "Foam",
  meaning: "Context",
};

export type Piece = {
  project: Project;
  /** Catalogue number, from 1. */
  n: number;
  /** One storey per year since the first commit (at least one). */
  storeys: number;
  /** One bay per technology in the stack (at least one). */
  bays: number;
  /** The bays laid out as a grid: two rows once the stack passes five. */
  cols: number;
  rows: number;
  finish: Finish;
  featured: boolean;
};

/** The footprint grid for `bays`: a row up to five, then two rows. */
export function footprint(bays: number) {
  const n = Math.max(1, bays);
  const rows = n > 5 ? 2 : 1;
  return { cols: Math.ceil(n / rows), rows };
}

/** Every project cut to the one rule, in catalogue order. */
export function pieces(projects: readonly Project[], today: Date): Piece[] {
  const year = today.getFullYear();
  return projects.map((project, i) => {
    const bays = Math.max(1, project.stack.length);
    return {
      project,
      n: i + 1,
      storeys: Math.max(1, project.year === null ? 1 : year - project.year),
      bays,
      ...footprint(bays),
      finish: finishes[project.status],
      featured: project.featured,
    };
  });
}

/** `4 storeys · 8 bays`. */
export const dimensions = (piece: Pick<Piece, "storeys" | "bays">) =>
  `${piece.storeys} ${piece.storeys === 1 ? "storey" : "storeys"} · ${piece.bays} ${piece.bays === 1 ? "bay" : "bays"}`;

// The site: the plinth's card in bays. Everything is placed on this grid.

/** One bay, in model units; the plinth is 16 by 11 bays. */
export const BAY = 0.42;
export const SITE_W = 16;
export const SITE_D = 11;

/** One block on the site, in bays from the north-west corner. */
export type Block = {
  /** The piece's slug, or a role id on the phasing model. */
  id: string;
  cols: number;
  rows: number;
  storeys: number;
  material: Material;
  i: number;
  j: number;
};

/** What a page puts on the plinth, and the one piece lifted off it, if any. */
export type Board = { blocks: Block[]; focus: string | null };

type Want = Omit<Block, "i" | "j"> & { tx: number; ty: number };

/** Where the featured pieces want to stand, as fractions of the site (from the study model). */
const FEATURED_AT: readonly (readonly [number, number])[] = [
  [0.34, 0.36],
  [0.86, 0.6],
  [0.53, 0.72],
  [0.58, 0.18],
  [0.2, 0.74],
  [0.78, 0.25],
];

const fits = (placed: readonly Block[], b: Omit<Block, "id">) =>
  placed.every(
    (p) =>
      b.i + b.cols + 1 <= p.i ||
      p.i + p.cols + 1 <= b.i ||
      b.j + b.rows + 1 <= p.j ||
      p.j + p.rows + 1 <= b.j
  );

/** Puts each block at the free spot nearest its target, one bay apart; drops one that finds none. */
function place(wants: readonly Want[]): Block[] {
  const placed: Block[] = [];
  for (const { tx, ty, ...want } of wants) {
    let best: Block | null = null;
    let bestD = Infinity;
    for (let j = 0; j + want.rows <= SITE_D; j++) {
      for (let i = 0; i + want.cols <= SITE_W; i++) {
        const block = { ...want, i, j };
        if (!fits(placed, block)) continue;
        const d = Math.hypot(
          i + want.cols / 2 - tx * SITE_W,
          j + want.rows / 2 - ty * SITE_D
        );
        if (d < bestD) {
          bestD = d;
          best = block;
        }
      }
    }
    if (best) placed.push(best);
  }
  return placed;
}

/**
 * The site model. Featured pieces stand in their own material near the
 * middle; the rest of the catalogue rings them as one-storey foam context
 * blocks with their real footprints. With `allFinished`, every piece stands
 * in its own material at full height (the catalogue page).
 */
export function sitePlan(
  all: readonly Piece[],
  {
    allFinished = false,
    focus = null,
  }: { allFinished?: boolean; focus?: string | null } = {}
): Board {
  const inMaterial = all.filter((p) => allFinished || p.featured);
  const context = all.filter((p) => !(allFinished || p.featured));
  const wants: Want[] = [
    ...inMaterial.map((p, k): Want => {
      const [tx, ty] = FEATURED_AT[k % FEATURED_AT.length] ?? [0.5, 0.5];
      return {
        id: p.project.slug,
        cols: p.cols,
        rows: p.rows,
        storeys: p.storeys,
        material: p.finish.material,
        tx: allFinished ? 0.5 : tx,
        ty: allFinished ? 0.5 : ty,
      };
    }),
    ...context.map((p, k): Want => {
      // Round the edge of the site, evenly by angle.
      const a = (k / Math.max(1, context.length)) * Math.PI * 2 - Math.PI / 2;
      return {
        id: p.project.slug,
        cols: p.cols,
        rows: p.rows,
        storeys: 1,
        material: "foam",
        tx: 0.5 + Math.cos(a) * 0.5,
        ty: 0.5 + Math.sin(a) * 0.5,
      };
    }),
  ];
  // Bigger pieces first, so the small ones fill the gaps.
  const order = allFinished
    ? [...wants].sort((a, b) => b.cols * b.rows - a.cols * a.rows)
    : wants;
  return { blocks: place(order), focus };
}

export type Phase = {
  role: Experience;
  /** Phase number, counted from the first role. */
  n: number;
  current: boolean;
  tenure: string;
  months: number;
  /** Start and length along the plan's axis, 0..1. */
  start: number;
  span: number;
};

export type PhasingPlan = {
  /** Newest first, as the data comes. */
  phases: Phase[];
  /** The axis: its first month and the year marks along it (0..1). */
  from: string;
  ticks: { label: string; at: number }[];
  /** Months on the axis, for the plan's grid (one line per month). */
  months: number;
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * The phasing plan: each role as a dated phase on one axis from the first
 * start to now. The current phase is basswood.
 */
export function phasingPlan(
  roles: readonly Experience[],
  today: Date
): PhasingPlan {
  const now = monthIndex(today);
  const first = Math.min(now, ...roles.map((r) => monthIndex(r.startDate)));
  const months = Math.max(1, now - first + 1);
  const order = [...roles].sort(
    (a, b) =>
      monthIndex(a.startDate) - monthIndex(b.startDate) ||
      a.company.localeCompare(b.company)
  );
  const phases = roles.map((role) => {
    const start = monthIndex(role.startDate);
    const end = role.endDate ? monthIndex(role.endDate) : now;
    const length = Math.max(1, end - start + 1);
    return {
      role,
      n: order.indexOf(role) + 1,
      current: !role.endDate,
      tenure: formatTenure(role.startDate, role.endDate ?? today),
      months: length,
      start: (start - first) / months,
      span: length / months,
    };
  });
  const firstYear = Math.floor(first / 12);
  const firstMonth = first % 12;
  const ticks: { label: string; at: number }[] = [
    { label: `${MONTHS[firstMonth] ?? ""} ${firstYear}`, at: 0 },
  ];
  for (let y = firstYear + 1; y * 12 <= now; y++) {
    const at = (y * 12 - first) / months;
    if (at > 0.12 && at < 0.88) ticks.push({ label: String(y), at });
  }
  ticks.push({ label: "Now", at: 1 });
  return {
    phases,
    from: `${MONTHS[firstMonth] ?? ""} ${firstYear}`,
    ticks,
    months,
  };
}

/** `2026-01 to now`. */
export const phaseDates = (role: Experience) => {
  const fmt = (iso: string) => {
    const { year, month } = parseIsoDate(iso);
    return `${year}-${pad2(month)}`;
  };
  return `${fmt(role.startDate)} to ${role.endDate ? fmt(role.endDate) : "now"}`;
};

/**
 * The phasing model: each role as a one-storey slab on its own row, set
 * along the site by its start date, one bay per stretch of months. The
 * current one is basswood.
 */
export function phaseBoard(plan: PhasingPlan): Board {
  const rows = [...plan.phases].sort((a, b) => a.n - b.n);
  const gap =
    rows.length > 1
      ? Math.floor((SITE_D - rows.length) / (rows.length - 1))
      : 0;
  const top = Math.max(
    0,
    Math.floor((SITE_D - rows.length - gap * (rows.length - 1)) / 2)
  );
  const blocks = rows.map((phase, k): Block => {
    const i = Math.min(SITE_W - 1, Math.round(phase.start * (SITE_W - 1)));
    const cols = Math.max(
      1,
      Math.min(SITE_W - i, Math.round(phase.span * SITE_W))
    );
    return {
      id: phase.role.id,
      cols,
      rows: 1,
      storeys: 1,
      material: phase.current ? "wood" : "card",
      i,
      j: Math.min(SITE_D - 1, top + k * (gap + 1)),
    };
  });
  return { blocks, focus: null };
}

const MATERIAL_CODE: Record<Material, string> = {
  card: "c",
  wood: "w",
  grey: "g",
  foam: "f",
};

const CODE_MATERIAL: Record<string, Material> = {
  c: "card",
  w: "wood",
  g: "grey",
  f: "foam",
};

/** The board as `data-scene-board`: `focus|id,cols,rows,storeys,m,i,j;…`. */
export function encodeBoard(board: Board): string {
  return `${board.focus ?? ""}|${board.blocks
    .map((b) =>
      [
        b.id.replace(/[,;|]/g, ""),
        b.cols,
        b.rows,
        b.storeys,
        MATERIAL_CODE[b.material],
        b.i,
        b.j,
      ].join(",")
    )
    .join(";")}`;
}

const int = (v: string | undefined, min: number, max: number) => {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
};

/** Reads a board back; anything malformed is dropped rather than drawn. */
export function parseBoard(value: string | null): Board {
  if (!value) return { blocks: [], focus: null };
  const [focus = "", list = ""] = value.split("|");
  const blocks: Block[] = [];
  for (const entry of list.split(";")) {
    const [id, c, r, n, m, i, j] = entry.split(",");
    const material = CODE_MATERIAL[m ?? ""];
    if (!id || !material) continue;
    blocks.push({
      id,
      cols: int(c, 1, SITE_W),
      rows: int(r, 1, SITE_D),
      storeys: int(n, 1, 12),
      material,
      i: int(i, 0, SITE_W - 1),
      j: int(j, 0, SITE_D - 1),
    });
  }
  return { blocks, focus: focus || null };
}
