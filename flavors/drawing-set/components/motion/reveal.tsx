"use client";

import * as React from "react";

import { useReveal } from "@/components/semantic/motion/use-reveal";

type RevealOwnProps = {
  delay?: number;
  /** Stagger over direct children instead of animating the wrapper as one block. */
  stagger?: number;
  className?: string;
  children: React.ReactNode;
};

export type RevealProps<T extends React.ElementType = "div"> =
  RevealOwnProps & {
    as?: T;
  } & Omit<React.ComponentPropsWithoutRef<T>, keyof RevealOwnProps | "as">;

/** Fades and rises content in on scroll, once, when it starts below the fold. No-op otherwise. */
export function Reveal<T extends React.ElementType = "div">({
  as,
  delay = 0,
  stagger,
  className,
  children,
  ...props
}: RevealProps<T>) {
  const Tag = (as ?? "div") as React.ElementType;
  const ref = useReveal<HTMLElement>({ delay, stagger });
  return React.createElement(Tag, { ref, className, ...props }, children);
}
