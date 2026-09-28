/*
 * Class names shared by the project filter and the static stand-in that
 * holds its place until the filter's code has loaded, so both lay out alike.
 */
export const barClass = "grid gap-4";

export const groupClass =
  "grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-3";

export const toggleGroupClass =
  "flex w-full gap-0.5 rounded-md border border-hairline bg-surface p-0.5 sm:w-auto sm:max-w-full sm:flex-wrap";

export const segmentClass =
  "h-7 rounded-[calc(var(--radius-md)-2px)] px-2.5 text-xs whitespace-nowrap text-muted transition-colors duration-(--duration-exit) hover:text-foreground focus-visible:outline-offset-0 data-pressed:bg-background data-pressed:text-foreground data-pressed:shadow-[0_0_0_1px_var(--color-border)]";

export const segmentFlexClass = "flex-1 sm:flex-none";

export const toolsClass = "flex items-center justify-between gap-4 sm:contents";

export const selectLabelClass = "relative inline-flex items-center";

export const selectClass =
  "h-8 max-w-[14rem] appearance-none rounded-md border border-hairline bg-surface py-0 pr-8 pl-2.5 text-xs transition-colors duration-(--duration-exit) hover:border-border focus-visible:outline-offset-0 pointer-coarse:h-10";

export const chevronClass =
  "pointer-events-none absolute right-2.5 size-3.5 text-subtle";

export const countClass = "meta text-subtle tabular-nums sm:ml-auto";
