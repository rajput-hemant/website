"use client";

import { IconButton } from "@/flavors/timetable/components/ui";
import { Menu } from "@base-ui/react/menu";
import {
  EyeOff,
  LoaderCircle,
  MoreHorizontal,
  ShieldAlert,
} from "lucide-react";

import type { ModerateRequest } from "@/lib/ask/client";
import { useMessageModeration } from "@/components/semantic/ask/use-message-moderation";

const itemClass =
  "flex min-h-11 cursor-default items-center gap-2.5 rounded-md px-3 text-[0.9375rem] font-bold text-ink outline-none select-none data-highlighted:bg-ground [&_svg]:size-4 [&_svg]:text-ink-soft";

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
          render={<IconButton label={`Moderate ${label}`} variant="quiet" />}
        >
          {isPending ? (
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
          ) : (
            <MoreHorizontal aria-hidden strokeWidth={2} className="size-4" />
          )}
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner
            side="bottom"
            align="start"
            sideOffset={6}
            collisionPadding={12}
            className="z-50"
          >
            <Menu.Popup className="min-w-44 origin-(--transform-origin) rounded-lg bg-surface p-1 shadow-lift ring-1 ring-rule transition-[opacity,scale] duration-(--duration-ui) ease-enter outline-none data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
              <Menu.Item className={itemClass} onClick={() => run("reject")}>
                <EyeOff aria-hidden strokeWidth={2} />
                Hide
              </Menu.Item>
              <Menu.Item className={itemClass} onClick={() => run("spam")}>
                <ShieldAlert aria-hidden strokeWidth={2} />
                Mark as spam
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
      <span
        role="status"
        className="font-mono text-mono-xs font-semibold text-ink-soft"
      >
        {result}
      </span>
    </span>
  );
}
