import type { Monument } from "@/flavors/survey/components/scene/glyphs/monument";

/** How long the poster and the canvas cross-fade (`--duration-ui`). */
export const FADE_MS = 150;
/** Longer than the turn back takes (the monument's spring, about 180ms). */
export const SETTLE_MS = 400;

type Hooks = { onLost: () => void; onRest: () => void };

/**
 * A gazetteer row's hover lifecycle: pointing at `row` with a mouse opens
 * the monument (`open` returns null while its chunk loads, or when the engine
 * refuses it) and turns it a quarter; leaving turns it back, and once it
 * rests `root` drops `data-live` (the printed symbol fades back) and the
 * monument detaches. A row that leaves the screen while turning back never
 * reports rest, so leaving also arms a deadline that detaches it anyway, so
 * a slot is never held. Returns the unbind, which detaches too.
 */
export function bindRowHover({
  row,
  root,
  open,
}: {
  row: HTMLElement;
  root: HTMLElement;
  open: (hooks: Hooks) => Monument | null;
}): () => void {
  let glyph: Monument | null = null;
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
  const enter = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    hovered = true;
    window.clearTimeout(fade);
    window.clearTimeout(deadline);
    // Over the budget, or with the context lost, it stays printed.
    glyph ??= open({ onLost: drop, onRest: rest });
    if (!glyph) return;
    root.dataset.live = "";
    glyph.aim(90);
  };
  const leave = () => {
    hovered = false;
    if (!glyph) return;
    glyph.aim(0);
    window.clearTimeout(deadline);
    deadline = window.setTimeout(() => {
      if (!hovered) drop();
    }, SETTLE_MS + FADE_MS);
  };

  row.addEventListener("pointerenter", enter);
  row.addEventListener("pointerleave", leave);
  return () => {
    row.removeEventListener("pointerenter", enter);
    row.removeEventListener("pointerleave", leave);
    drop();
  };
}
