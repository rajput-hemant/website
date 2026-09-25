import { type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type ArrowLinkProps = {
  href: string;
  children: ReactNode;
  /** Draw the resting underline; off for links set in `meta` type. */
  underline?: boolean;
  /** Off for a route with its own stylesheet, whose prefetch preloads CSS the current page never uses. */
  prefetch?: boolean;
  className?: string;
};

/** An internal link led onward by a → that nudges and takes the accent on hover. */
export function ArrowLink({
  href,
  children,
  underline = false,
  prefetch,
  className,
}: ArrowLinkProps) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={cn(
        "group/arrow hit-area inline-flex items-center gap-1.5 transition-colors duration-(--duration-exit)",
        className
      )}
    >
      <span className={cn(underline && "link")}>{children}</span>
      <ArrowRight
        aria-hidden
        strokeWidth={1.75}
        className="size-[1em] shrink-0 text-subtle transition-[translate,color] duration-(--duration-enter) ease-enter group-hover/arrow:translate-x-0.5 group-hover/arrow:text-accent"
      />
    </Link>
  );
}
