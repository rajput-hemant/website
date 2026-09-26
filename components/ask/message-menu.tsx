"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Menu } from "@base-ui/react/menu";
import {
  EyeOff,
  LoaderCircle,
  MoreHorizontal,
  ShieldAlert,
} from "lucide-react";

import { IconButton } from "@/components/ui";

import { moderate, type ModerateRequest, type ModerationAction } from "./api";
import { useOwner } from "./owner-provider";

const itemClass =
  "flex cursor-default items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-sm text-ink outline-none select-none data-highlighted:bg-sheet-deep [&_svg]:size-4 [&_svg]:text-ink-faint";

const doneLabels: Partial<Record<ModerationAction, string>> = {
  reject: "Hidden",
  spam: "Marked spam",
};

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
  const { owner } = useOwner();
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<string | null>(null);

  if (!owner) return null;

  function run(action: ModerationAction) {
    startTransition(async () => {
      const response = await moderate({ slug, target, action });
      setResult(
        response.ok ? (doneLabels[action] ?? "Updated") : response.message
      );
      if (response.ok) router.refresh();
    });
  }

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
