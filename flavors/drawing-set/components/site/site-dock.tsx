"use client";

import Link from "next/link";
import { nav } from "@/flavors/drawing-set/content";

import { usePublicPathname } from "@/lib/public-pathname";

import { isActive } from "./nav-links";

/** Mobile-only (<768px) sheet index along the bottom of the frame: sheet number over label. */
export function SiteDock() {
  const pathname = usePublicPathname();

  return (
    <nav
      aria-label="Primary"
      data-print="hide"
      style={{ viewTransitionName: "site-dock" }}
      className="fixed inset-x-(--frame-inset) bottom-(--frame-inset) z-20 border-t border-line bg-ground md:hidden"
    >
      <ul className="grid grid-cols-4 pb-[env(safe-area-inset-bottom)]">
        {nav.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className="group relative flex min-h-14 flex-col items-center justify-center gap-1 text-ink-soft transition-colors duration-200 before:absolute before:inset-x-4 before:top-0 before:h-[1.5px] before:origin-left before:scale-x-0 before:bg-accent aria-[current=page]:text-ink aria-[current=page]:before:scale-x-100 motion:before:transition-transform motion:before:duration-200 motion:before:ease-glide"
            >
              <span className="font-mono text-[0.625rem] leading-none font-medium tracking-[0.06em] group-aria-[current=page]:text-accent">
                {item.sheet}
              </span>
              <span className="font-display text-xs leading-none font-semibold tracking-[0.09em] uppercase [font-stretch:72%]">
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
