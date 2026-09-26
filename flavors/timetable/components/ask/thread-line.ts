/**
 * The line that joins a notice's replies to its question, drawn like a
 * branch line leaving the main line. Every item draws a curve into its row;
 * all but the last also carry the line on down to the next item.
 */
export const threadListClass = "grid pl-8 sm:pl-11";

/** Just the curve, for rows whose vertical line an enclosing item already draws. */
export const threadElbowClass =
  "relative min-w-0 pt-5 after:absolute after:top-0 after:-left-5 after:h-8 after:w-3.5 after:rounded-bl-xl after:border-b-[3px] after:border-l-[3px] after:border-ink-faint sm:after:-left-7 sm:after:w-5";

export const threadItemClass = `${threadElbowClass} before:absolute before:inset-y-0 before:-left-5 before:w-[3px] before:bg-ink-faint last:before:hidden sm:before:-left-7`;
