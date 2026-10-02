import * as React from "react";
import { SceneSlot } from "@/flavors/survey/components/scene/scene-slot";
import type { Relief } from "@/flavors/survey/lib/relief";
import {
  withProps,
  type Notebook,
  type SceneRoute,
} from "@/flavors/survey/lib/scene/poses";
import { sheetNumber } from "@/flavors/survey/lib/sheet";
import { cn } from "@/flavors/survey/lib/utils";

import { Container } from "./container";
import { MetaList, type MetaListItem } from "./meta-list";
import { SplitHeading } from "./split-heading";

export type PageHeaderProps = {
  /** What this page is on the sheet, e.g. "Gazetteer". */
  kicker: string;
  title: string;
  lede?: React.ReactNode;
  meta?: MetaListItem[];
  /**
   * The inset's grid square; `null` leaves the header without one. The
   * notebook's size (and an entry's number) builds the cairn on ask pages.
   */
  scene: {
    relief: Relief;
    route: SceneRoute;
    target?: string;
    notebook?: Notebook;
  } | null;
  /** A mark set beside the title, such as an entry's benchmark. */
  mark?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

/**
 * A page's title band, like the sheet's own: the sheet line, the name in
 * spaced capitals, an italic note, marginalia, and an inset of this page's
 * grid square on the right.
 */
export function PageHeader({
  kicker,
  title,
  lede,
  meta,
  scene,
  mark,
  className,
  children,
}: PageHeaderProps) {
  const heading = (
    <SplitHeading
      as="h1"
      className="spaced mt-5 text-title tracking-[0.16em] sm:tracking-[0.22em]"
    >
      {title}
    </SplitHeading>
  );
  return (
    <header className={cn("pt-[clamp(2rem,1rem+3vw,4rem)]", className)}>
      <Container className="grid gap-x-12 gap-y-10 lg:grid-cols-12 lg:items-end">
        <div
          className={cn("min-w-0", scene ? "lg:col-span-7" : "lg:col-span-9")}
        >
          <p className="caps text-ink-faint">
            {sheetNumber()} · <span className="text-ink-soft">{kicker}</span>
          </p>
          {mark ? (
            <div className="flex items-end justify-between gap-6">
              <div className="min-w-0">{heading}</div>
              {mark}
            </div>
          ) : (
            heading
          )}
          {lede ? (
            <div className="mt-6 max-w-[44ch] font-serif text-statement text-ink-soft italic">
              {lede}
            </div>
          ) : null}
          {meta?.length ? <MetaList items={meta} className="mt-8" /> : null}
          {children}
        </div>
        {scene ? (
          <SceneSlot
            relief={withProps(
              scene.relief,
              scene.route,
              scene.target,
              scene.notebook
            )}
            route={scene.route}
            target={scene.target}
            className="mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none"
          />
        ) : null}
      </Container>
      <Container>
        <div
          aria-hidden
          className="mt-10 border-b-[1.5px] border-rule-strong"
        />
      </Container>
    </header>
  );
}
