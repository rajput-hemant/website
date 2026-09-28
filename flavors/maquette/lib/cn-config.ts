import type { ConfigExtension } from "cn/config";

/** Teach tailwind-merge the edition's type scale, or it drops `text-display` next to a colour. */
const config: ConfigExtension = {
  extend: {
    theme: {
      text: ["caps", "num", "lead", "h3", "h2", "title", "display", "name"],
    },
  },
};

export default config;
