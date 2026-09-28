import * as React from "react";
import { cn } from "@/flavors/surface/lib/utils";

/** A quiet document link; its text is usually the address itself, so print shows the URL directly. */
export function ResumeLink({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "underline decoration-black/25 underline-offset-[0.2em] transition-[text-decoration-color] duration-150 fine:hover:decoration-black",
        className
      )}
      {...props}
    />
  );
}
