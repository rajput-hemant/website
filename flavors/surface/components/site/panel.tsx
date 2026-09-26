import * as React from "react";
import { Knob, type KnobItem } from "@/flavors/surface/components/knob/knob";
import { KnobReadout } from "@/flavors/surface/components/knob/knob-readout";
import {
  Legend,
  LegendRow,
  Screws,
} from "@/flavors/surface/components/ui/primitives";
import { cn } from "@/flavors/surface/lib/utils";

import { Page } from "./page";

export type PanelProps = {
  /** The channel number, e.g. "01". */
  ch: string;
  /** The channel name, for the legend row. */
  name: string;
  /** Right-hand legend: a true fact about the page. */
  aside?: React.ReactNode;
  title: React.ReactNode;
  lede?: React.ReactNode;
  /** Readouts or modules under the lede. */
  meta?: React.ReactNode;
  /** The page's knob: its detents are this page's items. */
  knob?: {
    items: readonly KnobItem[];
    unit: string;
    label: string;
    initial?: number;
  };
  children: React.ReactNode;
  className?: string;
};

/**
 * An inner page's faceplate. The header carries the channel legend, the title
 * and the lede; the right rail holds the page's knob, whose detents are the
 * page's own items (presets, tracks, sections). It sticks while you scroll
 * on wide screens, so turning the knob and scrolling the page stay linked.
 */
export function Panel({
  ch,
  name,
  aside,
  title,
  lede,
  meta,
  knob,
  children,
  className,
}: PanelProps) {
  return (
    <Page className={cn("px-4 md:px-6 lg:px-12", className)}>
      <div className="grid gap-x-12 lg:grid-cols-12">
        <header className="relative pt-8 pb-10 md:pt-12 lg:col-span-8 lg:col-start-1 lg:row-start-1 lg:pb-14">
          <div className="seam-b flex flex-wrap justify-between gap-x-4 gap-y-1.5 pb-3.5">
            <Legend>
              <LegendRow parts={[`Channel ${ch}`, name]} />
            </Legend>
            {aside && <Legend>{aside}</Legend>}
          </div>
          <h1 className="mt-8 -ml-[0.04em] text-display tracking-[-0.022em] md:mt-12">
            {title}
          </h1>
          {lede && (
            <div className="mt-6 max-w-[44ch] text-lead font-medium tracking-[-0.006em] text-ink md:mt-8">
              {lede}
            </div>
          )}
          {meta && <div className="mt-8">{meta}</div>}
        </header>

        {knob && (
          <aside
            aria-label={`${name} control`}
            data-print="hide"
            className="lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1 lg:pt-12"
          >
            <div className="mod relative grid grid-cols-[minmax(0,9rem)_1fr] items-center gap-4 p-4 sm:grid-cols-[minmax(0,12rem)_1fr] lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:grid-cols-1 lg:gap-6 lg:p-8">
              <Screws className="max-lg:hidden" />
              <Knob
                items={knob.items}
                initial={knob.initial}
                label={knob.label}
                mode="item"
                className="w-full lg:mx-auto lg:max-w-[16rem]"
              />
              <div className="grid gap-3">
                <KnobReadout
                  items={knob.items}
                  unit={knob.unit}
                  initial={knob.initial}
                />
                <Legend className="text-[0.625rem] tracking-[0.14em] max-sm:hidden">
                  Turn to select, push to open
                </Legend>
              </div>
            </div>
          </aside>
        )}

        <div
          className={cn(
            "min-w-0",
            knob
              ? "mt-10 lg:col-span-8 lg:col-start-1 lg:row-start-2 lg:mt-0"
              : "lg:col-span-12"
          )}
        >
          {children}
        </div>
      </div>
    </Page>
  );
}
