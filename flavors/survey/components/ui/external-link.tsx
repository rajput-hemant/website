import * as React from "react";
import { cn } from "@/flavors/survey/lib/utils";

import { VisuallyHidden } from "./visually-hidden";

export type ExternalLinkProps = {
  href: string;
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<
  React.ComponentPropsWithRef<"a">,
  "href" | "className" | "children" | "target" | "rel"
>;

/** A link off the sheet: opens in a new tab, safely, under a contour-brown rule. */
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
        "underline decoration-contour underline-offset-[0.3em] transition-colors duration-200 fine:hover:text-water",
        className
      )}
      {...props}
    >
      {children}
      {arrow ? (
        <span aria-hidden className="ml-0.5 text-ink-faint">
          ↗
        </span>
      ) : null}
      <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
    </a>
  );
}
