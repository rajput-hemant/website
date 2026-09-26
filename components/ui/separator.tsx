"use client";

import * as React from "react";
import { Separator as BaseSeparator } from "@base-ui/react/separator";

import { cn } from "@/lib/utils";

export type SeparatorProps = React.ComponentPropsWithRef<typeof BaseSeparator>;

/** A hairline rule. */
export function Separator({
  className,
  orientation,
  ...props
}: SeparatorProps) {
  return (
    <BaseSeparator
      orientation={orientation}
      className={cn(
        orientation === "vertical" ? "h-full w-px" : "h-px w-full",
        "bg-hairline",
        className
      )}
      {...props}
    />
  );
}
