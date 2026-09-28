/**
 * The patch cable that joins a thread's replies to its opening message. Every
 * item draws an elbow into its row; all but the last also carry the vertical
 * run on down to the next item.
 */
export const threadListClass = "grid pl-8 sm:pl-11";

/** Just the elbow, for rows whose vertical run an enclosing item already draws. */
export const threadElbowClass =
  "relative min-w-0 pt-5 after:absolute after:top-0 after:-left-5 after:h-8 after:w-3 after:rounded-bl-md after:border-b after:border-l after:border-ink-3 sm:after:-left-7 sm:after:w-4";

export const threadItemClass = `${threadElbowClass} before:absolute before:inset-y-0 before:-left-5 before:w-px before:bg-ink-3 last:before:hidden sm:before:-left-7`;
