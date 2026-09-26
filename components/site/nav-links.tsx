"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { nav } from "@/content/site";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The primary nav, active state via `usePathname`; used inline in the header and as the dock's labels. */
export function NavLinks({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <ul className={cn("flex items-center gap-1", className)}>
      {nav.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="relative flex h-10 items-center rounded-sm px-3 text-sm text-graphite transition-colors duration-(--duration-ui) after:absolute after:inset-x-3 after:bottom-2 after:h-px after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-(--duration-ui) after:ease-enter aria-[current=page]:text-paper aria-[current=page]:after:scale-x-100 fine:hover:text-paper"
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
