"use client";

import { Menu } from "@base-ui/react/menu";

import type { ModerateRequest } from "@/lib/ask/client";
import { useMessageModeration } from "@/components/semantic/ask/use-message-moderation";

const itemClass =
  "flex min-h-9 cursor-default items-center rounded-[4px] px-2.5 font-display text-[0.75rem] tracking-[0.12em] text-ink uppercase outline-none select-none data-highlighted:bg-plate-lo";

/** Owner-only menu on a published visitor message: hide it or mark it as spam. */
export function MessageMenu({
  slug,
  target,
  label,
}: {
  slug: string;
  target: ModerateRequest["target"];
  /** Names the message for screen readers, e.g. "message from Alex". */
  label: string;
}) {
  const { owner, isPending, result, run } = useMessageModeration(slug, target);

  if (!owner) return null;

  return (
    <span className="inline-flex items-center gap-2">
      <Menu.Root>
        <Menu.Trigger
          disabled={isPending}
          aria-label={`Moderate ${label}`}
          className="key key-sm"
        >
          {isPending ? "Working" : "Moderate"}
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner
            side="bottom"
            align="start"
            sideOffset={6}
            collisionPadding={12}
            className="z-50"
          >
            <Menu.Popup className="mod min-w-40 origin-(--transform-origin) p-1 shadow-[0_12px_28px_-12px_rgb(0_0_0/0.45)] outline-none data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 motion:transition-[opacity,scale] motion:duration-150 motion:ease-[var(--ease-out)]">
              <Menu.Item className={itemClass} onClick={() => run("reject")}>
                Hide
              </Menu.Item>
              <Menu.Item className={itemClass} onClick={() => run("spam")}>
                Mark as spam
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
      <span role="status" className="legend text-ink">
        {result}
      </span>
    </span>
  );
}
