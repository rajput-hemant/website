import { type Now } from "@/lib/data/types";
import { UrlLink } from "@/components/ui/url-link";

/** The current focus, as numbered statements with an optional link each. */
export function NowList({ items }: { items: Now["items"] }) {
  return (
    <ol className="stagger border-t border-hairline">
      {items.map((item, index) => (
        <li
          key={item.text}
          className="grid grid-cols-[2.25rem_1fr] gap-x-3 border-b border-hairline py-5 sm:grid-cols-[3rem_1fr] sm:py-6"
        >
          <span
            aria-hidden
            className="pt-[0.45rem] meta text-subtle tabular-nums"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <p className="text-lg text-foreground">{item.text}</p>
            {item.link && (
              <p className="mt-1.5 text-sm text-muted">
                <UrlLink href={item.link} />
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
