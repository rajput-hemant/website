import { playRing } from "@/flavors/timetable/lib/sound/voices";

import { input } from "@/lib/scene/store";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * The indicator's own pointer input: the shared drag, plus the release speed
 * that pitches the rod ring (on touch too, as a horizontal swing).
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
  // The last pointer sample, for the release speed that pitches the rod ring.
  let last = { x: 0, t: 0, speed: 0 };

  const move = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    input.px = ((e.clientX - r.left) / r.width) * 2 - 1;
    input.py = -(((e.clientY - r.top) / r.height) * 2 - 1);
    input.inside = e.pointerType !== "touch";
    input.movedAt = performance.now();
    if (!start || e.pointerId !== start.id) return;
    const dt = e.timeStamp - last.t;
    if (dt > 0)
      last = { x: e.clientX, t: e.timeStamp, speed: (e.clientX - last.x) / dt };
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (!dragging && Math.hypot(dx, dy) > 4) {
      dragging = true;
      input.dragging = true;
      host.setPointerCapture(e.pointerId);
    }
    if (!dragging) return;
    input.dragX = clamp(start.dx + dx, -220, 220);
    // Touch keeps vertical movement for page scroll (touch-action: pan-y).
    if (e.pointerType !== "touch") input.dragY = clamp(start.dy + dy, -60, 110);
  };
  const down = (e: PointerEvent) => {
    if (e.button !== 0) return;
    start = {
      x: e.clientX,
      y: e.clientY,
      dx: 0,
      dy: 0,
      id: e.pointerId,
    };
    dragging = false;
    last = { x: e.clientX, t: e.timeStamp, speed: 0 };
  };
  const up = (e: PointerEvent) => {
    // A hand held still before letting go releases at rest.
    const speed = e.timeStamp - last.t > 100 ? 0 : last.speed;
    if (dragging && e.type === "pointerup") playRing(input.dragX, speed);
    start = null;
    dragging = false;
    input.dragging = false;
    input.dragX = 0;
    input.dragY = 0;
    input.movedAt = performance.now();
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
