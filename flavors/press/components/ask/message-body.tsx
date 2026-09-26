import { cn } from "@/flavors/press/lib/utils";

/** A visitor's text as plain text only: line breaks kept, URLs never linked. */
export function MessageBody({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <p
      className={cn("[overflow-wrap:anywhere] whitespace-pre-line", className)}
    >
      {children}
    </p>
  );
}
