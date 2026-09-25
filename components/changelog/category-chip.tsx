import { type UpdateCategory } from "@/lib/data/types";
import { cn } from "@/lib/utils";

// One accent and the neutral tokens, varied by fill and border rather than hue.
const categoryClass: Record<UpdateCategory, string> = {
  project: "border-transparent bg-accent-soft text-foreground",
  work: "border-border bg-surface-2 text-foreground",
  site: "border-accent/45 text-foreground",
  learning: "border-dashed border-subtle/60 text-muted",
  life: "border-border text-subtle",
};

export function CategoryChip({ category }: { category: UpdateCategory }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-px meta leading-4",
        categoryClass[category]
      )}
    >
      {category}
    </span>
  );
}
