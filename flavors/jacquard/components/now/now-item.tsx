import type { Now } from "@/lib/data/types";

/** One thing on the loom now, linked when it has somewhere to go. */
export function NowItem({ item }: { item: Now["items"][number] }) {
  return item.link ? (
    <a href={item.link} className="thread-link">
      {item.text}
    </a>
  ) : (
    item.text
  );
}
