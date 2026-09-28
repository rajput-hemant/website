import type * as React from "react";
import type { ClassValue } from "cn";
import { createCn } from "cn/engine";

import tables from "./cn-tables";

/**
 * tailwind-merge with this edition's type scale (./cn-config.ts), compiled
 * ahead of time by `bun run cn:tables` so the browser skips cn's runtime
 * config compiler.
 */
const merge = createCn(tables);

export function cn(...inputs: ClassValue[]) {
  return merge(...inputs);
}

export type CssVars = React.CSSProperties & { [name: `--${string}`]: string };

/** Custom properties for a `style` prop, typed without a cast. */
export const cssVars = (vars: { [name: `--${string}`]: string }): CssVars =>
  vars;
