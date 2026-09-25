import type { Experience, Now } from "@/lib/data/types";
import { Disclosure } from "@/components/ui/disclosure";

import { NowSummary } from "./now-summary";
import { RolesSummary } from "./roles-summary";

/**
 * The single quiet row that holds everything past the first glance. Its
 * summary names what is inside, so nobody has to open it to find out.
 */
export function More({ now, roles }: { now: Now; roles: Experience[] }) {
  if (now.items.length === 0 && roles.length === 0) return null;

  return (
    <Disclosure
      id="more"
      className="mt-12 border-t border-hairline pt-3 sm:mt-14"
      summaryClassName="-mx-3 w-fit items-center gap-1.5 rounded-md px-3 py-2 meta text-subtle transition-colors duration-150 select-none hover:text-foreground focus-visible:outline-offset-0 print:hidden"
      contentClassName="grid gap-12 pt-6"
      summary={
        <>
          More
          <span aria-hidden className="text-faint">
            {" "}
            ·{" "}
          </span>
          <span className="font-sans text-xs tracking-normal text-subtle normal-case">
            Now and experience
          </span>
        </>
      }
    >
      <NowSummary now={now} />
      <RolesSummary roles={roles} />
    </Disclosure>
  );
}
