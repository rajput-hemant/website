import { permanentRedirect } from "next/navigation";

/** This edition prints the log on /now, under the latest proof. */
export default function ChangelogPage() {
  permanentRedirect("/now#log");
}
