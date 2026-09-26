import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Teach tailwind-merge the custom type-scale tokens from styles.css;
 * otherwise `text-display` reads as a colour and `text-ink` drops it.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["caps", "lead", "h3", "h2", "statement", "display"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
