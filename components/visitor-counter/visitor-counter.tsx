"use client";

import { useEffect, useState, type CSSProperties } from "react";

import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";
import { usePrefs } from "@/lib/prefs-store";
import { cn } from "@/lib/utils";
import {
  digitOffset,
  toCounterGlyphs,
  visitorNumberFormat,
} from "@/lib/visits/digits";

import { useVisitorCount } from "./use-visitor-count";
import styles from "./visitor-counter.module.css";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

const label = (visitors: number) => (visitors === 1 ? "visitor" : "visitors");

/** False on the first frame, so the strips paint at 0 and then roll to the value. */
function useRolledIn(): boolean {
  const [rolled, setRolled] = useState(false);
  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setRolled(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, []);
  return rolled;
}

function RollingNumber({ value }: { value: number }) {
  const rolled = useRolledIn();
  let digitIndex = 0;

  return toCounterGlyphs(value).map((glyph) => {
    if (glyph.kind === "literal")
      return <span key={glyph.key}>{glyph.char}</span>;
    const style = {
      "--digit-index": digitIndex++,
      transform: digitOffset(rolled ? glyph.digit : 0),
    } as CSSProperties;
    return (
      <span key={glyph.key} className={styles.window}>
        <span className={styles.strip} style={style}>
          {DIGITS.map((digit) => (
            <span key={digit}>{digit}</span>
          ))}
        </span>
      </span>
    );
  });
}

export type VisitorCounterProps = { className?: string };

/**
 * "12,408 visitors" in the footer. Counts this visit once per session after
 * the page is idle, so the page itself stays static. Renders nothing when the
 * counter is not configured or the request fails.
 */
export function VisitorCounter({ className }: VisitorCounterProps) {
  const count = useVisitorCount();
  const { motion } = usePrefs();
  const reducedMotion = usePrefersReducedMotion();

  if (count.status === "off") return null;

  const ready = count.status === "ready";
  const visitors = ready ? count.visitors : 0;
  const formatted = visitorNumberFormat.format(visitors);

  return (
    <span
      className={cn(
        // Room for "000,000 visitors" up front, so the line never shifts when it loads.
        "inline-block min-w-[16ch] font-mono text-2xs text-subtle tabular-nums",
        className
      )}
    >
      {ready && (
        <span className="sr-only">
          {formatted} {label(visitors)}
        </span>
      )}
      <span
        aria-hidden
        data-ready={ready ? "" : undefined}
        className={styles.counter}
      >
        {ready && motion && !reducedMotion ? (
          <RollingNumber value={visitors} />
        ) : (
          formatted
        )}
        &nbsp;{label(visitors)}
      </span>
    </span>
  );
}
