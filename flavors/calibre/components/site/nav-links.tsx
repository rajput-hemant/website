"use client";

import Link from "next/link";
import { nav } from "@/flavors/calibre/content";
import { askHour } from "@/flavors/calibre/lib/beat";
import { roman } from "@/flavors/calibre/lib/movement";
import { cn } from "@/flavors/calibre/lib/utils";

import { usePublicPathname } from "@/lib/public-pathname";

export const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

/**
 * The four pages at their hour marks: XII Projects, III Experience, VI Lab,
 * IX About. Pointing at one (or focusing it) asks the dial's rim index to
 * step to that mark; leaving lets it run back to the seconds. The current
 * page is underlined in blued steel.
 */
export function NavLinks({ className }: { className?: string }) {
  const pathname = usePublicPathname();
  return (
    <ul className={cn("flex items-center gap-7", className)}>
      {nav.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
            onPointerEnter={() => askHour(item.hour)}
            onPointerLeave={() => askHour(null)}
            onFocus={() => askHour(item.hour)}
            onBlur={() => askHour(null)}
            className="group flex min-h-11 items-center gap-1.5 whitespace-nowrap text-soft transition-colors duration-(--duration-ui) aria-[current=page]:text-ink fine:hover:text-ink max-sm:[&_.spec]:tracking-[0.06em]"
          >
            <span aria-hidden className="numeral-italic text-[1.0625rem]">
              {roman(item.hour)}
            </span>
            <span className="spec text-spec-lg text-inherit underline decoration-transparent decoration-1 underline-offset-[0.55em] transition-[text-decoration-color] duration-(--duration-ui) group-aria-[current=page]:decoration-steel">
              {item.label}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
