import { permanentRedirect } from "next/navigation";

/** This edition keeps bio, skills and education on /work. */
export default function AboutPage() {
  permanentRedirect("/work");
}
