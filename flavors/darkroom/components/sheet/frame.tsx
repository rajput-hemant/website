import Link from "next/link";
import { Art } from "@/flavors/darkroom/components/ui/art";
import {
  CropMarks,
  GreaseRing,
} from "@/flavors/darkroom/components/ui/grease-ring";
import {
  development,
  edgeCodes,
  STOCK,
  type Frame as FrameModel,
} from "@/flavors/darkroom/lib/roll";
import { cssVars } from "@/flavors/darkroom/lib/utils";

/** The DOM id of a frame on the sheet, which list rows point at with `data-marks`. */
export const frameId = (slug: string) => `frame-${slug}`;

/**
 * One frame of the roll on the contact sheet: rebate bands with the stock
 * name, DX bars and edge numbers, the picture, and on a select the crop
 * marks and a grease tag. Every frame is a link to its work print.
 */
export function Frame({ frame, last }: { frame: FrameModel; last: boolean }) {
  const { project, n, select } = frame;
  const codes = edgeCodes(n, last);
  const odd = n % 2 === 1;
  return (
    <li
      id={frameId(project.slug)}
      data-develops
      style={cssVars({ "--dd": `${((n - 1) % 7) * 80}ms` })}
      className="frame"
    >
      <div aria-hidden className="frame-band top">
        <span>{odd ? STOCK : ""}</span>
        {odd ? <span className="dx" /> : <span>▸</span>}
      </div>
      <Link
        href={`/projects/${project.slug}`}
        className="relative block aspect-[3/2] bg-img-lo"
      >
        <span className="sr-only">
          Frame {n}: {project.name}, {project.tagline}
          {select ? ", marked" : ""}
        </span>
        <Art archetype={frame.archetype} seed={frame.seed} />
        {select ? <CropMarks /> : null}
        <GreaseRing n={n} />
      </Link>
      <div aria-hidden className="frame-band bot">
        <span>{codes.arrow}</span>
        <span>{codes.half}</span>
      </div>
      {select ? (
        <span
          aria-hidden
          className="tag pointer-events-none absolute -top-4 right-1.5 -rotate-5 hand text-[0.75rem] leading-none"
        >
          {development[project.status].tag}
        </span>
      ) : null}
    </li>
  );
}
