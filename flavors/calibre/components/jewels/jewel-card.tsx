import Link from "next/link";
import { pad2, type Jewel } from "@/flavors/calibre/lib/movement";
import { cn } from "@/flavors/calibre/lib/utils";

import { JewelMap } from "./jewel-map";
import { StatePip } from "./state-pip";

/**
 * A project as a jewel card: its map among all the jewels, its number and
 * year, the name and line, then its complications (the stack) and state.
 */
export function JewelCard({
  jewel,
  headingLevel = "h3",
  className,
}: {
  jewel: Jewel;
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  const { project, n, of } = jewel;
  const Heading = headingLevel;
  return (
    <article
      className={cn(
        "group/card relative flex flex-col gap-5 border-line pt-2",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <JewelMap n={n} of={of} />
        <p className="grid justify-items-end gap-1 text-right">
          <span className="spec">
            Jewel {pad2(n)} of {of}
          </span>
          {project.year ? (
            <span className="numeral-italic text-[2rem] leading-none">
              {project.year}
            </span>
          ) : null}
        </p>
      </div>
      <Heading className="text-h3">
        <Link
          href={`/projects/${project.slug}`}
          className="after:absolute after:inset-0 after:content-[''] fine:group-hover/card:text-steel"
        >
          {project.name}
        </Link>
      </Heading>
      <p className="max-w-[38ch] text-soft">{project.tagline}</p>
      <dl className="mt-auto grid border-t border-line text-sm">
        <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-3 border-b border-line py-2.5">
          <dt className="spec">Complications</dt>
          <dd>
            {project.stack.length ? project.stack.join(", ") : "None listed"}
          </dd>
        </div>
        <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-3 border-b border-line py-2.5">
          <dt className="spec">State</dt>
          <dd>
            <StatePip status={project.status} />
          </dd>
        </div>
      </dl>
    </article>
  );
}
