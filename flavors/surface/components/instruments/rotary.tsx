"use client";

import * as React from "react";
import {
  knobStore,
  shownIndex,
  useKnob,
} from "@/flavors/surface/lib/knob/store";
import { knobSounds } from "@/flavors/surface/lib/sound/detents";
import { cn } from "@/flavors/surface/lib/utils";

import { useTurn } from "./gesture";
import { useInstrument } from "./use-instrument";

/** Kept in step with `ROTARY_STEP` in the 3D part, which this chunk must not import. */
const STEP = 30;
const angleOf = (position: number, count: number) =>
  (position - (count - 1) / 2) * STEP;

const moving = () => document.documentElement.dataset.motion === "on";

/**
 * The bank switch: a chicken-head rotary with a position per bank, beside
 * the bank list. It points at the bank the knob is in; a click steps to the
 * next bank and a turn picks one, and either selects that bank's first
 * preset on the knob. Pointer only and aria-hidden: the knob and the bank
 * headings are the accessible way there.
 */
export function BankSwitch({
  banks,
  size,
  className,
}: {
  banks: readonly { letter: string; first: number }[];
  /** Presets per bank. */
  size: number;
  className?: string;
}) {
  const count = banks.length;
  const bankOf = (index: number) =>
    Math.min(Math.floor(index / size), count - 1);
  const shown = useKnob((s) => bankOf(shownIndex(s)));
  const { rootRef, hostRef, handle } = useInstrument((host, options) =>
    import("@/flavors/surface/components/scene/instruments/rotary").then((m) =>
      m.attachRotary(
        host,
        options,
        angleOf(bankOf(knobStore.getState().index), count)
      )
    )
  );

  React.useEffect(() => {
    handle.current?.to(angleOf(shown, count));
  }, [count, handle, shown]);

  const select = (bank: number) => {
    const target = banks[bank];
    if (!target || bank === bankOf(knobStore.getState().index)) return;
    knobSounds.detent(bank, count);
    knobStore.setState({ index: target.first, preview: null });
    document
      .querySelector(`[data-knob-item="${target.first}"]`)
      ?.scrollIntoView({
        block: "center",
        behavior: moving() ? "smooth" : "auto",
      });
  };
  const from = React.useRef(0);
  const turn = useTurn({
    onTurn: (degrees) =>
      select(
        Math.min(
          Math.max(Math.round(from.current + degrees / STEP), 0),
          count - 1
        )
      ),
    onEnd: (turned) => {
      if (!turned) select((bankOf(knobStore.getState().index) + 1) % count);
    },
  });

  return (
    <span
      aria-hidden
      className={cn(
        "relative block size-[88px] shrink-0 select-none",
        className
      )}
    >
      {banks.map((bank, i) => {
        const a = (angleOf(i, count) * Math.PI) / 180;
        return (
          <span
            key={bank.letter}
            className={cn(
              "legend absolute -translate-1/2 text-[0.625rem] transition-colors duration-150",
              i === shown ? "text-ink" : "text-ink-3"
            )}
            style={{
              left: `${50 + Math.sin(a) * 42}%`,
              top: `${50 - Math.cos(a) * 42}%`,
            }}
          >
            {bank.letter}
          </span>
        );
      })}
      <span
        ref={rootRef}
        data-cursor="Turn"
        onPointerDown={(event) => {
          from.current = bankOf(knobStore.getState().index);
          turn.onPointerDown(event);
        }}
        onPointerMove={turn.onPointerMove}
        onPointerUp={turn.onPointerUp}
        onPointerCancel={turn.onPointerUp}
        className="absolute inset-[22px] cursor-pointer touch-none rounded-full"
      >
        <svg
          viewBox="-50 -50 100 100"
          data-bench-poster
          className="absolute inset-0 size-full"
        >
          <circle r="36" className="fill-ink" />
          <path
            d="M0 -49 Q6 -31 16 -2 Q21 27 0 31 Q-21 27 -16 -2 Q-6 -31 0 -49Z"
            className="fill-ink"
            style={{
              transform: `rotate(${angleOf(shown, count)}deg)`,
              transition: "transform 300ms var(--ease-detent)",
            }}
          />
          <line
            x1="0"
            y1="-8"
            x2="0"
            y2="-40"
            className="stroke-plate"
            strokeWidth="3"
            style={{
              transform: `rotate(${angleOf(shown, count)}deg)`,
              transition: "transform 300ms var(--ease-detent)",
            }}
          />
        </svg>
        <span
          ref={hostRef}
          data-bench-host
          className="pointer-events-none absolute -inset-1"
        />
      </span>
    </span>
  );
}
