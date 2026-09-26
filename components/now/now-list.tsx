import { type Now } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { UrlLink } from "@/components/ui/url-link";

import { fitsTwoColumns } from "./now-layout";

/**
 * The current focus, as numbered statements with an optional link each. A
 * list of short items splits into two ruled columns from tablet width.
 */
export function NowList({ items }: { items: Now["items"] }) {
  const split = fitsTwoColumns(items);

  return (
    <ol
      className={cn(
        "border-t border-hairline",
        split && "md:grid md:grid-cols-2 md:gap-x-10"
      )}
    >
      {items.map((item, index) => (
        <li
          key={item.text}
          className={cn(
            "grid grid-cols-[2.25rem_1fr] gap-x-3 border-b border-hairline py-5 sm:grid-cols-[3rem_1fr] sm:py-6",
            split && "md:grid-cols-[2.25rem_1fr] md:py-4"
          )}
        >
          <span
            aria-hidden
            className="pt-[0.45rem] meta text-subtle tabular-nums"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <p
              className={cn("text-lg text-foreground", split && "md:text-base")}
            >
              {item.text}
            </p>
            {item.link && (
              <p className="mt-1.5 text-sm text-muted">
                <UrlLink href={item.link} />
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
