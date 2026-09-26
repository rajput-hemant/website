"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { projectStatusLabels } from "@/lib/data/labels";
import type { Project } from "@/lib/data/types";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { useMotionOn } from "@/lib/motion/use-root-data";
import { cn } from "@/lib/utils";
import { ExternalLink } from "@/components/ui";

import { parseStackHash, stackHash } from "./stack-filter-hash";
import { stackSlug } from "./stack-slug";

type StackOption = { slug: string; name: string; count: number };
type PreviewImage = NonNullable<Project["image"]>;

function stackOptions(projects: readonly Project[]): StackOption[] {
  const bySlug = new Map<string, StackOption>();
  for (const project of projects) {
    for (const name of project.stack) {
      const slug = stackSlug(name);
      const existing = bySlug.get(slug);
      bySlug.set(
        slug,
        existing
          ? { ...existing, count: existing.count + 1 }
          : { slug, name, count: 1 }
      );
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

function chipClass(active: boolean) {
  return cn(
    "h-8 shrink-0 rounded-sm border px-3 font-mono text-mono-xs tracking-[0.1em] uppercase transition-colors duration-(--duration-ui)",
    active
      ? "border-accent bg-accent-soft text-paper"
      : "border-hairline text-pencil hover:border-rule hover:text-graphite"
  );
}

function ProjectLinks({ project }: { project: Project }) {
  if (!project.github && !project.live) return null;
  return (
    <span className="flex flex-wrap gap-x-4">
      {project.github && (
        <ExternalLink href={project.github}>GitHub</ExternalLink>
      )}
      {project.live && <ExternalLink href={project.live}>Live</ExternalLink>}
    </span>
  );
}

/**
 * Every project as a Brittany-Chiang-style table (year, name, stack, links),
 * with stack filter chips that rewrite `#stack=<slug>` in the URL hash. On
 * fine pointers, hovering a row floats its cover image on the cursor; the
 * same plane becomes a WebGL element in M4.
 */
export function ProjectArchiveTable({ projects }: { projects: Project[] }) {
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

  const motionOn = useMotionOn();
  const previewRef = React.useRef<HTMLDivElement>(null);
  const moveTo = React.useRef<{
    x: (value: number) => void;
    y: (value: number) => void;
  } | null>(null);
  const [preview, setPreview] = React.useState<PreviewImage | null>(null);

  useGSAP(() => {
    if (!previewRef.current) return;
    gsap.set(previewRef.current, { xPercent: -50, yPercent: -50 });
    const duration = motionOn ? 0.5 : 0;
    moveTo.current = {
      x: gsap.quickTo(previewRef.current, "x", { duration, ease: "power3" }),
      y: gsap.quickTo(previewRef.current, "y", { duration, ease: "power3" }),
    };
  }, [motionOn]);

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

  function handlePointerMove(event: React.PointerEvent, project: Project) {
    if (event.pointerType !== "mouse" || !project.image) return;
    moveTo.current?.x(event.clientX);
    moveTo.current?.y(event.clientY);
    setPreview(project.image);
  }

  function handlePointerLeave(event: React.PointerEvent) {
    if (event.pointerType === "mouse") setPreview(null);
  }

  return (
    <div className="mt-6">
      <div
        role="group"
        aria-label="Filter by stack"
        className="flex flex-wrap gap-2"
      >
        <button
          type="button"
          aria-pressed={activeStack === null}
          onClick={() => selectStack(null)}
          className={chipClass(activeStack === null)}
        >
          All
        </button>
        {stacks.map((option) => (
          <button
            key={option.slug}
            type="button"
            aria-pressed={activeStack === option.slug}
            onClick={() =>
              selectStack(activeStack === option.slug ? null : option.slug)
            }
            className={chipClass(activeStack === option.slug)}
          >
            {option.name} <span className="text-pencil">({option.count})</span>
          </button>
        ))}
      </div>

      <p
        aria-live="polite"
        className="mt-3 font-mono text-mono-xs text-pencil tabular-nums"
      >
        {activeStack
          ? `${visible.length} of ${projects.length} projects`
          : `${projects.length} projects`}
      </p>

      {/* md+: a real table. */}
      <table className="mt-6 hidden w-full border-collapse text-left md:table">
        <caption className="sr-only">All projects</caption>
        <thead>
          <tr className="border-b border-hairline font-mono text-mono-xs tracking-[0.1em] text-pencil uppercase">
            <th scope="col" className="w-20 py-2 font-normal">
              Year
            </th>
            <th scope="col" className="py-2 font-normal">
              Project
            </th>
            <th scope="col" className="py-2 font-normal">
              Made with
            </th>
            <th scope="col" className="py-2 font-normal">
              Links
            </th>
          </tr>
        </thead>
        <tbody>
          {visible.map((project) => (
            <tr
              key={project.id}
              onPointerMove={(event) => handlePointerMove(event, project)}
              onPointerLeave={handlePointerLeave}
              className="border-b border-hairline"
            >
              <td className="py-3 align-top font-mono text-mono-xs text-pencil tabular-nums">
                {project.year}
              </td>
              <td className="py-3 align-top">
                <Link
                  href={`/projects/${project.slug}`}
                  data-cursor="View"
                  className="font-display text-lg text-paper hover:text-accent"
                >
                  {project.name}
                </Link>
                <p className="mt-0.5 text-sm text-graphite">
                  {project.tagline}
                </p>
                <p className="mt-1 font-mono text-mono-xs tracking-[0.1em] text-pencil uppercase">
                  {projectStatusLabels[project.status]}
                </p>
              </td>
              <td className="py-3 align-top text-sm text-graphite">
                {project.stack.join(", ")}
              </td>
              <td className="py-3 align-top text-sm">
                <ProjectLinks project={project} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Below md: stacked rows. */}
      <ul className="mt-6 grid gap-6 md:hidden">
        {visible.map((project) => (
          <li
            key={project.id}
            onPointerMove={(event) => handlePointerMove(event, project)}
            onPointerLeave={handlePointerLeave}
            className="border-b border-hairline pb-6"
          >
            <p className="font-mono text-mono-xs text-pencil tabular-nums">
              {project.year}
            </p>
            <Link
              href={`/projects/${project.slug}`}
              data-cursor="View"
              className="mt-1 inline-block font-display text-lg text-paper"
            >
              {project.name}
            </Link>
            <p className="mt-1 text-sm text-graphite">{project.tagline}</p>
            <p className="mt-1 font-mono text-mono-xs tracking-[0.1em] text-pencil uppercase">
              {projectStatusLabels[project.status]}
            </p>
            <p className="mt-2 text-sm text-graphite">
              {project.stack.join(", ")}
            </p>
            <div className="mt-2 text-sm">
              <ProjectLinks project={project} />
            </div>
          </li>
        ))}
      </ul>

      {activeStack && visible.length === 0 && (
        <p className="mt-6 text-sm text-graphite">
          Nothing matches that filter.{" "}
          <button
            type="button"
            onClick={() => selectStack(null)}
            className="underline"
          >
            Clear it
          </button>
        </p>
      )}

      {/* Hover preview, fine pointers only. */}
      <div
        ref={previewRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-50 hidden w-56 fine:block"
        style={{ opacity: preview ? 1 : 0, transition: "opacity 160ms" }}
      >
        {preview && (
          <Image
            src={preview.url}
            alt=""
            width={preview.width}
            height={preview.height}
            className="aspect-[16/10] w-full rounded-md object-cover shadow-lift"
          />
        )}
      </div>
    </div>
  );
}
