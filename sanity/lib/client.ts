import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

/** Published content only, from the CDN. Tokens are added per request on the server. */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  stega: false,
});
