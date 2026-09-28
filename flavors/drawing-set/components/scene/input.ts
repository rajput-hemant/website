import { input, sceneStore } from "@/lib/scene/store";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * Pointer input over the slot: hover into `input.px/py`, and a drag (after
 * 4px, with pointer capture) that accumulates across drags into
 * `input.dragX/dragY`, clamped except on the lab route, where it spins the
 * turntable freely.
 */
export function bindInput(host: HTMLElement) {
  let start: {
    x: number;
    y: number;
    dx: number;
    dy: number;
    id: number;
  } | null = null;
  let dragging = false;

  const move = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    input.px = ((e.clientX - r.left) / r.width) * 2 - 1;
    input.py = -(((e.clientY - r.top) / r.height) * 2 - 1);
    input.inside = e.pointerType !== "touch";
    input.movedAt = performance.now();
    if (!start || e.pointerId !== start.id) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (!dragging && Math.hypot(dx, dy) > 4) {
      dragging = true;
      host.setPointerCapture(e.pointerId);
    }
    if (!dragging) return;
    const lab = sceneStore.getState().route === "lab";
    input.dragX = lab ? start.dx + dx : clamp(start.dx + dx, -160, 160);
    // Touch keeps vertical movement for page scroll (touch-action: pan-y).
    if (e.pointerType !== "touch") input.dragY = clamp(start.dy + dy, -60, 110);
  };
  const down = (e: PointerEvent) => {
    if (e.button !== 0) return;
    start = {
      x: e.clientX,
      y: e.clientY,
      dx: input.dragX,
      dy: input.dragY,
      id: e.pointerId,
    };
    dragging = false;
  };
  const up = () => {
    start = null;
    dragging = false;
  };
  const leave = () => {
    input.inside = false;
    input.movedAt = performance.now();
  };

  host.addEventListener("pointermove", move);
  host.addEventListener("pointerdown", down);
  host.addEventListener("pointerup", up);
  host.addEventListener("pointercancel", up);
  host.addEventListener("pointerleave", leave);
  return () => {
    host.removeEventListener("pointermove", move);
    host.removeEventListener("pointerdown", down);
    host.removeEventListener("pointerup", up);
    host.removeEventListener("pointercancel", up);
    host.removeEventListener("pointerleave", leave);
    leave();
  };
}
