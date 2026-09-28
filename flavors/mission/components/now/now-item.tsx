import type { Now } from "@/lib/data/types";
import { hrefProps } from "@/lib/safe-href";

/** One line of the status report, linked when it has somewhere to go. */
export function NowItem({ item }: { item: Now["items"][number] }) {
  return item.link ? (
    <a {...hrefProps(item.link)} className="rule-link">
      {item.text}
    </a>
  ) : (
    item.text
  );
}
