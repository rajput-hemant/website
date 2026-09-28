import { permanentRedirect } from "next/navigation";

/** This edition hangs the log on /now, under the drying line. */
export default function ChangelogPage() {
  permanentRedirect("/now#log");
}
