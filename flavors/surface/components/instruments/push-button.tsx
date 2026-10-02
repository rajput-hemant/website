"use client";

import * as React from "react";
import { cn } from "@/flavors/surface/lib/utils";

import { useInstrument } from "./use-instrument";

/**
 * The face of a momentary arcade push button, for a real `<button>` to wear:
 * it sinks while `pressed` and springs back, and its lamp ring lights while
 * `lit` and flashes on `flash`. The printed lamp is its poster.
 */
export function ArcadeFace({
  name,
  pressed,
  lit,
  flash,
  className,
}: {
  name: string;
  pressed: boolean;
  lit: boolean;
  flash: boolean;
  className?: string;
}) {
  const level = flash ? 2 : lit ? 1 : 0;
  const { rootRef, hostRef, handle } = useInstrument((host, options) =>
    import("@/flavors/surface/components/scene/instruments/pushbutton").then(
      (m) => {
        const button = m.attachPushButton(host, options, name);
        button.light(level);
        return button;
      }
    )
  );

  React.useEffect(() => {
    handle.current?.press(pressed);
  }, [handle, pressed]);
  React.useEffect(() => {
    handle.current?.light(level);
  }, [handle, level]);

  return (
    <span
      ref={rootRef}
      aria-hidden
      className={cn("relative -ml-1.5 inline-block size-7 shrink-0", className)}
    >
      <span
        data-bench-poster
        className="absolute inset-[9px] flex items-center justify-center"
      >
        <span data-on={lit || flash ? "" : undefined} className="led" />
      </span>
      <span
        ref={hostRef}
        data-bench-host
        className="pointer-events-none absolute inset-0"
      />
    </span>
  );
}
