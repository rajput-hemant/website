import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Teach tailwind-merge the custom type-scale tokens from app/globals.css;
 * otherwise `text-display` reads as a colour and `text-foreground` drops it.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: { text: ["2xs", "display"] },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
