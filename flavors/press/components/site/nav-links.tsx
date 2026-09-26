"use client";

import Link from "next/link";
import { nav } from "@/flavors/press/content";
import { cn } from "@/flavors/press/lib/utils";

import { usePublicPathname } from "@/lib/public-pathname";

export const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

/** Sheets 2 to 5. The current sheet is underlined in pink, like a mark on the proof. */
export function NavLinks({ className }: { className?: string }) {
  const pathname = usePublicPathname();
  return (
    <ul className={cn("flex items-center gap-7 xl:gap-9", className)}>
      {nav.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
            data-cursor={`Sheet ${item.n}`}
            className="group relative flex min-h-11 items-center gap-1.5 text-sm leading-none font-semibold"
          >
            <span className="slug text-[0.625rem] text-ink-soft" aria-hidden>
              {String(item.n).padStart(2, "0")}
            </span>
            <span className="underline decoration-transparent decoration-3 underline-offset-[0.45em] transition-[text-decoration-color] duration-(--duration-ui) group-aria-[current=page]:decoration-pink fine:group-hover:decoration-pink">
              {item.label}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
