import type { Now } from "@/lib/data/types";

/** One line of the status report, linked when it has somewhere to go. */
export function NowItem({ item }: { item: Now["items"][number] }) {
  return item.link ? (
    <a href={item.link} className="rule-link">
      {item.text}
    </a>
  ) : (
    item.text
  );
}
