import * as React from "react";

import styles from "./headline.module.css";

export type HeadlineProps = {
  /** The line on screen. */
  text: string;
  /** Read before the line by assistive tech and search, e.g. the owner's name. */
  prefix?: string;
  className?: string;
};

/**
 * The home page's h1, split into words on the server so each can rise on the
 * first load (see headline.module.css). The words are hidden from assistive
 * tech, which reads one unbroken, visually hidden copy instead.
 */
export function Headline({ text, prefix, className }: HeadlineProps) {
  const words = text.trim().split(/\s+/);
  const label = prefix ? `${prefix}: ${text}` : text;

  return (
    <h1 className={className}>
      <span className="sr-only">{label}</span>
      <span aria-hidden>
        {words.map((word, index) => (
          <React.Fragment key={`${index}-${word}`}>
            {index > 0 && " "}
            <span
              className={styles.word}
              data-motion-safe
              style={{ "--word-index": index } as React.CSSProperties}
            >
              {word}
            </span>
          </React.Fragment>
        ))}
      </span>
    </h1>
  );
}
