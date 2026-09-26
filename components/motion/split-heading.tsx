"use client";

import * as React from "react";

import {
  gsap,
  motionOn,
  ScrollTrigger,
  SplitText,
  useGSAP,
} from "@/lib/motion/gsap";

/**
 * Set once, by whichever SplitHeading mounts first. A later instance mounting
 * long after that (a client-side navigation) gets its line reveal even when
 * already in view; one mounting near hydration is the initial document load.
 */
let hydratedAt = 0;

export type SplitHeadingProps = {
  as?: "h1" | "h2" | "h3";
  className?: string;
  children: React.ReactNode;
};

export function SplitHeading({
  as: Tag = "h1",
  className,
  children,
}: SplitHeadingProps) {
  const ref = React.useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      const mountedAt = performance.now();
      if (hydratedAt === 0) hydratedAt = mountedAt;
      if (!el || !motionOn()) return;

      const isClientNav = mountedAt - hydratedAt > 800;

      const reveal = () =>
        SplitText.create(el, {
          type: "lines,words",
          mask: "lines",
          autoSplit: true,
          aria: "auto",
          onSplit(self) {
            gsap.set(self.words, { yPercent: 100 });
            return gsap.to(self.words, {
              yPercent: 0,
              duration: 0.8,
              ease: "glide",
              stagger: 0.04,
            });
          },
        });

      if (isClientNav) {
        const split = reveal();
        return () => split.revert();
      }

      const belowFold = el.getBoundingClientRect().top > window.innerHeight;
      if (!belowFold) return;

      let split: SplitText | undefined;
      const trigger = ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
          split = reveal();
        },
      });
      return () => {
        trigger.kill();
        split?.revert();
      };
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
