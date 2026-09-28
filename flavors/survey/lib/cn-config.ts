import type { ConfigExtension } from "cn/config";

/**
 * Teach tailwind-merge the custom type-scale tokens from styles.css;
 * otherwise `text-display` reads as a colour and `text-ink` drops it.
 */
const config: ConfigExtension = {
  extend: {
    theme: {
      text: ["caps", "lead", "h3", "h2", "statement", "title", "display"],
    },
  },
};

export default config;
