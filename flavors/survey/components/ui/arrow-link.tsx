import * as React from "react";
import Link from "next/link";
import { cn } from "@/flavors/survey/lib/utils";

import { VisuallyHidden } from "./visually-hidden";

/** A link over a contour-brown rule; its arrow steps along 3px on hover. */
export function ArrowLink({
  href,
  external,
  className,
  children,
}: {
  href: string;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const classes = cn(
    "group inline-flex min-h-11 items-center gap-2 font-medium text-ink underline decoration-contour underline-offset-[0.35em] transition-colors duration-200 fine:hover:text-water",
    className
  );
  const inner = (
    <>
      {children}
      <span
        aria-hidden
        className="no-underline fine:motion:transition-transform fine:motion:duration-200 fine:motion:ease-enter fine:motion:group-hover:translate-x-[3px]"
      >
        {external ? "↗" : "→"}
      </span>
      {external ? <VisuallyHidden> (opens in a new tab)</VisuallyHidden> : null}
    </>
  );
  return external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={classes}
    >
      {inner}
    </a>
  ) : (
    <Link href={href} className={classes}>
      {inner}
    </Link>
  );
}
