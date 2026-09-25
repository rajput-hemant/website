import { type ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export type BackLinkProps = {
  href: string;
  /** The parent page's name, e.g. "Lab". */
  children: ReactNode;
  className?: string;
};

/** "← Lab": the way up from a detail page to its index. */
export function BackLink({ href, children, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "hit-area link meta text-subtle hover:text-foreground",
        className
      )}
    >
      <span aria-hidden>← </span>
      {children}
    </Link>
  );
}
