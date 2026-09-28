import { clsx, type ClassValue } from "cn";
import { extendTailwindMerge } from "cn/config";

/** Teach tailwind-merge the edition's type scale, or it drops `text-display` next to a colour. */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["slug", "slug-lg", "lead", "h3", "h2", "title", "display", "name"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
