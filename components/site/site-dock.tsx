"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, FlaskConical, FolderOpen, User } from "lucide-react";

import { nav } from "@/content/site";
import { cn } from "@/lib/utils";
import { CommandTrigger } from "@/components/command";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "/projects": FolderOpen,
  "/work": Briefcase,
  "/lab": FlaskConical,
  "/about": User,
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Mobile-only (<768px) bottom bar: the same four nav items as the header, plus ⌘K/search. */
export function SiteDock() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      style={{ viewTransitionName: "site-dock" }}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-ink/92 backdrop-blur-md md:hidden"
    >
      <ul className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {nav.map((item) => {
          const Icon = ICONS[item.href] ?? FolderOpen;
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-1 py-2 text-graphite transition-colors duration-(--duration-ui)",
                  active && "text-accent"
                )}
              >
                <Icon aria-hidden className="size-5" />
                <span className="font-mono text-[0.6rem] tracking-[0.08em] uppercase">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
        <li className="flex min-h-11 items-center justify-center">
          <CommandTrigger variant="dock" />
        </li>
      </ul>
    </nav>
  );
}
