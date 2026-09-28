import type { SceneItem } from "@/lib/scene/store";

/**
 * The scene tag: the DOM label that names where a hovered or focused 3D part
 * goes (a drawer's sheet, a project's title), like home's drawer callouts.
 */

/** The tag's text: the hit's own name, else the page item's `data-scene-label`. */
export function tagLabel(
  hit: { id: string | null; label?: string | undefined },
  items: readonly SceneItem[]
): string | null {
  if (hit.label) return hit.label;
  if (!hit.id) return null;
  return items.find((it) => it.id === hit.id)?.label ?? null;
}

/**
 * The instance of the drawn target that `id` names and that links somewhere.
 * It looks at what is drawn, not at what the pointer can pick yet (a part
 * becomes pickable only half way through plotting in), so a row focused from
 * the keyboard while its drawing plots in still gets its tag.
 */
export function findDrawn<
  H extends { id: string | null; href: string | null },
  T extends { drawn: boolean; count: number; pick: (i: number) => H },
>(targets: readonly T[], id: string): { t: T; i: number; hit: H } | null {
  for (const t of targets) {
    if (!t.drawn) continue;
    for (let i = 0; i < t.count; i++) {
      const hit = t.pick(i);
      if (hit.id === id && hit.href) return { t, i, hit };
    }
  }
  return null;
}

/** Keeps a tag `width` wide centred at `x` inside `0..bound`, `pad` from each edge. */
export function clampTag(x: number, width: number, bound: number, pad = 4) {
  const half = width / 2 + pad;
  if (bound < half * 2) return bound / 2;
  return Math.min(bound - half, Math.max(half, x));
}

/**
 * Touch has no hover, so the first tap on a scene part arms it (its tag shows)
 * and a second tap on the same part goes. A mouse or pen click always goes.
 */
export function createTapGate() {
  let touch = false;
  let armed: string | null = null;
  return {
    /** Records the pointer that pressed last. */
    down(pointerType: string) {
      touch = pointerType === "touch";
    },
    /** Whether a click on `id` should go now; otherwise it arms `id`. */
    go(id: string | null): boolean {
      if (!touch || !id || id === armed) {
        armed = null;
        return true;
      }
      armed = id;
      return false;
    },
    get armed() {
      return armed;
    },
    /** Drops the armed part; returns it so its hover can be cleared. */
    disarm(): string | null {
      const was = armed;
      armed = null;
      return was;
    },
  };
}
