import * as React from "react";

import { cn } from "@/lib/utils";

export type SceneRoute =
  | "home"
  | "projects"
  | "project"
  | "work"
  | "about"
  | "now"
  | "ask"
  | "lab"
  | "resume"
  | "notfound";

export type SceneSize = "hero" | "window" | "none";

/** The drawer each route "pulls out" of the plan chest, for its brass label. */
const DRAWER_LABEL: Record<SceneRoute, string> = {
  home: "00 · Archive",
  projects: "01 · Projects",
  project: "01 · Specimen",
  work: "02 · Experience",
  about: "03 · About",
  now: "04 · Now",
  ask: "05 · Ask",
  lab: "06 · Lab",
  resume: "07 · Resume",
  notfound: "—— · Misfiled",
};

const SIZE_CLASS: Record<Exclude<SceneSize, "none">, string> = {
  hero: "h-[56svh] md:h-[78svh]",
  window: "h-[40svh] md:h-[44vh]",
};

/**
 * M1 stand-in for the M2 WebGL archive: a quiet, static illustration of the
 * drawer front for this route, sized and positioned exactly where the canvas
 * will later sit (`viewTransitionName: "scene"`, fixed height, so swapping in
 * the real scene in M2 costs no layout shift). Doubles as the permanent
 * no-WebGL fallback look.
 */
export function SceneSlot({
  route,
  size = "window",
}: {
  route: SceneRoute;
  size?: SceneSize;
}) {
  const grainId = React.useId();
  if (size === "none") return null;

  return (
    <div
      aria-hidden
      style={{ viewTransitionName: "scene" }}
      className={cn(
        "relative isolate w-full overflow-hidden bg-ink-sunken",
        SIZE_CLASS[size]
      )}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 55% at 28% 18%, var(--color-lamp) 0%, transparent 68%)",
          opacity: 0.16,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0, transparent calc(100% / 7 - 1px), var(--color-hairline) calc(100% / 7))",
        }}
      />

      <div className="absolute top-1/2 left-1/2 w-[min(90%,44rem)] -translate-x-1/2 -translate-y-1/2 rounded-md border border-hairline bg-ink-raised px-8 py-10 shadow-lift">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center rounded-sm border border-hairline bg-ink px-3 py-1.5 font-mono text-mono-xs tracking-[0.14em] text-lamp uppercase">
            {DRAWER_LABEL[route]}
          </span>
          <div className="h-px w-16 bg-rule" />
        </div>
      </div>

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-5 mix-blend-overlay"
        aria-hidden
      >
        <filter id={grainId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={2}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${grainId})`} />
      </svg>
    </div>
  );
}
