import * as React from "react";
import { cn } from "@/flavors/minimal/lib/utils";

export type ContainerProps = React.ComponentProps<"div"> & {
  /**
   * `content` is the reading column (~42rem); `wide` is for grids and demos;
   * `frame` is the site chrome (header, footer): the reading column below
   * `2xl`, then the left rail plus the column, so it anchors the wide frame.
   */
  size?: "content" | "wide" | "frame";
};

/**
 * The wide frame (from `2xl`, 1536px). Below it every container is centred
 * as before. From it, one asymmetric frame holds the page:
 *
 *   [ rail 15rem ][ gap 3rem ][ column 42rem ][ gap 3rem ][ notes 12rem ]
 *
 * The frame is centred, so the reading column sits 1.5rem right of centre.
 * `content` keeps its 42rem box in the column; `wide` and `frame` span the
 * rail and the column (60rem, the same edges as the header). The variables
 * are set on every container so page code can build on them:
 * `--frame-rail`, `--frame-gap`, `--frame-note`. `FrameRail` and
 * `FrameNote` (./frame) place content in the margins.
 */
const frameVars =
  "[--frame-rail:15rem] [--frame-gap:3rem] [--frame-note:12rem] [--frame-width:calc(var(--frame-rail)+var(--content-width)+var(--frame-note)+2*var(--frame-gap))]";

const frameBox =
  "2xl:max-w-[calc(var(--frame-width)+2*var(--gutter))] 2xl:pr-[calc(var(--gutter)+var(--frame-gap)+var(--frame-note))]";

const sizes = {
  content: cn(
    "max-w-[calc(var(--content-width)+2*var(--gutter))]",
    frameBox,
    "2xl:pl-[calc(var(--gutter)+var(--frame-rail)+var(--frame-gap))]"
  ),
  wide: cn("max-w-[calc(var(--wide-width)+2*var(--gutter))]", frameBox),
  frame: cn("max-w-[calc(var(--content-width)+2*var(--gutter))]", frameBox),
} as const;

/** Centres content with the site gutters; the column width excludes the gutters. */
export function Container({
  size = "content",
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-(--gutter)",
        frameVars,
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
