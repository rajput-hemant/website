import { cn } from "@/flavors/timetable/lib/utils";

/** Every in-page view the scene chunk draws (`scene/views/index.ts`). */
export type SceneViewId =
  | "totem"
  | "clock"
  | "counter"
  | "signal"
  | "roundel"
  | "train"
  | "ticket"
  | "bogie"
  | "pylon"
  | "posts"
  | "drum"
  | "info"
  | "validator"
  | "turntable"
  | "printer"
  | "levers"
  | "buffer";

/**
 * A box on the page the session draws one 3D object into (a tracked
 * `[data-scene-view]`, docs/m2-scene-spec.md): it holds its size, so the
 * poster and the live object share one box and nothing shifts. Decorative
 * and hidden in print; the page's own text carries every fact. `poster` is
 * the static drawing for T0 and before the scene is live.
 */
export function SceneView({
  id,
  poster,
  className,
  data,
}: {
  id: SceneViewId;
  poster?: React.ReactNode;
  className?: string;
  /** `data-*` the object reads (geometry the page already knows). */
  data?: Readonly<Record<`data-${string}`, string>>;
}) {
  return (
    <div
      {...data}
      aria-hidden
      data-scene-view={id}
      data-print="hide"
      className={cn("relative", className)}
    >
      {poster ? (
        <div
          data-scene-poster
          aria-hidden
          className="pointer-events-none absolute inset-0"
        >
          {poster}
        </div>
      ) : null}
    </div>
  );
}
