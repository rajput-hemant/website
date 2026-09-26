import type { Update } from "@/lib/data/types";

/** A changelog entry with its revision number attached (newest entry is the highest). */
export type RevisionEntry = Update & { rev: number };
