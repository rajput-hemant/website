"use client";

import Link from "next/link";
import { nav } from "@/flavors/timetable/content";
import { cn } from "@/flavors/timetable/lib/utils";

import { usePublicPathname } from "@/lib/public-pathname";

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The platform nav on the sign band: a numbered platform plate, then the
 * label. The current platform's plate is lit signal yellow. Pointing at one
 * riffles the indicator to that platform (`data-scene-item`).
 */
export function NavLinks({ className }: { className?: string }) {
  const pathname = usePublicPathname();
  return (
    <ul className={cn("flex items-center gap-7 xl:gap-9", className)}>
      {nav.map((item) => (
        <li key={item.href} className="min-w-0">
          <Link
            href={item.href}
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
            data-scene-item={`platform:${item.href}`}
            data-scene-label={item.board.join("|")}
            className="group flex min-h-11 items-center gap-2.5 text-[0.9375rem] leading-none font-semibold text-on-sign max-lg:min-h-13 max-lg:flex-col max-lg:justify-center max-lg:gap-1.5 max-lg:text-[0.8125rem]"
          >
            <PlatformPlate
              n={item.platform}
              className="group-aria-[current=page]:border-signal group-aria-[current=page]:bg-signal group-aria-[current=page]:text-signal-ink fine:group-hover:border-signal fine:group-hover:bg-signal fine:group-hover:text-signal-ink"
            />
            <span className="pt-0.5">{item.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** A platform number in a pressed-enamel square. */
export function PlatformPlate({
  n,
  className,
}: {
  n: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-grid size-5.5 flex-none place-items-center rounded-[3px] border-[1.5px] border-current pt-px font-mono text-[0.6875rem] leading-none font-bold transition-colors duration-150",
        className
      )}
    >
      {n}
    </span>
  );
}
