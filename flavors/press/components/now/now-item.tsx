import type { Now } from "@/lib/data/types";
import { hrefProps } from "@/lib/safe-href";

/** One thing on press now, marked in P3 yellow, linked when it has somewhere to go. */
export function NowItem({ item }: { item: Now["items"][number] }) {
  return (
    <mark className="box-decoration-clone">
      {item.link ? (
        <a
          {...hrefProps(item.link)}
          className="underline decoration-pink decoration-2 underline-offset-[0.22em] fine:hover:decoration-blue"
        >
          {item.text}
        </a>
      ) : (
        item.text
      )}
    </mark>
  );
}
