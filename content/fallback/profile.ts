import type { Profile } from "@/lib/data/types";

import { richText } from "./rich-text";

export const profile: Profile = {
  name: "Hemant Rajput",
  headline: "Fullstack engineer crafting fast, pixel-perfect web experiences",
  bio: richText(
    "I'm a fullstack engineer who cares about web experiences that feel fast and look exactly as designed. Since 2024 I've led frontend work for remote teams in the US and UK, from payments to an on-chain game."
  ),
  avatar: null,
  location: "Mathura, India",
  email: "hello@rajputhemant.dev",
  links: [
    { label: "GitHub", url: "https://github.com/rajput-hemant" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/rajput-hemant" },
    { label: "Website", url: "https://rajputhemant.dev" },
    { label: "WhatsApp", url: "https://wa.me/919897679924" },
  ],
  // `resumeUrl` is left unset: the owner pastes the Google Drive share link
  // into the profile in Studio, and "Resume ↗" appears on home, /work and
  // /resume only once it exists.
};
