"use client";

import Link from "next/link";
import { nav } from "@/flavors/darkroom/content";
import { cn } from "@/flavors/darkroom/lib/utils";

import { usePublicPathname } from "@/lib/public-pathname";

export const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

/** Frames 01 to 04 of the roll. The current page gets a wax underline. */
export function NavLinks({ className }: { className?: string }) {
  const pathname = usePublicPathname();
  return (
    <ul className={cn("flex items-center gap-7", className)}>
      {nav.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
            className="group flex min-h-11 items-center gap-1.5 text-sm leading-none font-medium text-soft transition-colors duration-(--duration-ui) aria-[current=page]:text-ink fine:hover:text-ink"
          >
            <span aria-hidden className="edge text-[0.75rem] tracking-[0.1em]">
              ▸{item.key.padStart(2, "0")}
            </span>
            <span className="underline decoration-transparent decoration-2 underline-offset-[0.5em] transition-[text-decoration-color] duration-(--duration-ui) group-aria-[current=page]:decoration-grease">
              {item.label}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
