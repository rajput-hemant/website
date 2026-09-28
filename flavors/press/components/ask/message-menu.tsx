"use client";

import { IconButton } from "@/flavors/press/components/ui/button";
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
  "flex min-h-11 cursor-default items-center gap-2.5 px-3 text-sm font-bold outline-none select-none data-highlighted:bg-paper [&_svg]:size-4 [&_svg]:text-ink-soft";

/** The author's menu on a published visitor message: hide it or mark it as spam. */
export function MessageMenu({
  slug,
  target,
  label,
}: {
  slug: string;
  target: ModerateRequest["target"];
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
            <MoreHorizontal aria-hidden strokeWidth={2} />
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
            <Menu.Popup className="min-w-44 origin-(--transform-origin) bg-sheet p-1 shadow-sheet ring-1 ring-rule transition-[opacity,scale] duration-(--duration-ui) ease-enter outline-none data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0">
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
      <span role="status" className="slug">
        {result}
      </span>
    </span>
  );
}
