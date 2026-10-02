"use client";

import * as React from "react";
import type { LampTone } from "@/flavors/surface/components/scene/instruments/lamp";
import { cn } from "@/flavors/surface/lib/utils";

import { useInstrument } from "./use-instrument";

export type { LampTone };

/** Normalise the mouse's position over `el` to -1..1 on each axis. */
export function leanOf(event: React.PointerEvent<HTMLElement>) {
  const box = event.currentTarget.getBoundingClientRect();
  const k = (v: number) => Math.max(-1, Math.min(1, v));
  return {
    x: k(((event.clientX - box.left) / box.width) * 2 - 1),
    y: k(((event.clientY - box.top) / box.height) * 2 - 1),
  };
}

/**
 * A jewel pilot lamp: the printed jewel, replaced by the 3D one once the
 * browser is idle. `pulse` breathes (work in progress, awaiting a reply);
 * the mouse rolls the lens. Decorative: the text beside it says the same.
 * Lamps sharing a `name` are one lamp that keeps its state across pages.
 */
export function JewelLamp({
  name,
  tone,
  pulse = false,
  onClick,
  className,
}: {
  name: string;
  tone: LampTone;
  pulse?: boolean;
  /** A pointer shortcut for a control that is also on the page (the lamp stays aria-hidden). */
  onClick?: () => void;
  className?: string;
}) {
  const { rootRef, hostRef, handle } = useInstrument((host, options) =>
    import("@/flavors/surface/components/scene/instruments/lamp").then((m) =>
      m.attachLamp(host, options, name, tone)
    )
  );

  React.useEffect(() => {
    handle.current?.set(tone);
  }, [handle, tone]);

  return (
    <span
      ref={rootRef}
      aria-hidden
      onClick={onClick}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") return;
        const { x, y } = leanOf(event);
        handle.current?.lean(x, y);
      }}
      onPointerLeave={() => handle.current?.lean(0, 0)}
      className={cn(
        "relative inline-block size-3.5 shrink-0",
        onClick && "cursor-pointer",
        className
      )}
    >
      <span
        data-bench-poster
        data-tone={tone}
        data-pulse={pulse ? "" : undefined}
        className="jewel"
      />
      <span
        ref={hostRef}
        data-bench-host
        className="pointer-events-none absolute inset-0"
      />
      <span data-pulse={pulse ? "" : undefined} className="jewel-halo" />
    </span>
  );
}
