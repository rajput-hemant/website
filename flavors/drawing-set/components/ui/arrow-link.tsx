import * as React from "react";
import Link from "next/link";
import { cn } from "@/flavors/drawing-set/lib/utils";

import { VisuallyHidden } from "./visually-hidden";

export type ArrowLinkProps = {
  href: string;
  external?: boolean;
  /** @default true */
  magnetic?: boolean;
  className?: string;
  children: React.ReactNode;
};

/** A condensed-caps link whose redline arrow nudges 3px on hover (fine pointers, motion on). */
export function ArrowLink({
  href,
  external,
  magnetic = true,
  className,
  children,
}: ArrowLinkProps) {
  const classes = cn(
    "group inline-flex min-h-11 items-center gap-2.5 font-display text-[0.8125rem] leading-none font-semibold tracking-[0.09em] text-ink uppercase [font-stretch:72%]",
    className
  );
  const inner = (
    <>
      <span
        data-magnetic-inner={magnetic ? "" : undefined}
        className="border-b border-transparent py-1 transition-colors duration-200 fine:group-hover:border-line-strong"
      >
        {children}
      </span>
      <span
        aria-hidden
        className="text-accent fine:motion:transition-transform fine:motion:duration-200 fine:motion:ease-enter fine:motion:group-hover:translate-x-[3px] fine:motion:group-focus-visible:translate-x-[3px]"
      >
        {external ? "↗" : "→"}
      </span>
      {external ? <VisuallyHidden> (opens in a new tab)</VisuallyHidden> : null}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-magnetic={magnetic ? "" : undefined}
        className={classes}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link
      href={href}
      data-magnetic={magnetic ? "" : undefined}
      className={classes}
    >
      {inner}
    </Link>
  );
}
