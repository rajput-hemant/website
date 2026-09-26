import { permanentRedirect } from "next/navigation";

import { route } from "@/lib/route";

/** This edition prints the log on /now, under the latest proof. */
export default function ChangelogPage() {
  permanentRedirect(route("/now#log"));
}
