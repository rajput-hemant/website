import { ChevronRight } from "lucide-react";

import { type RichText as RichTextValue } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { RichText } from "@/components/portable-text";

import styles from "./project-details.module.css";

/** The long description behind a native, keyboard-operable disclosure. */
export function ProjectDetails({
  description,
  className,
}: {
  description: RichTextValue;
  className?: string;
}) {
  if (description.length === 0) return null;

  return (
    <details className={cn("group", styles.details, className)}>
      <summary className="-mx-1 inline-flex cursor-pointer list-none items-center gap-1 rounded-sm px-1 py-0.5 meta text-muted transition-colors select-none hover:text-foreground [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden
          strokeWidth={2}
          className="size-3 transition-transform duration-300 ease-snappy group-open:rotate-90"
        />
        <span className="group-open:hidden">Read more</span>
        <span className="hidden group-open:inline">Show less</span>
      </summary>
      <RichText
        value={description}
        className="mt-4 border-l border-border pl-4 text-[0.9375rem] text-muted [&_strong]:text-foreground"
      />
    </details>
  );
}
