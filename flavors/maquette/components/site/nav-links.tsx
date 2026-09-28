"use client";

import Link from "next/link";
import { nav } from "@/flavors/maquette/content";
import { cn } from "@/flavors/maquette/lib/utils";

import { usePublicPathname } from "@/lib/public-pathname";

export const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

/** The four rooms. The current one is set in ink over a basswood rule. */
export function NavLinks({ className }: { className?: string }) {
  const pathname = usePublicPathname();
  return (
    <ul className={cn("flex items-center gap-8", className)}>
      {nav.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
            className="flex min-h-11 items-center font-display text-[0.9375rem] leading-none tracking-[0.02em] text-soft underline decoration-transparent decoration-2 underline-offset-[0.6em] transition-[color,text-decoration-color] duration-(--duration-ui) aria-[current=page]:text-ink aria-[current=page]:decoration-wood fine:hover:text-ink"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
