import { cn } from "@/flavors/survey/lib/utils";

/**
 * A visitor's text as plain text only: line breaks kept, URLs never linked,
 * so a published message can never carry a live link.
 */
export function MessageBody({
  as: Tag = "p",
  children,
  className,
}: {
  as?: "p" | "span";
  children: string;
  className?: string;
}) {
  return (
    <Tag
      className={cn("[overflow-wrap:anywhere] whitespace-pre-line", className)}
    >
      {children}
    </Tag>
  );
}
