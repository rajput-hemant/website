import { places } from "@/flavors/survey/content";
import { buildRelief, SHEET } from "@/flavors/survey/lib/relief";
import {
  CAIRN_MAX,
  cairnStone,
  decodeBoard,
  encodeBoard,
  fit,
  INSET_ASPECT,
  poseFor,
  propsFor,
  trialPoints,
  withProps,
  type SceneRoute,
} from "@/flavors/survey/lib/scene/poses";
import { describe, expect, it } from "vitest";

import { experience } from "@/content/fallback/experience";
import { projects } from "@/content/fallback/projects";
import { labExperiments } from "@/content/lab";

const relief = buildRelief(experience, projects, new Date(2026, 8, 20));
const routes: SceneRoute[] = [
  "projects",
  "project",
  "work",
  "about",
  "now",
  "ask",
  "entry",
  "lab",
  "trial",
  "resume",
  "owner",
  "notfound",
];

describe("poseFor", () => {
  it.each(routes)(
    "keeps the %s window on the sheet at the inset's shape",
    (route) => {
      const { window: w } = poseFor(relief, route);
      expect(w.w / w.h).toBeCloseTo(INSET_ASPECT, 5);
      if (w.h <= SHEET.H) {
        expect(w.cy - w.h / 2).toBeGreaterThanOrEqual(-1e-6);
        expect(w.cy + w.h / 2).toBeLessThanOrEqual(SHEET.H + 1e-6);
      }
      if (w.w <= SHEET.W) {
        expect(w.cx - w.w / 2).toBeGreaterThanOrEqual(-1e-6);
        expect(w.cx + w.w / 2).toBeLessThanOrEqual(SHEET.W + 1e-6);
      }
    }
  );

  it("is a fixed point of fit at the inset's shape", () => {
    const { window: w } = poseFor(relief, "work");
    expect(fit(w, INSET_ASPECT)).toEqual(w);
  });

  it("gives every page but home its own square", () => {
    for (const route of routes) {
      expect(poseFor(relief, route).window).not.toEqual(
        poseFor(relief, "home").window
      );
    }
  });

  it("stakes every trial on land, on the lane south of the boundary", () => {
    const trials = trialPoints(relief);
    expect(trials.map((t) => t.slug)).toEqual(
      labExperiments.map((t) => t.slug)
    );
    for (const t of trials) {
      expect(t.x).toBeLessThan(relief.coast);
      expect(t.p).toBeGreaterThan(SHEET.BOUNDARY);
      const { focus } = poseFor(relief, "trial", t.slug);
      expect(focus).toEqual({ x: t.x, p: t.p });
    }
    const first = trials[0];
    if (first) {
      expect(poseFor(relief, "lab").focus).toEqual({ x: first.x, p: first.p });
    }
  });

  it("puts each notebook entry near the current summit, each on its own spot", () => {
    const current = relief.summits.find((s) => s.current);
    const a = poseFor(relief, "entry", "3").focus;
    const b = poseFor(relief, "entry", "4").focus;
    expect(a).not.toEqual(b);
    expect(poseFor(relief, "entry", "3").focus).toEqual(a);
    if (current) {
      expect(Math.hypot(a.x - current.x, a.p - current.p)).toBeLessThan(20);
    }
  });

  it("camps the owner on land at the coast", () => {
    const { focus } = poseFor(relief, "owner");
    expect(focus.x).toBeLessThan(relief.coast);
    expect(relief.coast - focus.x).toBeLessThan(40);
  });

  it("looks at the sea for a missing page", () => {
    const { focus } = poseFor(relief, "notfound");
    expect(focus.x).toBeGreaterThan(relief.coast);
  });
});

describe("the board", () => {
  it("round-trips and names every summit and site", () => {
    const board = decodeBoard(encodeBoard(relief, poseFor(relief, "home")));
    expect(board?.hills).toHaveLength(relief.summits.length);
    expect(Object.keys(board?.points ?? {})).toHaveLength(
      relief.summits.length + relief.sites.length
    );
    expect(decodeBoard("not json")).toBeNull();
  });

  it("names each hill's role, in hill order", () => {
    const board = decodeBoard(encodeBoard(relief, poseFor(relief, "work")));
    expect(board?.ids).toEqual(relief.summits.map((s) => s.id));
  });
});

