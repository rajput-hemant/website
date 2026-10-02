import { LazySceneLoader } from "@/flavors/maquette/components/scene/lazy-scene-loader";
import { poses, type SceneRoute } from "@/flavors/maquette/lib/scene/poses";
import { cn } from "@/flavors/maquette/lib/utils";

import { ScenePoster, type Pin } from "./scene-poster";

export type { Pin, SceneRoute };

/**
 * Where the model stands on this page: the drawn poster plus the loader,
 * which lends the session's one canvas to this slot and fades the poster
 * once a frame is on screen. `board` is what stands on the plinth, encoded
 * by `encodeBoard`, so the poster and the scene show the same model.
 * `pins` are the pieces that carry a numbered pin and their name; the scene
 * moves the pins with the model, so they stay in HTML and never in the
 * canvas. A lifted piece's pin turns basswood.
 */
export function SceneSlot({
  route,
  board = null,
  pins = [],
  label,
  hint = "Drag to turn the model",
  caption = true,
  stageClassName,
  className,
}: {
  route: SceneRoute;
  board?: string | null;
  pins?: readonly Pin[];
  /** What stands on the plinth, on the label at its edge. */
  label?: string;
  hint?: string;
  /** Off where the page sets its own caption under the model (home). */
  caption?: boolean;
  /** The stage's aspect ratio, when not 16 by 10; fixed per breakpoint so CLS stays 0. */
  stageClassName?: string;
  className?: string;
}) {
  return (
    <figure className={cn("group/fig relative m-0", className)}>
      <div
        data-scene-slot
        data-scene-route={route}
        data-scene-board={board ?? undefined}
        style={{ viewTransitionName: "scene" }}
        className={cn("relative aspect-[16/10] w-full", stageClassName)}
      >
        <div
          data-scene-poster
          aria-hidden
          className="absolute inset-0 transition-opacity duration-(--duration-ui)"
        >
          <ScenePoster route={route} board={board} pins={pins} />
        </div>
        <LazySceneLoader route={route} />
        {pins.length > 0 ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden overflow-x-clip group-has-[[data-scene-live]]/fig:block"
          >
            {pins.map(({ id, n, name }) => (
              <span
                key={id}
                data-mq-pin={id}
                className="absolute top-0 left-0 h-[38px] w-6 opacity-0 will-change-transform after:absolute after:top-6 after:left-[11.5px] after:h-[calc(0.875rem+var(--rise,0px))] after:w-px after:bg-piece-edge data-[on]:z-10 data-[on]:[&>b]:border-wood data-[on]:[&>b]:bg-wood data-[on]:[&>i]:bg-wood data-[on]:[&>i]:text-[#202326]"
              >
                <b className="absolute top-0 left-0 z-1 grid size-6 place-items-center rounded-full border border-piece-edge bg-piece font-mono text-[10px] leading-none font-normal text-[#202326] shadow-[0_3px_8px_-4px_var(--color-shade)] transition-colors duration-(--duration-ui)">
                  {String(n).padStart(2, "0")}
                </b>
                <i className="absolute top-[3px] left-4.5 rounded-r-full bg-ground/85 py-0.5 pr-2 pl-2.5 font-display text-[0.75rem] leading-[1.15] font-medium whitespace-nowrap text-ink not-italic transition-colors duration-(--duration-ui) [[data-flip]>&]:translate-x-[calc(-100%-12px)] [[data-flip]>&]:rounded-l-full [[data-flip]>&]:rounded-r-none [[data-flip]>&]:pr-2.5 [[data-flip]>&]:pl-2">
                  {name}
                </i>
              </span>
            ))}
          </div>
        ) : null}
        <p
          aria-hidden
          className="pointer-events-none absolute top-1 right-0 hidden num fine:group-has-[[data-scene-live]]/fig:block"
        >
          {hint}
        </p>
      </div>
      <figcaption className={cn("pt-3 caps", !caption && "sr-only")}>
        On the plinth{" "}
        <b className="font-sans text-sm font-medium tracking-normal text-ink normal-case">
          {label ?? poses[route].caption}
        </b>
      </figcaption>
    </figure>
  );
}
