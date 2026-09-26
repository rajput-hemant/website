import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

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

export { route } from "@/lib/route";
