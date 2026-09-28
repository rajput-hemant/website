import Link from "next/link";
import { dimensions, pad2, type Piece } from "@/flavors/maquette/lib/model";
import { cn } from "@/flavors/maquette/lib/utils";

import { PieceDrawing } from "./drawing";

/**
 * One piece in its vitrine: the drawing, then the plaque with its number,
 * year and state, the line, and what it is cut from. Pointing at it lifts
 * the piece off the model.
 */
export function Vitrine({
  piece,
  heading: Heading = "h3",
  className,
}: {
  piece: Piece;
  heading?: "h2" | "h3";
  className?: string;
}) {
  const { project, finish } = piece;
  return (
    <li
      id={`p-${project.slug}`}
      data-scene-item={`piece:${project.slug}`}
      className={cn("group/piece piece-card scroll-mt-8", className)}
    >
      <Link href={`/projects/${project.slug}`} className="block h-full">
        <div className="vitrine">
          <PieceDrawing piece={{ ...piece, name: project.name }} />
        </div>
        <div className="grid grid-cols-[1.875rem_minmax(0,1fr)] pt-4.5">
          <span className="num leading-[1.6]">{pad2(piece.n)}</span>
          <div className="min-w-0">
            <Heading className="font-display text-h3 font-normal tracking-[-0.01em] transition-colors duration-(--duration-ui) group-focus-within/piece:text-cut fine:group-hover/piece:text-cut">
              {project.name}
            </Heading>
            <p className="mt-1 num">
              {project.year ?? "Undated"} · {finish.meaning.toLowerCase()}
            </p>
            <p className="mt-2.5 text-[0.9375rem] leading-normal">
              {project.tagline}
            </p>
            <p className="mt-3 border-t border-line pt-2.5 num leading-[1.6]">
              <b className="font-medium text-ink">
                {finish.word}, {dimensions(piece).replace(" · ", ", ")}.
              </b>{" "}
              {project.stack.join(", ")}
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
}

/** The material legend: what each finish means. */
export function MaterialLegend({ className }: { className?: string }) {
  const swatches = [
    { cls: "bg-piece", label: "White card, maintained" },
    {
      cls: "bg-transparent shadow-[inset_0_0_0_1.5px_var(--color-wood)] border-transparent",
      label: "Basswood frame, in progress",
    },
    { cls: "bg-grey", label: "Grey card, archived" },
    { cls: "bg-foam", label: "Foam, context" },
  ];
  return (
    <ul
      aria-label="Materials"
      className={cn("flex flex-wrap gap-x-5.5 gap-y-2", className)}
    >
      {swatches.map((s) => (
        <li key={s.label} className="flex items-center gap-2 num">
          <i
            aria-hidden
            className={cn("h-2.5 w-3.5 border border-piece-edge", s.cls)}
          />
          {s.label}
        </li>
      ))}
    </ul>
  );
}
