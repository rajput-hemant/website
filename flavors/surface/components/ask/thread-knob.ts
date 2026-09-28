import type { PanelProps } from "@/flavors/surface/components/site/panel";

import { excerpt } from "@/lib/ask/format";
import type { Question } from "@/lib/data/types";

/**
 * The Ask pages' knob: one detent per listed conversation. An empty queue
 * keeps a single detent that opens nothing, so the rail (and the knob's
 * canvas) never drops out of the layout.
 */
export function threadKnob(
  threads: readonly Pick<Question, "body" | "slug">[],
  initial?: number
): PanelProps["knob"] {
  return {
    items:
      threads.length > 0
        ? threads.map((thread) => ({
            label: excerpt(thread.body, 48),
            href: `/ask/${thread.slug}`,
          }))
        : [{ label: "Queue empty" }],
    unit: "Thread",
    label: "Thread selector",
    initial,
  };
}
