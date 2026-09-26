"use client";

import * as React from "react";

import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";
import { usePrefs } from "@/lib/prefs-store";
import { strokeTimeline } from "@/lib/signature/timing";
import { cn } from "@/lib/utils";

import { SIGNATURE_VIEWBOX, signatureStrokes } from "./signature-paths";
import styles from "./signature.module.css";

/** Just past the dash, so a round cap can't leave a dot where a stroke will begin. */
const HIDDEN_OFFSET = 1.01;
const PEN_EASING = "cubic-bezier(0.37, 0, 0.63, 1)";
/** How long the pointer must rest on the signature before it writes itself again. */
const HOVER_INTENT_MS = 250;
/** Hover replays wait this long after the last play; a click only waits for it to finish. */
const HOVER_COOLDOWN_MS = 4000;
const IN_VIEW_THRESHOLD = 0.6;

const { width: VIEWBOX_WIDTH, height: VIEWBOX_HEIGHT } = SIGNATURE_VIEWBOX;

/**
 * The `intro` play: a quick CSS pass that starts with the first paint and
 * lands with the home headline's rise, well inside the first second.
 */
const INTRO_START_MS = 140;
const INTRO_TOTAL_MS = 760;
const introTimeline = strokeTimeline(signatureStrokes, {
  start: INTRO_START_MS,
  total: INTRO_TOTAL_MS,
});

export type SignatureProps = {
  className?: string;
  /** Rendered width in px. Omit to size it with `className` (10rem by default). */
  size?: number;
  /**
   * `in-view` writes the signature once when it scrolls into view; `hover`
   * shows it drawn and only writes it again on hover or click; `intro`
   * writes it quickly in CSS on the first load only (no JavaScript needed),
   * then behaves like `hover`.
   */
  play?: "in-view" | "hover" | "intro";
  /** Hide from assistive tech where the name is already on screen. */
  decorative?: boolean;
};

/**
 * Hemant's handwritten signature, drawn stroke by stroke as if by pen. It
 * replays on click, or on a deliberate hover once a few seconds have passed.
 */
export function Signature({
  className,
  size,
  play = "in-view",
  decorative = false,
}: SignatureProps) {
  const { motion } = usePrefs();
  const reducedMotion = usePrefersReducedMotion();
  const canAnimate = motion && !reducedMotion;

  const svgRef = React.useRef<SVGSVGElement>(null);
  const animationsRef = React.useRef<Animation[]>([]);
  const playingRef = React.useRef(false);
  const lastPlayEndRef = React.useRef(Number.NEGATIVE_INFINITY);
  const hoverTimerRef = React.useRef<number | undefined>(undefined);

  const markDrawn = React.useCallback(() => {
    if (svgRef.current) svgRef.current.dataset.state = "drawn";
  }, []);

  const write = React.useCallback(() => {
    const svg = svgRef.current;
    if (!svg || playingRef.current) return;

    const paths = svg.querySelectorAll<SVGPathElement>("[data-stroke]");
    let delay = 0;
    const animations = signatureStrokes.flatMap((stroke, index) => {
      delay += stroke.pause;
      const animation = paths[index]?.animate(
        [{ strokeDashoffset: HIDDEN_OFFSET }, { strokeDashoffset: 0 }],
        {
          duration: stroke.duration,
          delay,
          easing: PEN_EASING,
          fill: "backwards",
        }
      );
      delay += stroke.duration;
      return animation ? [animation] : [];
    });

    // The animations hold every stroke hidden until its turn, so the static hiding can go.
    markDrawn();
    animationsRef.current = animations;
    playingRef.current = true;
    Promise.all(animations.map((animation) => animation.finished))
      .catch(() => undefined)
      .finally(() => {
        playingRef.current = false;
        lastPlayEndRef.current = performance.now();
      });
  }, [markDrawn]);

  React.useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    if (!canAnimate) {
      for (const animation of animationsRef.current) animation.cancel();
      markDrawn();
      return;
    }
    if (play !== "in-view" || svg.dataset.state === "drawn") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        write();
      },
      { threshold: IN_VIEW_THRESHOLD }
    );
    observer.observe(svg);
    return () => observer.disconnect();
  }, [canAnimate, play, markDrawn, write]);

  React.useEffect(() => {
    const finishForPrint = () => {
      for (const animation of animationsRef.current) animation.finish();
    };
    window.addEventListener("beforeprint", finishForPrint);
    return () => {
      window.removeEventListener("beforeprint", finishForPrint);
      window.clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const cancelHover = () => window.clearTimeout(hoverTimerRef.current);

  const onPointerEnter = () => {
    if (!canAnimate) return;
    cancelHover();
    hoverTimerRef.current = window.setTimeout(() => {
      if (performance.now() - lastPlayEndRef.current >= HOVER_COOLDOWN_MS) {
        write();
      }
    }, HOVER_INTENT_MS);
  };

  const onClick = () => {
    if (!canAnimate) return;
    cancelHover();
    write();
  };

  const style: React.CSSProperties = {
    aspectRatio: `${VIEWBOX_WIDTH} / ${VIEWBOX_HEIGHT}`,
    ...(size === undefined ? null : { width: size }),
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      data-state={play === "in-view" ? "pending" : "drawn"}
      className={cn(
        styles.signature,
        play === "intro" && styles.intro,
        className
      )}
      style={style}
      onPointerEnter={onPointerEnter}
      onPointerLeave={cancelHover}
      onClick={onClick}
      {...(decorative
        ? { "aria-hidden": true, focusable: false }
        : { role: "img", "aria-label": "Hemant Rajput's signature" })}
    >
      {signatureStrokes.map((stroke, index) => (
        <path
          key={stroke.d}
          style={
            play === "intro"
              ? ({
                  "--stroke-delay": `${introTimeline[index]?.delay ?? 0}ms`,
                  "--stroke-duration": `${introTimeline[index]?.duration ?? 0}ms`,
                } as React.CSSProperties)
              : undefined
          }
          data-stroke=""
          d={stroke.d}
          pathLength={1}
          vectorEffect="non-scaling-stroke"
          className={styles.stroke}
        />
      ))}
    </svg>
  );
}
