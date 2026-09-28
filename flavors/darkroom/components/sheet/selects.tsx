import Link from "next/link";
import { development, pad2, type Frame } from "@/flavors/darkroom/lib/roll";
import { cn } from "@/flavors/darkroom/lib/utils";

import { frameId } from "./frame";

/**
 * Frames as rows: number, name and line, stack, year and the darkroom word
 * for its status. Pointing at a row rings its frame on the sheet above.
 */
export function FrameList({
  frames,
  label,
  className,
}: {
  frames: readonly Frame[];
  label: string;
  className?: string;
}) {
  return (
    <ol
      aria-label={label}
      className={cn("border-t border-line-strong", className)}
    >
      {frames.map(({ project, n }) => {
        const stage = development[project.status];
        return (
          <li
            key={project.id}
            data-marks={frameId(project.slug)}
            className="group/row grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2.5 border-b border-line py-6 transition-[background-color] duration-(--duration-ui) [grid-template-areas:'f_s'_'t_t'_'k_y'] md:grid-cols-[5rem_minmax(0,1fr)_9rem] md:gap-x-6 md:[grid-template-areas:'f_t_s'_'._k_y'] xl:grid-cols-[6rem_minmax(0,1.5fr)_minmax(0,1fr)_4rem_9rem] xl:items-baseline xl:[grid-template-areas:'f_t_k_y_s'] fine:hover:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-grease)_7%,transparent),transparent_60%)]"
          >
            <span className="edge text-[0.9375rem] transition-colors duration-(--duration-ui) [grid-area:f] group-focus-within/row:text-grease fine:group-hover/row:text-grease">
              ▸ Frame {pad2(n)}
            </span>
            <div className="min-w-0 [grid-area:t]">
              <h3 className="text-[clamp(1.75rem,1.4rem+1vw,2.125rem)] leading-none tracking-[-0.035em]">
                <Link
                  href={`/projects/${project.slug}`}
                  className="underline decoration-transparent decoration-1 underline-offset-[0.18em] fine:hover:decoration-current"
                >
                  {project.name}
                </Link>
              </h3>
              <p className="mt-2.5 max-w-[44ch] text-soft">{project.tagline}</p>
            </div>
            <span className="edge text-soft [grid-area:k]">
              {project.stack.slice(0, 4).join(" · ")}
            </span>
            <span className="text-right edge text-soft [grid-area:y] xl:text-left">
              {project.year ?? ""}
            </span>
            <span className="flex flex-col items-end gap-1 text-right [grid-area:s]">
              <b className="text-[0.9375rem] leading-none font-semibold">
                {stage.word}
              </b>
              <span className="edge">{stage.meaning}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
