import { env, isSanityConfigured } from "../lib/env";

/** Sanity rejects an empty project id, so the Studio and clients get a placeholder that is never queried. */
export const projectId = env.sanity.projectId || "missing";
export const dataset = env.sanity.dataset;
export const apiVersion = env.sanity.apiVersion;
export const studioBasePath = "/studio";

export { isSanityConfigured };
