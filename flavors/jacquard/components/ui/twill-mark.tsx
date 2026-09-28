import { cn } from "@/flavors/jacquard/lib/utils";

/** The mark: a 4 by 4 twill repeat, the smallest cloth that shows the step. */
export function TwillMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 4 4"
      aria-hidden
      focusable="false"
      className={cn("shrink-0", className)}
    >
      <path
        fill="currentColor"
        d="M0 0h1v1H0zM2 0h1v1H2zM1 1h1v1H1zM3 1h1v1H3zM0 2h1v1H0zM2 2h1v1H2zM1 3h1v1H1zM3 3h1v1H3z"
      />
    </svg>
  );
}
