import type { Now } from "@/lib/data/types";

/** One thing on press now, marked in P3 yellow, linked when it has somewhere to go. */
export function NowItem({ item }: { item: Now["items"][number] }) {
  return (
    <mark className="box-decoration-clone">
      {item.link ? (
        <a
          href={item.link}
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
