import { notFound } from "next/navigation";

/** Any path the proxy sends here that this edition doesn't have: its own 404. */
export default function MissingPage() {
  notFound();
}
