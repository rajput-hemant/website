import { clsx, type ClassValue } from "cn";
import { extendTailwindMerge } from "cn/config";

/**
 * Teach tailwind-merge the custom type-scale tokens from styles.css;
 * otherwise `text-display` reads as a colour and `text-foreground` drops it.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "mono-xs",
        "mono-sm",
        "mono",
        "lead",
        "h3",
        "h2",
        "statement",
        "display",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
