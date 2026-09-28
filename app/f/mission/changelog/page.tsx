import { permanentRedirect } from "next/navigation";

/** This edition keeps the log on /now, as the mission log. */
export default function ChangelogPage() {
  permanentRedirect("/now#log");
}
