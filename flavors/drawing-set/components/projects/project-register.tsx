"use client";

import * as React from "react";
import Link from "next/link";
import { CatalogueNumber, Schedule } from "@/flavors/drawing-set/components/ui";
import { cn } from "@/flavors/drawing-set/lib/utils";

import { stackSlug } from "@/lib/data/stack-slug";
import type { Project } from "@/lib/data/types";

import { DrawingFrame } from "./drawing-frame";
import { parseStackHash, stackHash } from "./stack-filter-hash";
import { StatusStamp } from "./status-stamp";

type StackOption = { slug: string; name: string; count: number };

const COLUMNS = [
  { key: "no", label: "Dwg no.", className: "w-28 max-md:w-20" },
  { key: "title", label: "Title" },
  { key: "discipline", label: "Discipline", className: "max-md:hidden" },
  { key: "year", label: "Year", className: "w-20 max-md:hidden" },
  {
    key: "status",
    label: "Status",
    align: "right" as const,
    className: "w-36",
  },
];

function stackOptions(projects: readonly Project[]): StackOption[] {
  const bySlug = new Map<string, StackOption>();
  for (const project of projects) {
    for (const name of project.stack) {
      const slug = stackSlug(name);
      const existing = bySlug.get(slug);
      bySlug.set(slug, { slug, name, count: (existing?.count ?? 0) + 1 });
    }
  }
  return [...bySlug.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  );
}

function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
const getHash = () => window.location.hash;
// The page is static: the server knows no hash, so it renders every project.
const getServerHash = () => "";

function selectStack(slug: string | null) {
  const next = stackHash(slug);
  const { pathname, search } = window.location;
  window.history.replaceState(
    null,
    "",
    next ? `#${next}` : `${pathname}${search}`
  );
  window.dispatchEvent(new Event("hashchange"));
}

function chipClass(active: boolean) {
  return cn(
    "h-11 shrink-0 border px-3 font-mono text-mono-xs tracking-[0.08em] uppercase transition-colors duration-200 sm:h-8",
    active
      ? "border-accent text-accent"
      : "border-line text-ink-soft fine:hover:border-line-strong fine:hover:text-ink"
  );
}

function StackFilter({
  stacks,
  active,
}: {
  stacks: StackOption[];
  active: string | null;
}) {
  return (
    <div
      role="group"
      aria-label="Filter by stack"
      className="flex flex-wrap gap-2"
    >
      <button
        type="button"
        aria-pressed={active === null}
        onClick={() => selectStack(null)}
        className={chipClass(active === null)}
      >
        All
      </button>
      {stacks.map((option) => (
        <button
          key={option.slug}
          type="button"
          aria-pressed={active === option.slug}
          onClick={() =>
            selectStack(active === option.slug ? null : option.slug)
          }
          className={chipClass(active === option.slug)}
        >
          {option.name}{" "}
          <span className="text-ink-faint tabular-nums">{option.count}</span>
        </button>
      ))}
    </div>
  );
}

/** Row hover (fine pointers): a redline leader from the pointer to a preview of the sheet. */
function useLeader() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [project, setProject] = React.useState<Project | null>(null);

  const move = (event: React.PointerEvent) => {
    ref.current?.style.setProperty(
      "transform",
      `translate3d(${event.clientX}px, ${event.clientY}px, 0)`
    );
  };

  React.useEffect(() => {
    const path = ref.current?.querySelector("polyline");
    if (!project || !path) return;
    if (document.documentElement.dataset.motion !== "on") return;
    path.animate([{ strokeDashoffset: 64 }, { strokeDashoffset: 0 }], {
      duration: 200,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    });
  }, [project]);

  return { leaderRef: ref, preview: project, setPreview: setProject, move };
}

/**
 * The drawing register: stack filter chips that rewrite `#stack=<slug>`, then
 * every project as a schedule row. Row links carry `data-scene-item`, which
 * the scene reads to lift the matching sheet.
 */
