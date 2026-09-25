/**
 * Viewer token. Needed for draft mode, and for every read when the dataset is
 * private (recommended, because question documents hold private fields).
 */
export const readToken = process.env.SANITY_API_READ_TOKEN || undefined;
