/** How long the poster and the canvas cross-fade (`--duration-ui`). */
export const FADE_MS = 150;
/** Longer than a glyph's spring takes to settle back (about 180ms). */
export const SETTLE_MS = 400;

export type HoverHooks = { onLost: () => void; onRest: () => void };

/**
 * A hover glyph's lifecycle: pointing at `target` with a mouse opens the
 * glyph (`open` returns null while its chunk loads, or when the engine
 * refuses it) and runs `enter`; leaving runs `leave`, and once the glyph
 * rests `root` drops `data-live` (the poster fades back) and it detaches.
 * A target that leaves the screen while settling never reports rest, so
 * leaving also arms a deadline that detaches it anyway, so a slot is never
 * held. `move` hears pointer moves while it is open. Returns the unbind,
 * which detaches too.
 */
export function bindHoverGlyph<H extends { detach(): void }>({
  target,
  root,
  open,
  enter,
  leave,
  move,
}: {
  target: HTMLElement;
  root: HTMLElement;
  open: (hooks: HoverHooks) => H | null;
  enter: (glyph: H) => void;
  leave: (glyph: H) => void;
  move?: (glyph: H, event: PointerEvent) => void;
}): () => void {
  let glyph: H | null = null;
  let hovered = false;
  let fade = 0;
  let deadline = 0;

  const drop = () => {
    window.clearTimeout(fade);
    window.clearTimeout(deadline);
    glyph?.detach();
    glyph = null;
    delete root.dataset.live;
  };
  const rest = () => {
    if (hovered || !glyph) return;
    delete root.dataset.live;
    window.clearTimeout(fade);
    fade = window.setTimeout(() => {
      if (!hovered) drop();
    }, FADE_MS);
  };
  const onEnter = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    hovered = true;
    window.clearTimeout(fade);
    window.clearTimeout(deadline);
    // Over the budget, or with the context lost, it stays printed.
    glyph ??= open({ onLost: drop, onRest: rest });
    if (!glyph) return;
    root.dataset.live = "";
    enter(glyph);
  };
  const onLeave = () => {
    hovered = false;
    if (!glyph) return;
    leave(glyph);
    window.clearTimeout(deadline);
    deadline = window.setTimeout(() => {
      if (!hovered) drop();
    }, SETTLE_MS + FADE_MS);
  };
  const onMove = (event: PointerEvent) => {
    if (glyph && hovered && event.pointerType === "mouse") move?.(glyph, event);
  };

  target.addEventListener("pointerenter", onEnter);
  target.addEventListener("pointerleave", onLeave);
  if (move) target.addEventListener("pointermove", onMove);
  return () => {
    target.removeEventListener("pointerenter", onEnter);
    target.removeEventListener("pointerleave", onLeave);
    target.removeEventListener("pointermove", onMove);
    drop();
  };
}
