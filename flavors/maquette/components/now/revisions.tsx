import { cn } from "@/flavors/maquette/lib/utils";

import type { Now } from "@/lib/data/types";
import { hrefProps } from "@/lib/safe-href";

/** Revision letters, A to Z, as a drawing's revision block counts them. */
export const revision = (i: number) =>
  String.fromCharCode(65 + (i % 26)) +
  (i >= 26 ? String(Math.floor(i / 26)) : "");

/**
 * What the model is being revised for now: one card per item, lettered as
 * a drawing's revision block, the newest on top.
 */
export function Revisions({
  items,
  className,
}: {
  items: Now["items"];
  className?: string;
}) {
  return (
    <ol
      className={cn(
        "grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {items.map((item, i) => (
        <li
          key={item.text}
          className="comment-card grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 rounded-[2px] p-5"
        >
          <span className="num text-cut">
            Rev. {revision(items.length - 1 - i)}
          </span>
          <p className="font-display text-lg leading-snug">
            {item.link ? (
              <a
                {...hrefProps(item.link)}
                className="underline decoration-line-strong underline-offset-[0.24em] fine:hover:decoration-cut"
              >
                {item.text}
              </a>
            ) : (
              item.text
            )}
          </p>
        </li>
      ))}
    </ol>
  );
}
