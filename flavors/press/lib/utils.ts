import type { Route } from "next";
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

/** A public path as a typed route; the proxy serves it from this edition's tree. */
export const route = (path: string) => path as Route;
