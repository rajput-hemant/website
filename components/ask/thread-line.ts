/**
 * The hairline that joins a thread's replies to its opening slip. Every item
 * draws an elbow into its row; all but the last also carry the vertical line
 * on down to the next item.
 */
export const threadListClass = "grid pl-8 sm:pl-11";

/** Just the elbow, for rows whose vertical line an enclosing item already draws. */
export const threadElbowClass =
  "relative min-w-0 pt-5 after:absolute after:top-0 after:-left-5 after:h-8 after:w-3 after:rounded-bl-lg after:border-b after:border-l after:border-rule sm:after:-left-7 sm:after:w-4";

export const threadItemClass = `${threadElbowClass} before:absolute before:inset-y-0 before:-left-5 before:w-px before:bg-rule last:before:hidden sm:before:-left-7`;
