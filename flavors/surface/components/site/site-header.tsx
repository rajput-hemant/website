import Link from "next/link";
import { CommandTrigger } from "@/flavors/surface/components/command/command-trigger";
import { KeyLink } from "@/flavors/surface/components/ui/primitives";
import { MODEL } from "@/flavors/surface/content";

import { site } from "@/content/site";

import { ChannelKeys } from "./channel-keys";
import { EditionSwitch, MotionSwitch } from "./switches";

/**
 * The top rail of the faceplate: the model badge, channel keys 01 to 04, then
 * Resume, ⌘K and the edition and motion switches. On phones the keys drop to
 * a second row of four.
 */
export function SiteHeader() {
  return (
    <header
      data-print="hide"
      style={{ viewTransitionName: "site-header" }}
      className="seam-b relative z-40 grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3.5 bg-plate px-4 pt-3 pb-3.5 md:sticky md:top-0 md:h-(--header-height) md:grid-cols-[1fr_auto_1fr] md:px-6 md:py-0 lg:px-12"
    >
      <Link
        href="/"
        data-channel={0}
        className="flex min-h-11 items-center gap-3 justify-self-start font-display text-[1.0625rem] leading-none tracking-[0.01em]"
      >
        {site.name}
        <span
          aria-hidden
          className="hidden rounded-[3px] border border-ink-2 px-1.5 pt-[5px] pb-1 text-[0.625rem] leading-none tracking-[0.16em] text-ink-2 sm:inline"
        >
          {MODEL}
        </span>
      </Link>

      <nav
        aria-label="Primary"
        className="col-span-2 row-start-2 md:col-span-1 md:col-start-2 md:row-start-1"
      >
        <ChannelKeys />
      </nav>

      <div className="flex items-center gap-3 justify-self-end lg:gap-[18px]">
        <KeyLink href="/resume" className="hidden lg:inline-flex">
          Resume
        </KeyLink>
        <CommandTrigger className="hidden md:inline-flex" />
        <EditionSwitch compact />
        <MotionSwitch compact />
      </div>
    </header>
  );
}
