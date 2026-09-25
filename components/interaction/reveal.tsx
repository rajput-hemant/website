"use client";

import {
  motion,
  useReducedMotionConfig,
  type HTMLMotionProps,
  type Variants,
} from "motion/react";

import { cn } from "@/lib/utils";

import styles from "./reveal.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;
const DURATION = 0.35;
const OFFSET_Y = 8;
const STAGGER = 0.04;
/** Items past this index share its delay: a longer cascade would hold back reading. */
const MAX_STAGGERED = 6;

/** Fire a little before the element crosses into view so text is settled when it is read. */
const VIEWPORT = { once: true, margin: "0px 0px 48px 0px" } as const;

const itemVariants: Variants = {
  hidden: { opacity: 0, y: OFFSET_Y },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION, ease: EASE } },
};

const instantItemVariants: Variants = {
  hidden: { opacity: 0, y: OFFSET_Y },
  visible: { opacity: 1, y: 0, transition: { duration: 0 } },
};

const groupVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: (index: number) =>
        Math.min(index, MAX_STAGGERED - 1) * STAGGER,
    },
  },
};

const instantGroupVariants: Variants = { hidden: {}, visible: {} };

type RevealTag =
  | "div"
  | "section"
  | "article"
  | "aside"
  | "header"
  | "footer"
  | "figure"
  | "ul"
  | "ol"
  | "li"
  | "p";

// Every tag shares the same prop surface; typing them as `motion.div` avoids a union of components.
const motionTags = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  aside: motion.aside,
  header: motion.header,
  footer: motion.footer,
  figure: motion.figure,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
  p: motion.p,
} as Record<RevealTag, typeof motion.div>;

type RevealProps = Omit<
  HTMLMotionProps<"div">,
  | "initial"
  | "animate"
  | "exit"
  | "whileInView"
  | "viewport"
  | "variants"
  | "transition"
> & {
  /** Rendered element; defaults to `div`. */
  as?: RevealTag;
};

/**
 * The server always renders the hidden state so hydration matches; with reduced
 * motion it then jumps straight to visible. The CSS module covers visitors for
 * whom it would never animate at all.
 */
function trigger(reduced: boolean) {
  return reduced
    ? ({ initial: "hidden", animate: "visible" } as const)
    : ({
        initial: "hidden",
        whileInView: "visible",
        viewport: VIEWPORT,
      } as const);
}

function useReduced() {
  return useReducedMotionConfig() ?? false;
}

/** Fades a block up 8px the first time it scrolls into view. */
export function Reveal({ as = "div", className, ...props }: RevealProps) {
  const Component = motionTags[as];
  const reduced = useReduced();

  return (
    <Component
      {...trigger(reduced)}
      variants={reduced ? instantItemVariants : itemVariants}
      className={cn(styles.reveal, className)}
      {...props}
    />
  );
}

/** Reveals its `RevealItem` children in a short cascade: 40ms apart, capped at six. */
export function RevealGroup({ as = "div", ...props }: RevealProps) {
  const Component = motionTags[as];
  const reduced = useReduced();

  return (
    <Component
      {...trigger(reduced)}
      variants={reduced ? instantGroupVariants : groupVariants}
      {...props}
    />
  );
}

/** One step of a `RevealGroup` cascade. Takes its timing from the group. */
export function RevealItem({ as = "div", className, ...props }: RevealProps) {
  const Component = motionTags[as];
  const reduced = useReduced();

  return (
    <Component
      variants={reduced ? instantItemVariants : itemVariants}
      className={cn(styles.reveal, className)}
      {...props}
    />
  );
}
