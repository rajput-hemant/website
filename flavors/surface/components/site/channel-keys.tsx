"use client";

import Link from "next/link";
import { channelFor, nav } from "@/flavors/surface/content";
import { cn } from "@/flavors/surface/lib/utils";

import { usePublicPathname } from "@/lib/public-pathname";

/**
 * The header's channel keys, 01 to 04. The current channel's lamp is lit.
 * `data-channel` lets the home selector knob turn to a key on hover.
 */
export function ChannelKeys({ className }: { className?: string }) {
  const current = channelFor(usePublicPathname())?.href;

  return (
    <ul
      className={cn(
        "grid grid-cols-4 gap-1.5 md:flex md:gap-2 lg:gap-2",
        className
      )}
    >
      {nav.map((item, i) => {
        const active = item.href === current;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              data-channel={i + 1}
              aria-current={active ? "page" : undefined}
              className="key w-full max-md:h-auto max-md:flex-col max-md:gap-1.5 max-md:px-0.5 max-md:py-2.5 max-md:text-[0.65625rem] max-md:tracking-[0.07em] md:max-lg:px-2.5 lg:px-3.5"
            >
              <span
                aria-hidden
                data-on={active ? "" : undefined}
                className="led"
              />
              <span className="inline-flex gap-2">
                <span
                  aria-hidden
                  className="font-medium text-ink-2 max-md:hidden"
                >
                  {item.ch}
                </span>
                {item.label}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
