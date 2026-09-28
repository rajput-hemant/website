import * as React from "react";
import Link from "next/link";
import { cn } from "@/flavors/timetable/lib/utils";

import { VisuallyHidden } from "./visually-hidden";

export type ArrowLinkProps = {
  href: string;
  external?: boolean;
  /** @default true */
  magnetic?: boolean;
  className?: string;
  children: React.ReactNode;
};

/** A bold link over a heavy underline; its arrow nudges 3px on hover (fine pointers, motion on). */
export function ArrowLink({
  href,
  external,
  magnetic = true,
  className,
  children,
}: ArrowLinkProps) {
  const classes = cn(
    "group inline-flex min-h-11 items-center gap-2.5 border-b-2 border-current text-base leading-none font-bold text-ink",
    className
  );
  const inner = (
    <>
      <span data-magnetic-inner={magnetic ? "" : undefined} className="pt-0.5">
        {children}
      </span>
      <span
        aria-hidden
        className="fine:motion:transition-transform fine:motion:duration-200 fine:motion:ease-enter fine:motion:group-hover:translate-x-[3px] fine:motion:group-focus-visible:translate-x-[3px]"
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
