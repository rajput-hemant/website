import type { ConfigExtension } from "cn/config";

/**
 * Teach tailwind-merge this edition's type-scale tokens from styles.css;
 * otherwise `text-display` reads as a colour and a later colour drops it.
 */
const config: ConfigExtension = {
  extend: {
    theme: {
      text: ["legend", "lead", "h3", "h2", "display"],
    },
  },
};

export default config;
