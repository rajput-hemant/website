import * as React from "react";
import { cn } from "@/flavors/timetable/lib/utils";

export type TagProps = {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
};

/** A small enamel plate: one stack item, a category, a platform name. */
export function Tag({ as, className, children }: TagProps) {
  const Cmp = as ?? "span";
  return React.createElement(
    Cmp,
    {
      className: cn(
        "inline-flex items-center gap-1.5 rounded-[3px] border-[1.5px] border-rule-strong px-2 pt-1.5 pb-1 text-[0.8125rem] leading-none font-bold whitespace-nowrap",
        className
      ),
    },
    children
  );
}
