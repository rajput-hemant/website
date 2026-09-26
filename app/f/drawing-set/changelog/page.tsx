import { permanentRedirect } from "next/navigation";

/** This edition keeps the log on /now as its revision table. */
export default function ChangelogPage() {
  permanentRedirect("/now#log");
}
