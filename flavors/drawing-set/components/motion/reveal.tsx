"use client";

import * as React from "react";
import {
  belowFold,
  motionOn,
  mountedByNavigation,
  observeOnce,
} from "@/flavors/drawing-set/components/ui/entrance";

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
  const ref = React.useRef<HTMLElement>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    mountedByNavigation();
    if (!el || !motionOn() || !belowFold(el)) return;

    const targets = (stagger ? Array.from(el.children) : [el]) as HTMLElement[];
    for (const target of targets) {
      target.style.opacity = "0";
      target.style.translate = "0 14px";
    }

    const clear = () => {
      for (const target of targets) {
        target.style.removeProperty("opacity");
        target.style.removeProperty("translate");
        target.style.removeProperty("transition");
      }
    };

    let timer = 0;
    const stop = observeOnce(el, () => {
      targets.forEach((target, i) => {
        const wait = delay + (stagger ?? 0) * i;
        target.style.transition = `opacity 600ms var(--ease-enter) ${wait}s, translate 600ms var(--ease-enter) ${wait}s`;
        target.style.opacity = "1";
        target.style.translate = "0 0";
      });
      const total = delay + (stagger ?? 0) * (targets.length - 1) + 0.6;
      timer = window.setTimeout(clear, total * 1000 + 50);
    });

    return () => {
      stop();
      window.clearTimeout(timer);
      clear();
    };
  }, [delay, stagger]);

  return React.createElement(Tag, { ref, className, ...props }, children);
}
