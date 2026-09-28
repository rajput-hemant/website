import type { ConfigExtension } from "cn/config";

/**
 * Teach tailwind-merge the custom type-scale tokens from app/globals.css;
 * otherwise `text-display` reads as a colour and `text-foreground` drops it.
 */
const config: ConfigExtension = {
  extend: {
    theme: { text: ["2xs", "display"] },
  },
};

export default config;
