"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { nav } from "@/content/site";
import { cn } from "@/lib/utils";

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The primary nav as an inline bar (desktop header). */
export function NavLinks({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <ul className={cn("flex items-center", className)}>
      {nav.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="relative flex h-10 items-center rounded-sm px-2.5 text-sm text-muted transition-colors duration-150 after:absolute after:inset-x-2.5 after:bottom-2 after:h-px after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 after:ease-snappy hover:text-foreground aria-[current=page]:text-foreground aria-[current=page]:after:scale-x-100"
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
