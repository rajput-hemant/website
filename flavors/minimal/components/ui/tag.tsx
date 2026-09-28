import * as React from "react";
import { cn } from "@/flavors/minimal/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const tagVariants = cva(
  "inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-2xs leading-4 whitespace-nowrap [font-variation-settings:'wdth'_87.5]",
  {
    variants: {
      variant: {
        default: "border-border bg-surface text-muted",
        accent: "border-transparent bg-accent-soft text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export type TagProps = React.ComponentProps<"span"> &
  VariantProps<typeof tagVariants>;

/** A small mono chip for stacks, tools and statuses. */
export function Tag({ className, variant, ...props }: TagProps) {
  return (
    <span className={cn(tagVariants({ variant }), className)} {...props} />
  );
}

/** Lays out a list of tags with consistent wrapping and gaps. */
export function TagList({
  tags,
  className,
  variant,
}: { tags: readonly string[]; className?: string } & VariantProps<
  typeof tagVariants
>) {
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map((tag) => (
        <li key={tag}>
          <Tag variant={variant}>{tag}</Tag>
        </li>
      ))}
    </ul>
  );
}
