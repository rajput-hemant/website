import * as React from "react";
import { cn } from "@/flavors/calibre/lib/utils";

/** The case: the edition's gutter and widest measure. */
export function Container({
  as: Tag = "div",
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "nav" | "article" | "aside";
}) {
  return (
    <Tag
      className={cn("mx-auto w-full max-w-[96rem] px-gutter", className)}
      {...props}
    />
  );
}
