import * as React from "react";
import { cn } from "@/flavors/press/lib/utils";

type OverprintProps = {
  as?: "h1" | "h2" | "h3" | "p" | "span";
  children: React.ReactNode;
  /** Plates arrive far apart and snap into register as the title scrolls in. */
  snap?: boolean;
  className?: string;
} & Omit<React.HTMLAttributes<HTMLElement>, "children" | "className">;

/**
 * The same words on two plates, pink over blue, out of register until
 * something pulls them in. The blue plate is the real text; the pink one is
 * hidden from assistive tech, so it is read once.
 */
export function Overprint({
  as: Tag = "span",
  children,
  snap = false,
  className,
  ...props
}: OverprintProps) {
  return (
    <Tag className={cn("ovp", snap && "snap-in", className)} {...props}>
      <span className="p1" aria-hidden>
        {children}
      </span>
      <span className="p2">{children}</span>
    </Tag>
  );
}
