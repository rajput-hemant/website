import Link from "next/link";
import { selector } from "@/flavors/surface/content";
import { detentAngle } from "@/flavors/surface/lib/knob/geometry";
import { cn } from "@/flavors/surface/lib/utils";

import { Knob } from "./knob";

/* The knob takes 58% of the selector's width; legends sit on a ring outside it. */
const KNOB = 0.58;
const ASPECT = 0.8;
const RING = (215 / 400) * KNOB;

/**
 * The home hero's channel selector: five detents for Home and the four
 * primary channels, each with a real link engraved beside it. Hovering a
 * legend or a header key turns the knob to it.
 */
export function ChannelSelector({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Channel select"
      className={cn("relative w-full", className)}
      style={{ aspectRatio: `1 / ${ASPECT}` }}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          width: `${KNOB * 100}%`,
          top: `${50 - (KNOB / ASPECT) * 50}%`,
        }}
      >
        <Knob
          items={selector.map((item) => ({
            label: `${item.ch} ${item.label}`,
            href: item.href,
          }))}
          label="Channel selector"
          mode="channel"
          lamps
        />
      </div>

      <ul>
        {selector.map((item, i) => {
          const a = (detentAngle(selector.length, i) * Math.PI) / 180;
          const x = 50 + Math.sin(a) * RING * 100;
          const y = 50 - (Math.cos(a) * RING * 100) / ASPECT;
          const side =
            Math.abs(Math.sin(a)) < 0.01
              ? "top"
              : Math.sin(a) < 0
                ? "left"
                : "right";
          return (
            <li
              key={item.href}
              className="absolute"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <Link
                href={item.href}
                data-channel={i}
                aria-current={i === 0 ? "page" : undefined}
                className={cn(
                  "absolute flex min-h-11 items-center gap-2 px-1 font-display text-[clamp(0.8125rem,0.6rem+0.6vw,0.9375rem)] leading-none tracking-[0.12em] whitespace-nowrap uppercase underline-offset-4 focus-visible:underline fine:hover:underline",
                  side === "left" && "right-2 -translate-y-1/2",
                  side === "right" && "left-2 -translate-y-1/2",
                  side === "top" && "bottom-1 -translate-x-1/2"
                )}
              >
                <span
                  aria-hidden
                  className="font-medium text-ink-2 max-sm:hidden"
                >
                  {item.ch}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 grid justify-items-center gap-1.5 text-center"
      >
        <span className="legend tracking-[0.22em]">Channel select</span>
        <span className="legend text-[0.625rem] tracking-[0.14em] max-sm:hidden">
          Turn to select, push to open, or press 0 to 4
        </span>
      </div>
    </nav>
  );
}
