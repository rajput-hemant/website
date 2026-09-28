import * as React from "react";
import { Bezel } from "@/flavors/calibre/components/dial/bezel";
import {
  SceneSlot,
  type SceneRoute,
  type Tag,
} from "@/flavors/calibre/components/site/scene-slot";
import { calibre, roman } from "@/flavors/calibre/lib/movement";
import { cn } from "@/flavors/calibre/lib/utils";

import { getSiteIdentity } from "@/lib/data";

import { Container } from "./container";

export type Meta = { label: string; value: React.ReactNode };

/**
 * The head of every inner page: its hour mark on the dial and what it is in
 * the movement, the title, a lede and the key facts. On the right either the
 * case, holding the movement itself (`scene`) or the page's own subdial
 * (`dial`), with the beating rim index over it either way.
 */
export async function PageHeader({
  hour,
  kicker,
  title,
  lede,
  meta,
  scene,
  board,
  tags,
  prints,
  dial,
  children,
}: {
  /** The page's hour mark, or null for a page off the dial. */
  hour: number | null;
  kicker: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  meta?: Meta[];
  scene?: SceneRoute;
  board?: string;
  /** Each jewel's project name, tagged over the movement. */
  tags?: readonly Tag[];
  /** The figures printed round the bezel; without them there is no case. */
  prints?: readonly [string, string, string, string];
  /** A flat subdial in the case's window, in place of the movement. */
  dial?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const site = await getSiteIdentity();
  const face =
    scene && board ? (
      <SceneSlot route={scene} board={board} tags={tags ?? []} />
    ) : (
      dial
    );
  const side =
    face && prints ? (
      <Bezel prints={prints} className="mx-auto max-w-[28rem]">
        {face}
      </Bezel>
    ) : null;
  return (
    <Container
      className={cn(
        "grid gap-x-12 gap-y-10 pt-[clamp(2rem,1rem+3vw,3.5rem)]",
        side && "lg:grid-cols-12 lg:items-center"
      )}
    >
      <div className={cn("min-w-0", side && "lg:col-span-7")}>
        <p className="spec">
          Calibre {calibre(site.initials)}
          {hour !== null ? (
            <>
              {" "}
              <span aria-hidden>·</span>{" "}
              <span className="numeral-italic text-[1.0625rem] normal-case">
                {roman(hour)}
              </span>
            </>
          ) : null}{" "}
          <span aria-hidden>·</span> {kicker}
        </p>
        <h1 className="mt-5 -ml-[0.04em] text-display [overflow-wrap:anywhere]">
          {title}
        </h1>
        {lede ? (
          <div className="mt-7 max-w-[36ch] text-[clamp(1.25rem,1rem+0.7vw,1.5rem)] leading-[1.3] font-medium">
            {lede}
          </div>
        ) : null}
        {meta && meta.length > 0 ? (
          <dl className="mt-9 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-4 sm:grid-cols-3">
            {meta.map((item) => (
              <div key={item.label}>
                <dt className="spec">{item.label}</dt>
                <dd className="mt-1 font-medium">{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {children}
      </div>
      {side ? <div className="min-w-0 lg:col-span-5">{side}</div> : null}
    </Container>
  );
}
