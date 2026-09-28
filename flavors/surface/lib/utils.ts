import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Teach tailwind-merge this edition's type-scale tokens from styles.css;
 * otherwise `text-display` reads as a colour and a later colour drops it.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["legend", "lead", "h3", "h2", "display"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
