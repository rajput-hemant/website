import type { ConfigExtension } from "cn/config";

/**
 * The edition's type scale, so tailwind-merge keeps `text-display` next to a
 * colour instead of reading it as one.
 */
const config: ConfigExtension = {
  extend: {
    theme: {
      text: [
        "label",
        "label-lg",
        "lead",
        "h3",
        "h2",
        "title",
        "display",
        "name",
      ],
    },
  },
};

export default config;