export function ProjectRegister({ projects }: { projects: Project[] }) {
  const hash = React.useSyncExternalStore(
    subscribeHash,
    getHash,
    getServerHash
  );
  const activeStack = parseStackHash(hash);
  const stacks = React.useMemo(() => stackOptions(projects), [projects]);
  const visible = activeStack
    ? projects.filter((project) =>
        project.stack.some((name) => stackSlug(name) === activeStack)
      )
    : projects;
  const { leaderRef, preview, setPreview, move } = useLeader();
  function rowProject(target: EventTarget) {
    const row = (target as Element).closest?.("tbody tr");
    return row instanceof HTMLTableRowElement
      ? visible[row.sectionRowIndex]
      : undefined;
  }

  function onPointerOver(event: React.PointerEvent) {
    if (event.pointerType !== "mouse") return;
    setPreview(rowProject(event.target) ?? null);
  }

  function onPointerLeave() {
    setPreview(null);
  }

  const rows = visible.map((project) => ({
    no: (
      <CatalogueNumber
        n={projects.indexOf(project) + 1}
        className="text-ink-faint"
      />
    ),
    title: (
      <>
        <Link
          href={`/projects/${project.slug}`}
          data-cursor="View"
          data-scene-item={`project:${project.slug}`}
          className="font-display text-[clamp(1.5rem,1rem+1.6vw,2.125rem)] leading-[0.95] font-[540] uppercase [font-stretch:66%] fine:hover:text-accent"
        >
          {project.name}
        </Link>
        <span className="mt-2.5 block max-w-[40ch] text-sm text-ink-soft">
          {project.tagline}
        </span>
        <span className="mt-2 block font-mono text-mono-xs tracking-[0.08em] text-ink-faint uppercase md:hidden">
          {project.year} · {project.stack.join(" · ")}
        </span>
      </>
    ),
    discipline: (
      <span className="font-mono text-mono-xs leading-[1.9] tracking-[0.07em] text-ink-soft uppercase">
        {project.stack.join(" · ")}
      </span>
    ),
    year: (
      <span className="font-mono text-mono-xs text-ink-soft tabular-nums">
        {project.year}
      </span>
    ),
    status: <StatusStamp status={project.status} />,
  }));

  return (
    <div>
      <StackFilter stacks={stacks} active={activeStack} />
      <p
        aria-live="polite"
        className="mt-3 font-mono text-mono-xs tracking-[0.08em] text-ink-faint uppercase tabular-nums"
      >
        {activeStack
          ? `${visible.length} of ${projects.length} drawings`
          : `${projects.length} drawings`}
      </p>

      <div
        onPointerOver={onPointerOver}
        onPointerMove={move}
        onPointerLeave={onPointerLeave}
      >
        <Schedule caption="Drawing register" columns={COLUMNS} rows={rows} />
      </div>

      {activeStack && visible.length === 0 && (
        <p className="mt-6 text-sm text-ink-soft">
          No drawing uses that stack.{" "}
          <button
            type="button"
            onClick={() => selectStack(null)}
            className="underline underline-offset-4 fine:hover:text-accent"
          >
            Clear the filter
          </button>
        </p>
      )}

      <div
        ref={leaderRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-40 hidden fine:block"
        style={{ visibility: preview ? "visible" : "hidden" }}
      >
        <svg
          width="48"
          height="20"
          className="absolute overflow-visible text-accent"
        >
          <circle cx="0" cy="0" r="2.4" fill="currentColor" />
          <polyline
            points="0,0 28,0 44,16"
            fill="none"
            stroke="currentColor"
            strokeDasharray="64"
          />
        </svg>
        {preview && (
          <div className="absolute top-4 left-11 w-56 border border-accent bg-ground p-2">
            <DrawingFrame
              view="View A"
              caption={preview.name}
              image={preview.image}
              sizes="14rem"
            />
          </div>
        )}
      </div>
    </div>
  );
}
