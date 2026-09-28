"use client";

import Link from "next/link";
import { nav } from "@/flavors/survey/content";
import { cn } from "@/flavors/survey/lib/utils";

import { usePublicPathname } from "@/lib/public-pathname";

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The primary nav: the current page carries a contour-brown rule under it. */
export function NavLinks({ className }: { className?: string }) {
  const pathname = usePublicPathname();
  return (
    <ul className={cn("flex items-center gap-8 lg:gap-10", className)}>
      {nav.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
            className="relative flex min-h-11 items-center text-sm font-medium whitespace-nowrap text-ink-soft transition-colors duration-150 after:absolute after:inset-x-0 after:bottom-2 after:h-px after:origin-left after:scale-x-0 after:bg-contour after:transition-transform after:duration-(--duration-ui) after:ease-enter aria-[current=page]:text-ink aria-[current=page]:after:scale-x-100 fine:hover:text-ink fine:hover:after:scale-x-100"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
