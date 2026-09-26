import * as React from "react";

import { cn } from "@/lib/utils";

/** A quiet document link; its text is usually the address itself, so print shows the URL directly. */
export function ResumeLink({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "underline decoration-line underline-offset-[0.2em] transition-colors fine:hover:text-ink fine:hover:decoration-accent",
        className
      )}
      {...props}
    />
  );
}
