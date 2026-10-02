import { input } from "@/lib/scene/store";

/**
 * Pointer input over the slot: hover into `input.px/py`. The drag, pinch and
 * wheel belong to the inspect controls (`scene-root.tsx`).
 */
export function bindInput(host: HTMLElement) {
  const move = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    input.px = ((e.clientX - r.left) / r.width) * 2 - 1;
    input.py = -(((e.clientY - r.top) / r.height) * 2 - 1);
    input.inside = e.pointerType !== "touch";
    input.movedAt = performance.now();
  };
  const leave = () => {
    input.inside = false;
    input.movedAt = performance.now();
  };

  host.addEventListener("pointermove", move);
  host.addEventListener("pointerleave", leave);
  return () => {
    host.removeEventListener("pointermove", move);
    host.removeEventListener("pointerleave", leave);
    leave();
  };
}
