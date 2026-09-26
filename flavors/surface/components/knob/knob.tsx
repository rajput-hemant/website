"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  detentAngle,
  nearestDetent,
  notched,
  pointerAngle,
  sweepOf,
  withEndStops,
  wrapDelta,
} from "@/flavors/surface/lib/knob/geometry";
import {
  knobStore,
  shownIndex,
  useKnob,
} from "@/flavors/surface/lib/knob/store";
import { usePrefs } from "@/flavors/surface/lib/prefs-store";
import { cn } from "@/flavors/surface/lib/utils";

import { detectTier } from "@/lib/scene/tier";
import { playTick } from "@/lib/sound";

export type KnobItem = { label: string; href?: string };

export type KnobProps = {
  items: readonly KnobItem[];
  /** The detent selected on first paint. */
  initial?: number;
  /** Accessible name of the slider. */
  label: string;
  /**
   * `channel`: DOM elements with `data-channel="<n>"` preview a detent on
   * hover or focus (the header keys and selector legends).
   * `item`: page elements with `data-knob-item="<n>"` preview it, turning the
   * knob selects and scrolls to them, and scrolling the page turns the knob.
   * `data-knob-mirror="<n>"` previews and lights up without taking part in
   * scrolling (a second view of the same item).
   */
  mode: "channel" | "item";
  /** Draw a LED beside every detent (the selector); otherwise ticks only. */
  lamps?: boolean;
  className?: string;
};

const DRAG_SLOP = 4;
/** While the knob scrolls the page to an item, the scroll must not turn the knob back. */
const SCROLL_LOCK_MS = 900;
const sound = () => document.documentElement.dataset.sound === "on";
const moving = () => document.documentElement.dataset.motion === "on";

function tickPositions(count: number): { angle: number; major: boolean }[] {
  const sweep = sweepOf(count);
  if (count <= 1) return [{ angle: 0, major: true }];
  const step = sweep / (count - 1);
  const minors = Math.max(1, Math.round(step / 10));
  const ticks: { angle: number; major: boolean }[] = [];
  for (let i = 0; i < count; i++) {
    const base = -sweep / 2 + i * step;
    ticks.push({ angle: base, major: true });
    if (i === count - 1) break;
    for (let m = 1; m < minors; m++) {
      ticks.push({ angle: base + (m * step) / minors, major: false });
    }
  }
  return ticks;
}

/* Rounded, because Node and the browser can disagree on the last digit of Math.sin, which breaks hydration. */
const round = (n: number) => Math.round(n * 1000) / 1000;

const polar = (r: number, angle: number) => {
  const a = (angle * Math.PI) / 180;
  return { x: round(r * Math.sin(a)), y: round(-r * Math.cos(a)) };
};

/**
 * The signature control: a rotary encoder. Turn it (drag, arrow keys, or hover
 * a linked element) to select a detent; push it (click, Enter) to open what
 * the detent points at. The printed knob is server-rendered and always works;
 * the lathe-turned three.js knob replaces it once the browser is idle, and
 * renders only while something moves.
 */
