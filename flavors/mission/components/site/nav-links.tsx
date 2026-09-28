"use client";

import Link from "next/link";
import { nav } from "@/flavors/mission/content";
import { cn } from "@/flavors/mission/lib/utils";

import { usePublicPathname } from "@/lib/public-pathname";

export const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

/**
 * Sections 2.0 to 5.0. A red square marks the current one, and the one
 * under the pointer.
 */
export function NavLinks({ className }: { className?: string }) {
  const pathname = usePublicPathname();
  return (
    <ul className={cn("flex items-center gap-7 xl:gap-9", className)}>
      {nav.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
            className="group relative flex min-h-11 items-center font-display text-[0.9375rem] leading-none font-bold text-ink-soft transition-colors duration-(--duration-ui) ease-out aria-[current=page]:text-ink fine:hover:text-ink"
          >
            <i
              aria-hidden
              className="absolute top-1/2 -left-3 size-1.5 -translate-y-1/2 bg-signal opacity-0 transition-opacity duration-(--duration-ui) ease-out group-aria-[current=page]:opacity-100 fine:group-hover:opacity-100"
            />
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
