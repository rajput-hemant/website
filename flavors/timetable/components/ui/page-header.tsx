import * as React from "react";
import { SplitHeading } from "@/flavors/timetable/components/motion/split-heading";
import { PlatformPlate } from "@/flavors/timetable/components/site/nav-links";
import {
  SceneSlot,
  type SceneRoute,
} from "@/flavors/timetable/components/site/scene-slot";
import { cn } from "@/flavors/timetable/lib/utils";

import { Container } from "./container";
import { MetaList, type MetaListItem } from "./meta-list";

export type PageHeaderProps = {
  /** The platform number from `platforms` in content.ts. */
  platform: string;
  kicker?: string;
  title: string;
  lede?: React.ReactNode;
  meta?: MetaListItem[];
  /** The indicator's route state; `null` leaves the header without it. */
  scene: SceneRoute | null;
  /** What the indicator reads at rest on this page, `"TOP|BOTTOM|TAG"`. */
  board?: string;
  className?: string;
  children?: React.ReactNode;
};

/**
 * A platform's sign: the platform plate and kicker, the page name, a lede
 * and the key facts, with the indicator hanging on the right.
 */
export function PageHeader({
  platform,
  kicker,
  title,
  lede,
  meta,
  scene,
  board,
  className,
  children,
}: PageHeaderProps) {
  return (
    <header className={cn("pt-[clamp(2.5rem,1rem+4vw,5rem)]", className)}>
      <Container className="grid gap-x-6 gap-y-10 lg:grid-cols-12 lg:items-end">
        <div
          className={cn("min-w-0", scene ? "lg:col-span-7" : "lg:col-span-9")}
        >
          <p className="flex items-center gap-2.5 font-mono text-mono-sm leading-none font-bold tracking-[0.08em] text-ink-soft uppercase">
            <PlatformPlate n={platform} className="text-ink" />
            <span className="pt-0.5">
              Platform {platform}
              {kicker ? <> &nbsp;/&nbsp; {kicker}</> : null}
            </span>
          </p>
          <SplitHeading
            as="h1"
            className="mt-5 -ml-[0.04em] text-display font-extrabold tracking-[-0.035em] break-words"
          >
            {title}
          </SplitHeading>
          {lede ? (
            <div className="mt-6 max-w-[46ch] text-statement font-medium tracking-[-0.012em] text-ink">
              {lede}
            </div>
          ) : null}
          {meta?.length ? <MetaList items={meta} className="mt-8" /> : null}
          {children}
        </div>
        {scene ? (
          <div className="mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
            <SceneSlot route={scene} board={board} size="header" />
          </div>
        ) : null}
      </Container>
    </header>
  );
}