export function Knob({
  items,
  initial = 0,
  label,
  mode,
  lamps = false,
  className,
}: KnobProps) {
  const router = useRouter();
  const id = React.useId();
  const count = items.length;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const hostRef = React.useRef<HTMLDivElement>(null);
  const scene = usePrefs().scene;
  const scrollLockUntil = React.useRef(0);

  const mounted = useKnob((s) => s.owner === id);
  const storeIndex = useKnob((s) => s.index);
  const storeShown = useKnob(shownIndex);
  const drag = useKnob((s) => s.drag);
  const pressed = useKnob((s) => s.pressed);
  // Until this knob has claimed the store, render its own first-paint state.
  const index = mounted ? storeIndex : initial;
  const shown = mounted ? storeShown : initial;
  const angle = drag ?? detentAngle(count, shown);

  React.useLayoutEffect(() => {
    knobStore.setState({
      owner: id,
      count,
      index: Math.min(initial, count - 1),
      preview: null,
      drag: null,
      pressed: false,
    });
  }, [id, count, initial]);

  const select = React.useCallback(
    (next: number, scroll = true) => {
      const clamped = Math.min(Math.max(next, 0), count - 1);
      if (clamped !== knobStore.getState().index && sound()) playTick("button");
      knobStore.setState({ index: clamped, preview: null });
      if (mode === "item" && scroll) {
        scrollLockUntil.current = performance.now() + SCROLL_LOCK_MS;
        document
          .querySelector(`[data-knob-item="${clamped}"]`)
          ?.scrollIntoView({
            block: "center",
            behavior: moving() ? "smooth" : "auto",
          });
      }
    },
    [count, mode]
  );

  const open = React.useCallback(() => {
    const href = items[knobStore.getState().index]?.href;
    if (href) router.push(href);
  }, [items, router]);

  // Hovering or focusing a linked element leans the knob to its detent.
  React.useEffect(() => {
    const attrs =
      mode === "channel"
        ? ["data-channel"]
        : ["data-knob-item", "data-knob-mirror"];
    const detentOf = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null;
      const el = target.closest(attrs.map((a) => `[${a}]`).join(","));
      if (!el) return null;
      const n = Number(
        attrs.map((a) => el.getAttribute(a)).find((v) => v !== null)
      );
      return Number.isInteger(n) && n >= 0 && n < count ? n : null;
    };
    const enter = (event: Event) => {
      if (event instanceof PointerEvent && event.pointerType !== "mouse") {
        return;
      }
      const n = detentOf(event.target);
      if (n !== null && knobStore.getState().drag === null) {
        knobStore.setState({ preview: n });
      }
    };
    const leave = (event: Event) => {
      const from = detentOf(event.target);
      const to = detentOf((event as FocusEvent).relatedTarget);
      if (from !== null && from !== to) knobStore.setState({ preview: null });
    };
    document.addEventListener("pointerover", enter);
    document.addEventListener("pointerout", leave);
    document.addEventListener("focusin", enter);
    document.addEventListener("focusout", leave);
    return () => {
      document.removeEventListener("pointerover", enter);
      document.removeEventListener("pointerout", leave);
      document.removeEventListener("focusin", enter);
      document.removeEventListener("focusout", leave);
      knobStore.setState({ preview: null });
    };
  }, [count, mode]);

  // Item mode: the lit item follows the knob, and the knob follows the scroll.
  React.useEffect(() => {
    if (mode !== "item") return;
    for (const el of document.querySelectorAll(
      "[data-knob-item],[data-knob-mirror]"
    )) {
      const n =
        el.getAttribute("data-knob-item") ??
        el.getAttribute("data-knob-mirror");
      el.toggleAttribute("data-knob-active", n === String(index));
    }
  }, [index, mode]);

  React.useEffect(() => {
    if (mode !== "item") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const state = knobStore.getState();
        if (state.drag !== null || state.preview !== null) return;
        if (performance.now() < scrollLockUntil.current) return;
        const hit = entries.find((entry) => entry.isIntersecting);
        const n = Number(hit?.target.getAttribute("data-knob-item"));
        if (hit && Number.isInteger(n) && n !== state.index) {
          knobStore.setState({ index: Math.min(n, count - 1) });
        }
      },
      { rootMargin: "-48% 0px -48% 0px" }
    );
    for (const el of document.querySelectorAll("[data-knob-item]")) {
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, [count, mode]);

  // The 3D knob: after load and idle, on capable devices only.
  React.useEffect(() => {
    const root = rootRef.current;
    const host = hostRef.current;
    if (!root || !host) return;
    let cancelled = false;
    let detach: (() => void) | null = null;
    const fallback = () => {
      detach?.();
      detach = null;
      delete root.dataset.knobLive;
    };
    const start = () => {
      const tier = detectTier();
      if (tier === 0 || cancelled) return;
      void import("./knob-scene").then(({ attachKnob }) => {
        if (cancelled) return;
        detach = attachKnob(host, tier, fallback);
        root.dataset.knobLive = "";
      });
    };
    // Safari has no requestIdleCallback.
    const idleApi = window.requestIdleCallback as
      typeof window.requestIdleCallback | undefined;
    let idle = 0;
    const schedule = () => {
      idle = idleApi
        ? idleApi(start, { timeout: 2500 })
        : window.setTimeout(start, 300);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (idleApi) window.cancelIdleCallback(idle);
      else clearTimeout(idle);
      fallback();
    };
  }, [scene]);

  // Direct manipulation: the knob turns under the pointer, respecting where it was grabbed.
  const gesture = React.useRef<{
    id: number;
    last: number;
    raw: number;
    travel: number;
    detent: number;
  } | null>(null);

  const centre = () => {
    const box = rootRef.current!.getBoundingClientRect();
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (gesture.current || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const c = centre();
    const state = knobStore.getState();
    gesture.current = {
      id: event.pointerId,
      last: pointerAngle(event.clientX - c.x, event.clientY - c.y),
      raw: detentAngle(count, state.index),
      travel: 0,
      detent: state.index,
    };
    knobStore.setState({ pressed: true, preview: null });
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    const c = centre();
    const a = pointerAngle(event.clientX - c.x, event.clientY - c.y);
    const delta = wrapDelta(a - g.last);
    g.last = a;
    g.raw += delta;
    g.travel += Math.abs(delta);
    if (g.travel < DRAG_SLOP) return;
    const turned = notched(count, withEndStops(count, g.raw));
    const detent = nearestDetent(count, turned);
    if (detent !== g.detent) {
      g.detent = detent;
      if (sound()) playTick("button");
    }
    knobStore.setState({ drag: turned, pressed: false });
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    gesture.current = null;
    const dragged = g.travel >= DRAG_SLOP;
    knobStore.setState({ drag: null, pressed: false });
    if (event.type === "pointercancel") return;
    if (dragged) select(g.detent);
    else open();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const i = knobStore.getState().index;
    const moves: Record<string, number> = {
      ArrowRight: i + 1,
      ArrowUp: i + 1,
      ArrowLeft: i - 1,
      ArrowDown: i - 1,
      PageUp: i + 3,
      PageDown: i - 3,
      Home: 0,
      End: count - 1,
    };
    if (event.key in moves) {
      event.preventDefault();
      select(moves[event.key]!);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  };

  const onLean = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || gesture.current) return;
    const box = rootRef.current!.getBoundingClientRect();
    const k = (v: number) => Math.max(-1, Math.min(1, v / (box.width * 0.6)));
    knobStore.setState({
      tiltX: k(event.clientY - box.top - box.height / 2),
      tiltY: k(event.clientX - box.left - box.width / 2),
    });
  };
  const onLeave = () => knobStore.setState({ tiltX: 0, tiltY: 0 });

  const ticks = tickPositions(count);
  const current = items[index];
  const hint = `${id}-hint`;

  return (
    <div
      ref={rootRef}
      onPointerMove={onLean}
      onPointerLeave={onLeave}
      className={cn("relative aspect-square select-none", className)}
    >
      <svg
        aria-hidden
        focusable="false"
        viewBox="-200 -200 400 400"
        className="absolute inset-0 size-full overflow-visible"
      >
        <defs>
          <linearGradient id={`${id}-skirt`} x1="0" y1="0" x2="1" y2="1">
            <stop
              offset="0"
              style={{ stopColor: "light-dark(#f4f3f0, #4c4c49)" }}
            />
            <stop
              offset=".55"
              style={{ stopColor: "light-dark(#c8c6c1, #232321)" }}
            />
            <stop
              offset="1"
              style={{ stopColor: "light-dark(#8c8a85, #0a0a09)" }}
            />
          </linearGradient>
          <linearGradient id={`${id}-cham`} x1="0" y1="0" x2="1" y2="1">
            <stop
              offset="0"
              style={{ stopColor: "light-dark(#8c8a85, #0a0a09)" }}
            />
            <stop
              offset=".5"
              style={{ stopColor: "light-dark(#c8c6c1, #232321)" }}
            />
            <stop
              offset="1"
              style={{ stopColor: "light-dark(#f4f3f0, #4c4c49)" }}
            />
          </linearGradient>
          <linearGradient id={`${id}-collar`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity=".45" />
            <stop offset="1" stopColor="#fff" stopOpacity=".5" />
          </linearGradient>
          <radialGradient
            id={`${id}-turn`}
            cx="0"
            cy="0"
            r="3"
            gradientUnits="userSpaceOnUse"
            spreadMethod="repeat"
          >
            <stop
              offset="0"
              style={{ stopColor: "light-dark(#dedcd8, #1e1e1c)" }}
            />
            <stop
              offset=".5"
              style={{ stopColor: "light-dark(#d1cfca, #272725)" }}
            />
            <stop
              offset="1"
              style={{ stopColor: "light-dark(#dedcd8, #1e1e1c)" }}
            />
          </radialGradient>
          <filter
            id={`${id}-blur`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="15" />
          </filter>
        </defs>

        <g className="stroke-ink-2" fill="none">
          {count > 1 && (
            <path
              d={(() => {
                const half = sweepOf(count) / 2 + 8;
                const a = polar(174, -half);
                const b = polar(174, half);
                return `M${a.x} ${a.y} A174 174 0 ${half * 2 > 180 ? 1 : 0} 1 ${b.x} ${b.y}`;
              })()}
              strokeWidth="1.2"
            />
          )}
          {ticks.map(({ angle: a, major }, i) => {
            const from = polar(major ? 166 : 174, a);
            const to = polar(major ? 188 : 182, a);
            return (
              <line
                key={i}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                strokeWidth={major ? 2.4 : 1.2}
              />
            );
          })}
        </g>

        {lamps &&
          items.map((_, i) => {
            const p = polar(197, detentAngle(count, i));
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="4.5"
                className={cn(
                  "stroke-black/25 transition-[fill] duration-150",
                  i === shown ? "fill-signal" : "fill-led-off"
                )}
              />
            );
          })}

        <circle r="161" className="fill-plate-lo" />
        <circle
          r="161"
          fill="none"
          stroke={`url(#${id}-collar)`}
          strokeWidth="2"
        />

        <g data-knob-poster>
          <circle
            cx="14"
            cy="26"
            r="150"
            fill="#000"
            style={{ opacity: "var(--shadow-k)" }}
            filter={`url(#${id}-blur)`}
          />
          <circle r="150" fill={`url(#${id}-skirt)`} />
          <circle
            r="146"
            fill="none"
            stroke="#000"
            strokeOpacity=".24"
            strokeWidth="8"
            strokeDasharray="1.4 2.2"
          />
          <circle r="150" fill="none" stroke="#000" strokeOpacity=".3" />
          <circle r="138" fill={`url(#${id}-cham)`} />
          <circle r="130" fill={`url(#${id}-turn)`} />
          <circle r="130" fill="none" stroke="#000" strokeOpacity=".18" />
          <g
            data-knob-svg
            style={{
              transform: `rotate(${round(angle)}deg)`,
              transition:
                drag === null ? "transform 550ms var(--ease-detent)" : "none",
            }}
          >
            <line
              x1="0"
              y1="-56"
              x2="0"
              y2="-118"
              stroke="#000"
              strokeOpacity=".3"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <line
              x1="0"
              y1="-57"
              x2="0"
              y2="-117"
              className="stroke-signal"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <line
              x1="0"
              y1="-140"
              x2="0"
              y2="-151"
              className="stroke-ink"
              strokeWidth="3"
            />
          </g>
          <circle
            r="5"
            fill="#000"
            fillOpacity=".14"
            style={{
              transform: pressed ? "scale(0.98)" : undefined,
            }}
          />
        </g>
      </svg>

      <div
        ref={hostRef}
        aria-hidden
        className="pointer-events-none absolute top-[2.5%] left-[2.5%] size-[95%]"
      />

      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={count - 1}
        aria-valuenow={index}
        aria-valuetext={current?.label}
        aria-describedby={hint}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        data-cursor="Turn"
        className="absolute top-[12.5%] left-[12.5%] size-[75%] cursor-grab touch-none rounded-full active:cursor-grabbing"
      />
      <p id={hint} className="sr-only">
        Arrow keys turn it; Enter opens the selection.
      </p>
    </div>
  );
}
