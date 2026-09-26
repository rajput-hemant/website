import * as React from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { VisuallyHidden } from "./visually-hidden";

export type ArrowLinkProps = {
  href: string;
  external?: boolean;
  /** @default true */
  magnetic?: boolean;
  className?: string;
  children: React.ReactNode;
};

/** A text link whose arrow nudges 3px on hover/focus (fine pointers, motion on). */
export function ArrowLink({
  href,
  external,
  magnetic = true,
  className,
  children,
}: ArrowLinkProps) {
  const Icon = external ? ArrowUpRight : ArrowRight;
  const classes = cn(
    "group inline-flex items-center gap-1 fine:hover:text-accent",
    className
  );
  const inner = (
    <>
      <span data-magnetic-inner={magnetic ? "" : undefined}>{children}</span>
      <span
        aria-hidden
        className="inline-flex fine:motion:transition-transform fine:motion:duration-(--duration-ui) fine:motion:ease-enter fine:motion:group-hover:translate-x-[3px] fine:motion:group-focus-visible:translate-x-[3px]"
      >
        <Icon className="size-4" strokeWidth={1.75} />
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
