import * as React from "react";
import { cn } from "@/flavors/survey/lib/utils";

export function VisuallyHidden({
  as,
  className,
  children,
}: {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
}) {
  return React.createElement(
    as ?? "span",
    { className: cn("sr-only", className) },
    children
  );
}
