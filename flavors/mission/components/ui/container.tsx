import * as React from "react";
import { cn } from "@/flavors/mission/lib/utils";

/** The sample book's page: the edition's gutter and measure. */
export function Container({
  as: Tag = "div",
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "nav" | "article" | "aside";
}) {
  return (
    <Tag
      className={cn("mx-auto w-full max-w-[90rem] px-gutter", className)}
      {...props}
    />
  );
}
