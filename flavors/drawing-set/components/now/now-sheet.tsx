import type { Now } from "@/lib/data/types";

import { ItemLink } from "./item-link";

/** The current focus, as a single ruled sheet of numbered statements. */
export function NowSheet({ items }: { items: Now["items"] }) {
  return (
    <ol className="divide-y divide-line border-y border-line bg-sheet">
      {items.map((item, index) => (
        <li
          key={item.text}
          className="grid grid-cols-[2.25rem_1fr] gap-x-3 px-4 py-5 sm:px-6"
        >
          <span
            aria-hidden
            className="pt-[0.15em] font-mono text-mono-xs text-ink-faint tabular-nums"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <p className="text-lg text-ink">{item.text}</p>
            {item.link && (
              <p className="mt-1.5 text-sm text-ink-soft">
                <ItemLink href={item.link} />
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
