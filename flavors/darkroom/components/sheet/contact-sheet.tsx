import type { Frame as FrameModel } from "@/flavors/darkroom/lib/roll";
import { ROLL } from "@/flavors/darkroom/lib/roll";
import { cn } from "@/flavors/darkroom/lib/utils";

import { Frame } from "./frame";

/**
 * The contact sheet: every frame of the roll printed in strips on one sheet
 * of paper, seven to a strip on wide screens, three on a phone.
 */
export function ContactSheet({
  frames,
  className,
}: {
  frames: readonly FrameModel[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "-mx-2 rounded-[2px] bg-paper px-3 pt-7 pb-8 shadow-sheet sm:mx-0 sm:px-8 sm:pt-10 sm:pb-11",
        className
      )}
    >
      <ol
        aria-label={`Roll ${ROLL}, frames 1 to ${frames.length}`}
        className="grid grid-cols-3 gap-y-8 md:grid-cols-5 md:gap-y-9 xl:grid-cols-7"
      >
        {frames.map((frame, i) => (
          <Frame
            key={frame.project.id}
            frame={frame}
            last={i === frames.length - 1}
          />
        ))}
      </ol>
    </div>
  );
}
