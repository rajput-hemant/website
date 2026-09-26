import * as React from "react";

import { cn } from "@/lib/utils";

export type ContainerProps = React.ComponentProps<"div"> & {
  /** `content` is the reading column (~42rem); `wide` is for grids and demos. */
  size?: "content" | "wide";
};

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
        size === "content"
          ? "max-w-[calc(var(--content-width)+2*var(--gutter))]"
          : "max-w-[calc(var(--wide-width)+2*var(--gutter))]",
        className
      )}
      {...props}
    />
  );
}
