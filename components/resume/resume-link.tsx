import * as React from "react";

import { cn } from "@/lib/utils";

/** A quiet document link; its text is usually the address itself, so print shows the URL directly. */
export function ResumeLink({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "underline decoration-rule underline-offset-[0.2em] transition-colors hover:text-paper hover:decoration-accent",
        className
      )}
      {...props}
    />
  );
}
