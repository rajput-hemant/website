"use client";

import * as React from "react";

import { gsap, motionOn, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";

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

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !motionOn()) return;
      if (el.getBoundingClientRect().top < window.innerHeight) return;

      const targets: gsap.TweenTarget = stagger ? Array.from(el.children) : el;
      gsap.set(targets, { opacity: 0, y: 14 });

      const trigger = ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(targets, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "enter",
            delay,
            stagger,
          });
        },
      });
      return () => trigger.kill();
    },
    { scope: ref }
  );

  return React.createElement(Tag, { ref, className, ...props }, children);
}
