import * as React from "react";

import { cn } from "@/lib/utils";

import { VisuallyHidden } from "./visually-hidden";

export type ExternalLinkProps = {
  href: string;
  /** Trailing "opens in a new tab" arrow glyph. @default true */
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<
  React.ComponentPropsWithRef<"a">,
  "href" | "className" | "children" | "target" | "rel"
>;

/** A link to another site: opens in a new tab, safely. */
export function ExternalLink({
  href,
  arrow = true,
  className,
  children,
  ...props
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "underline decoration-hairline underline-offset-[0.22em] fine:hover:text-accent",
        className
      )}
      {...props}
    >
      {children}
      {arrow ? (
        <span aria-hidden className="ml-0.5">
          ↗
        </span>
      ) : null}
      <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
    </a>
  );
}
