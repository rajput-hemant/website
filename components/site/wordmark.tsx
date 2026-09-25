import { type CSSProperties } from "react";
import Link from "next/link";

import { site } from "@/content/site";
import { cn } from "@/lib/utils";

const letters = Array.from(site.name);

/**
 * The identity mark: the name in Fraunces with soft, wonky forms. Letters are
 * split so the once-per-session entrance (see globals.css) can stagger them.
 */
export function Wordmark({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn(
        "wordmark inline-flex items-baseline rounded-sm text-[1.3125rem] leading-none text-foreground",
        className
      )}
    >
      <span className="sr-only">{site.name}</span>
      <span aria-hidden>
        {letters.map((letter, index) => (
          <span
            key={index}
            className="wordmark-letter"
            style={{ "--i": index } as CSSProperties}
          >
            {letter}
          </span>
        ))}
        <span
          className="wordmark-letter text-accent"
          style={{ "--i": letters.length } as CSSProperties}
        >
          .
        </span>
      </span>
    </Link>
  );
}
