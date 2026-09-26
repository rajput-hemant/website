import * as React from "react";
import { cn } from "@/flavors/timetable/lib/utils";

export type VisuallyHiddenProps = {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
};

export function VisuallyHidden({
  as,
  className,
  children,
}: VisuallyHiddenProps) {
  const Tag = as ?? "span";
  return React.createElement(
    Tag,
    { className: cn("sr-only", className) },
    children
  );
}
