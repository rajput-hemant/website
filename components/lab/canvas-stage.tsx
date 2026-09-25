"use client";

import {
  createContext,
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, type Dpr } from "@react-three/fiber";

import { cn } from "@/lib/utils";

type StageState = {
  /** False while the stage is offscreen or the tab is hidden; scenes should stop invalidating. */
  active: boolean;
  /** Scenes report whether they are animating, so performance is only sampled while frames flow. */
  setMoving: (moving: boolean) => void;
};

const StageContext = createContext<StageState | null>(null);

export function useStage(): StageState {
  const stage = use(StageContext);
  if (!stage) throw new Error("useStage must be used inside <CanvasStage>");
  return stage;
}

const MAX_DPR = 1.5;

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

function useTabVisible() {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "visible",
    () => true
  );
}

function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setInView(entry.isIntersecting);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, inView] as const;
}

type CanvasStageProps = {
  children: ReactNode;
  className?: string;
  /** Rendered by R3F when a WebGL context cannot be created. */
  fallback?: ReactNode;
};

/**
 * The one <Canvas> per lab page. Renders on demand only, caps DPR at 1.5 and
 * drops to 1 when frame rate declines, and stops rendering entirely while
 * offscreen or in a background tab.
 */
export function CanvasStage({
  children,
  className,
  fallback,
}: CanvasStageProps) {
  const [containerRef, inView] = useInView<HTMLDivElement>();
  const tabVisible = useTabVisible();
  const [moving, setMoving] = useState(false);
  const [dpr, setDpr] = useState<Dpr>([1, MAX_DPR]);
  const active = inView && tabVisible;

  const stage = useMemo(() => ({ active, setMoving }), [active]);

  return (
    <div ref={containerRef} className={cn("relative size-full", className)}>
      <Canvas
        frameloop={active ? "demand" : "never"}
        dpr={dpr}
        camera={{ fov: 30, near: 0.1, far: 50, position: [0, 0, 5] }}
        gl={{ antialias: false, alpha: true }}
        fallback={fallback}
        style={{ touchAction: "none" }}
        aria-hidden
      >
        {/* Mounted per burst of motion: the monitor counts frames, and idle gaps would read as a slow device. */}
        {moving && (
          <PerformanceMonitor
            flipflops={3}
            onDecline={() => setDpr(1)}
            onIncline={() => setDpr([1, MAX_DPR])}
            onFallback={() => setDpr(1)}
          />
        )}
        <StageContext value={stage}>{children}</StageContext>
      </Canvas>
    </div>
  );
}
