import type { ConfigExtension } from "cn/config";

/**
 * Teach tailwind-merge the custom type-scale tokens from styles.css;
 * otherwise `text-display` reads as a colour and `text-foreground` drops it.
 */
const config: ConfigExtension = {
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
};

export default config;
