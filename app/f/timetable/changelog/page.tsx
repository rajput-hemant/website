import { permanentRedirect } from "next/navigation";

/** This edition posts the log on /now as its service updates. */
export default function ChangelogPage() {
  permanentRedirect("/now#log");
}
