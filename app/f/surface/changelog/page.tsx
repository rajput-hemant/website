import { permanentRedirect } from "next/navigation";

/** This edition keeps the log on /now, as its dot-matrix printout. */
export default function ChangelogPage() {
  permanentRedirect("/now#log");
}
