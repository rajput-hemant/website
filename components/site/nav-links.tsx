"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { nav } from "@/content/site";
import { cn } from "@/lib/utils";

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The sheet index in the header: sheet number in mono, then the label. The
 * current sheet is ink with a redline number and tick; hovering draws the tick.
 */
export function NavLinks({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <ul className={cn("flex items-center gap-7 lg:gap-9", className)}>
      {nav.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            data-magnetic
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
            className="group relative flex h-15 items-center gap-2 font-display text-[0.8125rem] leading-none font-semibold tracking-[0.09em] text-ink-soft uppercase [font-stretch:72%] transition-colors duration-200 after:absolute after:inset-x-0 after:-bottom-px after:h-[1.5px] after:origin-left after:scale-x-0 after:bg-accent aria-[current=page]:text-ink aria-[current=page]:after:scale-x-100 motion:after:transition-transform motion:after:duration-200 motion:after:ease-glide fine:hover:text-ink fine:hover:after:scale-x-100"
          >
            <span className="font-mono text-[0.625rem] font-medium tracking-[0.06em] group-aria-[current=page]:text-accent">
              {item.sheet}
            </span>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
