/**
 * Viewer token. Needed for draft mode, and for every read when the dataset is
 * private (recommended, because question documents hold private fields).
 */
import { serverEnv } from "@/lib/env.server";

export const readToken = serverEnv.SANITY_API_READ_TOKEN || undefined;
