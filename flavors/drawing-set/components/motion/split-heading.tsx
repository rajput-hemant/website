"use client";

import * as React from "react";

import { useSplitReveal } from "@/components/semantic/motion/use-split-reveal";

export type SplitHeadingProps = {
  as?: "h1" | "h2" | "h3";
  id?: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * A line reveal on client navigation or scroll-in, never on first paint.
 * gsap and SplitText load only when a split is about to run.
 */
export function SplitHeading({
  as: Tag = "h1",
  id,
  className,
  children,
}: SplitHeadingProps) {
  const ref = useSplitReveal<HTMLHeadingElement>();

  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}
