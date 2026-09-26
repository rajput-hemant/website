"use client";

import * as React from "react";
import Link from "next/link";

import { drawers } from "@/lib/scene/poses";
import {
  clearHovered,
  setFocused,
  setHovered,
  useSceneStore,
} from "@/lib/scene/store";

/**
 * The drawers as real links, one tab stop with arrow keys between them.
 * Hover and focus go to the store, so the mesh and leader follow; it is the
 * whole navigation when WebGL is off.
 */
export function SceneNav({
  meta,
}: {
  /** Per-drawer meta line keyed by href, e.g. "9 sheets". */
  meta?: Partial<Record<string, string>>;
}) {
  const on = useSceneStore((s) => s.hovered ?? s.focused);
  const [current, setCurrent] = React.useState(0);
  const refs = React.useRef<(HTMLAnchorElement | null)[]>([]);

  const move = (i: number) => {
    const next = (i + drawers.length) % drawers.length;
    setCurrent(next);
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const keys: Record<string, number> = {
      ArrowDown: i + 1,
      ArrowRight: i + 1,
      ArrowUp: i - 1,
      ArrowLeft: i - 1,
      Home: 0,
      End: drawers.length - 1,
    };
    const to = keys[e.key];
    if (to === undefined) return;
    e.preventDefault();
    move(to);
  };

  return (
    <nav
      aria-label="Drawers"
      className="absolute inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto md:w-[180px]"
    >
      <ol className="flex gap-5 overflow-x-auto px-4 pb-3 md:h-full md:flex-col md:justify-center md:gap-2 md:overflow-visible md:p-0">
        {drawers.map((d, i) => (
          <li key={d.id} className="shrink-0">
            <Link
              href={d.href}
              ref={(el) => {
                refs.current[i] = el;
              }}
              tabIndex={i === current ? 0 : -1}
              data-scene-callout={d.id}
              data-on={on === d.id ? "" : undefined}
              onFocus={() => {
                setCurrent(i);
                setFocused(d.id);
              }}
              onBlur={() => setFocused(null)}
              onPointerEnter={() => setHovered(d.id)}
              onPointerLeave={() => clearHovered(d.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className="group grid grid-cols-[26px_1fr] items-center gap-x-3 py-1.5 md:grid-rows-[auto_auto]"
            >
              <span
                aria-hidden
                className="row-span-2 grid size-[26px] place-items-center rounded-full border border-ink-soft font-mono text-mono-xs font-semibold transition-colors duration-200 group-focus-visible:border-accent group-focus-visible:text-accent group-data-[on]:border-accent group-data-[on]:text-accent fine:group-hover:border-accent fine:group-hover:text-accent"
              >
                {d.letter}
              </span>
              <span className="font-display text-[13px] leading-none font-semibold tracking-[0.09em] uppercase [font-stretch:72%] transition-colors duration-200 group-data-[on]:text-accent fine:group-hover:text-accent">
                {d.label}
              </span>
              <span className="hidden font-mono text-[9.5px] leading-[1.4] tracking-[0.08em] text-ink-faint uppercase tabular-nums md:block">
                {meta?.[d.href] ?? `Sheet ${d.sheet}`}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
