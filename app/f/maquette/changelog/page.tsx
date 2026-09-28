import { permanentRedirect } from "next/navigation";

/** This edition files the log on /now, under the current revision. */
export default function ChangelogPage() {
  permanentRedirect("/now#log");
}
