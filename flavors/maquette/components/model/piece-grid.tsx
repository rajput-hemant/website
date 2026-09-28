import type { Piece } from "@/flavors/maquette/lib/model";
import { cn } from "@/flavors/maquette/lib/utils";

import { Vitrine } from "./vitrine";

/** Vitrines in rows of four, two below lg and one on a phone. */
export function PieceGrid({
  pieces,
  label,
  className,
}: {
  pieces: readonly Piece[];
  label?: string;
  className?: string;
}) {
  return (
    <ol
      aria-label={label}
      className={cn(
        "grid gap-x-6 gap-y-14 sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-4 lg:gap-y-16",
        className
      )}
    >
      {pieces.map((piece) => (
        <Vitrine key={piece.project.id} piece={piece} />
      ))}
    </ol>
  );
}
