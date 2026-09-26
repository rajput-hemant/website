import { updateCategoryLabels } from "@/lib/data/labels";
import type { UpdateCategory } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export function CategoryFilter({
  categories,
  active,
  onChange,
}: {
  categories: UpdateCategory[];
  active: UpdateCategory | null;
  onChange: (category: UpdateCategory | null) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filter the log by category"
      className="flex flex-wrap gap-2"
    >
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-pressed={active === null}
        className={cn(
          "rounded-sm border px-2 py-1 font-mono text-mono-xs tracking-[0.14em] uppercase transition-colors duration-(--duration-ui)",
          active === null
            ? "border-accent text-accent"
            : "border-hairline text-graphite hover:text-paper"
        )}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(active === category ? null : category)}
          aria-pressed={active === category}
          className={cn(
            "rounded-sm border px-2 py-1 font-mono text-mono-xs tracking-[0.14em] uppercase transition-colors duration-(--duration-ui)",
            active === category
              ? "border-accent text-accent"
              : "border-hairline text-graphite hover:text-paper"
          )}
        >
          {updateCategoryLabels[category]}
        </button>
      ))}
    </div>
  );
}
