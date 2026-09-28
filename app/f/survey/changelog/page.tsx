import { permanentRedirect } from "next/navigation";

/** This edition keeps the log on /now as its revision notes. */
export default function ChangelogPage() {
  permanentRedirect("/now#log");
}
