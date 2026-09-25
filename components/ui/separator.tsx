import { cn } from "@/lib/utils";

export type SeparatorProps = {
  orientation?: "horizontal" | "vertical";
  className?: string;
};

/** A hairline rule. The vertical form is decorative and hidden from assistive tech. */
export function Separator({
  orientation = "horizontal",
  className,
}: SeparatorProps) {
  if (orientation === "vertical") {
    return (
      <span
        aria-hidden
        className={cn("inline-block h-4 w-px shrink-0 bg-hairline", className)}
      />
    );
  }
  return <hr className={cn("border-0 border-t border-hairline", className)} />;
}
