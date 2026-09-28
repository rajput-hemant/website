import Link from "next/link";
import { MissionPatch } from "@/flavors/mission/components/flight/patch";
import {
  designation,
  missionState,
  stateLabels,
} from "@/flavors/mission/lib/flight";
import { cn } from "@/flavors/mission/lib/utils";

import { projectStatusLabels } from "@/lib/data/labels";
import type { Project } from "@/lib/data/types";

/** The state lamp: filled ink, red in flight, an empty ring once deorbited. */
export function StateLamp({
  state,
  className,
}: {
  state: keyof typeof stateLabels;
  className?: string;
}) {
  return (
    <i
      aria-hidden
      className={cn(
        "inline-block size-2 shrink-0 rounded-full",
        state === "inflight"
          ? "bg-signal"
          : state === "deorbited"
            ? "border-[1.5px] border-ink-faint"
            : "bg-ink",
        className
      )}
    />
  );
}

/**
 * One mission in the manifest: its patch, designation and launch year, the
 * name, the state, the line, and the payload spec. The whole card is the
 * link; pointing at it turns the patch's orbits.
 */
export function MissionCard({
  project,
  index,
  headingLevel = "h3",
  className,
}: {
  project: Project;
  index: number;
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  const Heading = headingLevel;
  const state = missionState[project.status];
  const code = designation(project);
  return (
    <article
      className={cn(
        "group/mission relative flex h-full flex-col has-[h2_a:focus-visible,h3_a:focus-visible]:outline-2 has-[h2_a:focus-visible,h3_a:focus-visible]:-outline-offset-2 has-[h2_a:focus-visible,h3_a:focus-visible]:outline-focus max-sm:grid max-sm:grid-cols-[6rem_minmax(0,1fr)] max-sm:content-start max-sm:gap-x-[1.125rem]",
        className
      )}
    >
      <MissionPatch
        id={`patch-${project.slug}`}
        name={project.name}
        code={code}
        state={state}
        technologies={project.stack.length}
        year={project.year}
        index={index}
        className="mb-6 size-[9.25rem] max-sm:row-span-3 max-sm:mb-0 max-sm:size-24"
      />
      <p className="label">
        {code}
        {project.year !== null ? ` · Launched ${project.year}` : ""}
      </p>
      <Heading className="mt-2 text-h3 transition-colors duration-(--duration-ui) ease-out fine:group-hover/mission:text-signal">
        <Link
          href={`/projects/${project.slug}`}
          className="outline-none after:absolute after:inset-0"
        >
          {project.name}
        </Link>
      </Heading>
      <p
        className={cn(
          "mt-3 flex items-center gap-2 font-mono text-[0.6875rem] leading-none font-semibold tracking-[0.08em] uppercase",
          state === "inflight" && "text-signal"
        )}
      >
        <StateLamp state={state} />
        {stateLabels[state]}
      </p>
      <p className="mt-3.5 max-w-[30ch] text-[0.96875rem] text-ink-soft max-sm:col-span-2">
        {project.tagline}
      </p>
      <dl className="mt-auto grid grid-cols-[auto_minmax(0,1fr)] gap-x-3.5 gap-y-1.5 pt-6 font-mono text-[0.6875rem] leading-[1.4] tracking-[0.04em] uppercase max-sm:col-span-2">
        <dt className="text-ink-faint">Orbits</dt>
        <dd>{project.stack.length}</dd>
        <dt className="text-ink-faint">Payload</dt>
        <dd>{project.stack.join(", ") || "Not recorded"}</dd>
        <dt className="text-ink-faint">Status</dt>
        <dd>{projectStatusLabels[project.status]}</dd>
      </dl>
    </article>
  );
}
