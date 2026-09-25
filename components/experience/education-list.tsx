import type { Education } from "@/lib/data/types";
import { cn } from "@/lib/utils";

import { metaSeparators } from "./meta-list";

export function EducationList({ items }: { items: Education[] }) {
  return (
    <ol className="grid gap-6">
      {items.map((item) => (
        <li key={item.id} className="grid gap-1 border-t border-border pt-5">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-medium text-foreground">{item.institution}</h3>
            <p className="shrink-0 font-mono text-2xs tracking-wide text-subtle tabular-nums [font-variation-settings:'wdth'_87.5]">
              {item.startYear !== undefined && (
                <>
                  <time dateTime={String(item.startYear)}>
                    {item.startYear}
                  </time>
                  {" – "}
                </>
              )}
              <time dateTime={String(item.endYear)}>{item.endYear}</time>
            </p>
          </div>
          <p className="leading-snug text-muted">{item.degree}</p>
          <dl
            className={cn(
              "mt-1 flex flex-wrap gap-y-1 meta text-subtle",
              metaSeparators
            )}
          >
            {item.score && (
              <div className="inline">
                <dt className="sr-only">Score</dt>
                <dd className="inline">{item.score}</dd>
              </div>
            )}
            <div className="inline">
              <dt className="sr-only">Location</dt>
              <dd className="inline">{item.location}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ol>
  );
}
