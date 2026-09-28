import type { Now } from "@/lib/data/types";
import { hrefProps } from "@/lib/safe-href";

/** One thing on the loom now, linked when it has somewhere to go. */
export function NowItem({ item }: { item: Now["items"][number] }) {
  return item.link ? (
    <a {...hrefProps(item.link)} className="thread-link">
      {item.text}
    </a>
  ) : (
    item.text
  );
}
