"use client";

import Link from "next/link";
import { nav } from "@/flavors/jacquard/content";
import { cn } from "@/flavors/jacquard/lib/utils";

import { usePublicPathname } from "@/lib/public-pathname";

export const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

/**
 * Cards 2 to 5, each with its count as a superscript (projects, roles). The
 * current one is underlined with a madder thread.
 */
export function NavLinks({
  counts,
  className,
}: {
  counts: Partial<Record<string, number>>;
  className?: string;
}) {
  const pathname = usePublicPathname();
  return (
    <ul className={cn("flex items-center gap-8 xl:gap-10", className)}>
      {nav.map((item) => {
        const count = counts[item.href];
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className="group flex min-h-11 items-center text-sm font-medium text-ink-soft transition-colors duration-(--duration-ui) ease-out aria-[current=page]:text-ink fine:hover:text-ink"
            >
              <span className="border-b border-transparent py-1 transition-[border-color] duration-(--duration-ui) ease-out group-aria-[current=page]:border-madder fine:group-hover:border-madder">
                {item.label}
              </span>
              {count !== undefined ? (
                <sup className="ml-1 font-mono text-[0.625rem] text-ink-faint">
                  {count}
                </sup>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
