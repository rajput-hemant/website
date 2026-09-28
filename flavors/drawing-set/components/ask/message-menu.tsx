"use client";

import { IconButton } from "@/flavors/drawing-set/components/ui";
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
  "flex cursor-default items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-sm text-ink outline-none select-none data-highlighted:bg-sheet-deep [&_svg]:size-4 [&_svg]:text-ink-faint";

/** Owner-only overflow menu on a published visitor slip: hide it or mark it as spam. */
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
          render={<IconButton label={`Moderate ${label}`} />}
        >
          {isPending ? (
            <LoaderCircle aria-hidden className="animate-spin" />
          ) : (
            <MoreHorizontal aria-hidden strokeWidth={1.75} />
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
            <Menu.Popup className="min-w-40 origin-(--transform-origin) rounded-md border border-line-strong bg-sheet p-1 font-sans shadow-lift transition-[opacity,scale] duration-(--duration-ui) ease-enter outline-none data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-ending-style:ease-exit data-starting-style:scale-[0.98] data-starting-style:opacity-0">
              <Menu.Item className={itemClass} onClick={() => run("reject")}>
                <EyeOff aria-hidden strokeWidth={1.75} />
                Hide
              </Menu.Item>
              <Menu.Item className={itemClass} onClick={() => run("spam")}>
                <ShieldAlert aria-hidden strokeWidth={1.75} />
                Mark as spam
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
      <span role="status" className="font-mono text-mono-xs text-accent">
        {result}
      </span>
    </span>
  );
}
