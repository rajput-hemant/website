import { Disclosure } from "@/flavors/minimal/components/ui/disclosure";
import { cn } from "@/flavors/minimal/lib/utils";

import type { Now } from "@/lib/data/types";

import { NowSummary } from "./now-summary";

/**
 * The single quiet row past the first glance. Its summary names what is
 * inside, so nobody has to open it to find out.
 */
export function More({ now, className }: { now: Now; className?: string }) {
  if (now.items.length === 0) return null;

  return (
    <Disclosure
      id="more"
      className={cn("mt-12 border-t border-hairline pt-3 sm:mt-14", className)}
      summaryClassName="hit-area -mx-3 w-fit items-center gap-1.5 rounded-md px-3 py-2 meta text-subtle transition-colors duration-(--duration-exit) select-none hover:text-foreground active:text-foreground focus-visible:outline-offset-0 print:hidden"
      contentClassName="grid gap-12 pt-6"
      summary={
        <>
          More
          <span aria-hidden className="text-faint">
            {" "}
            ·{" "}
          </span>
          <span className="font-sans text-xs tracking-normal text-subtle normal-case [font-variation-settings:normal]">
            What I&rsquo;m doing now
          </span>
        </>
      }
    >
      <NowSummary now={now} />
    </Disclosure>
  );
}
