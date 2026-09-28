import { permanentRedirect } from "next/navigation";

/** This edition keeps the log on /now, as the rate log. */
export default function ChangelogPage() {
  permanentRedirect("/now#log");
}