describe("props", () => {
  const kinds = (props: readonly { kind: string }[]) =>
    props.map((prop) => prop.kind);

  it("stands a theodolite on land at the coast of home, sighting the peak", () => {
    const [theodolite, ...rest] = propsFor(relief, "home");
    expect(rest).toHaveLength(0);
    expect(theodolite?.kind).toBe("theodolite");
    expect(theodolite?.x).toBeLessThan(relief.coast);
    expect(theodolite?.x).toBeGreaterThan(relief.coast - relief.yearW);
    const peak = relief.summits.reduce((a, b) => (b.h > a.h ? b : a));
    expect(theodolite?.to).toEqual([peak.x, peak.p]);
    expect(theodolite?.id).toBe("place:/now");
  });

  it("marks every site on the gazetteer, by condition", () => {
    const props = propsFor(relief, "projects");
    expect(props).toHaveLength(relief.sites.length);
    for (const site of relief.sites) {
      const prop = props.find((p) => p.id === `site:${site.slug}`);
      expect(prop?.kind).toBe(
        site.status === "archived"
          ? "antiquity"
          : site.status === "wip"
            ? "works"
            : "pillar"
      );
    }
  });

  it("sights a site's neighbours either side", () => {
    const site = relief.sites[1];
    if (!site) return;
    const props = propsFor(relief, "project", site.slug);
    const rays = props.filter((p) => p.kind === "ray");
    expect(rays.map((r) => r.id)).toEqual([
      `site:${relief.sites[0]?.slug}`,
      ...(relief.sites[2] ? [`site:${relief.sites[2].slug}`] : []),
    ]);
    expect(props.find((p) => p.id === `site:${site.slug}`)?.hot).toBe(true);
  });

  it("builds the cairn one stone per entry, capped, with a spare on /ask", () => {
    expect(kinds(propsFor(relief, "ask", undefined, { count: 3 }))).toEqual([
      "stone",
      "stone",
      "stone",
      "stone",
    ]);
    expect(propsFor(relief, "ask", undefined, { count: 3 }).at(-1)?.id).toBe(
      "stone:spare"
    );
    expect(propsFor(relief, "ask", undefined, { count: 99 })).toHaveLength(
      CAIRN_MAX
    );
    const entry = propsFor(relief, "entry", "2", { count: 3, entry: 2 });
    expect(entry).toHaveLength(3);
    expect(entry.filter((p) => p.hot)).toHaveLength(1);
    expect(entry[1]?.hot).toBe(true);
  });

  it("stacks cairn stones from the ground up", () => {
    const lifts = Array.from(
      { length: CAIRN_MAX },
      (_, i) => cairnStone(i).lift
    );
    expect(lifts[0]).toBe(0);
    expect([...lifts].sort((a, b) => a - b)).toEqual(lifts);
  });

  it("stakes the trials and lights this one", () => {
    const [first] = labExperiments;
    const props = propsFor(relief, "trial", first.slug);
    expect(props.find((p) => p.id === `trial:${first.slug}`)?.hot).toBe(true);
    expect(kinds(propsFor(relief, "lab"))).toEqual(
      labExperiments.map(() => "stake")
    );
  });

  it("puts a buoy at sea and a lighthouse aiming back at every page", () => {
    const props = propsFor(relief, "notfound");
    const buoy = props.find((p) => p.kind === "buoy");
    expect(buoy?.x).toBeGreaterThan(relief.coast);
    expect(props.find((p) => p.kind === "light")?.x).toBeLessThan(relief.coast);
    expect(props.filter((p) => p.kind === "aim")).toHaveLength(places.length);
  });

  it("carries the props on the board, with their ids as loupe points", () => {
    const sheet = withProps(relief, "lab");
    const board = decodeBoard(encodeBoard(sheet, poseFor(sheet, "lab")));
    expect(board?.props).toHaveLength(labExperiments.length);
    for (const t of labExperiments) {
      expect(board?.points[`trial:${t.slug}`]).toBeDefined();
    }
    expect(
      decodeBoard(encodeBoard(relief, poseFor(relief, "home")))?.props
    ).toEqual([]);
  });
});
