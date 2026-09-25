import { createClient, type SanityClient } from "next-sanity";

import { env, isSanityConfigured } from "@/lib/env";

import { visitsConfig } from "./config";

/** The reads and writes behind `/api/visits`. Faked in tests. */
export type VisitStore = {
  read(): Promise<number>;
  /** Atomically adds one visitor and returns the new total. */
  increment(at: string): Promise<number>;
};

type SiteStats = { _id: string; visitors?: number };

const visitorsQuery = `*[_id == $id][0].visitors`;

/** Server-only secret, read where it is used. */
function readWriteToken(): string {
  return process.env.SANITY_API_WRITE_TOKEN ?? "";
}

export function createSanityVisitStore(client: SanityClient): VisitStore {
  const id = visitsConfig.documentId;

  return {
    async read() {
      const visitors = await client.fetch<number | null>(
        visitorsQuery,
        { id },
        { cache: "no-store" }
      );
      return visitors ?? 0;
    },

    async increment(at) {
      // A patch on a missing document fails, so the first visit creates it in
      // the same transaction; later visits make `createIfNotExists` a no-op.
      const documents = await client
        .transaction()
        .createIfNotExists({ _id: id, _type: "siteStats", visitors: 0 })
        .patch(id, (patch) =>
          patch
            .setIfMissing({ visitors: 0 })
            .inc({ visitors: 1 })
            .set({ updatedAt: at })
        )
        .commit<SiteStats>({ returnDocuments: true });
      return documents.findLast((doc) => doc._id === id)?.visitors ?? 0;
    },
  };
}

let store: VisitStore | null | undefined;

/** Null without a Sanity project and an Editor token: the counter hides itself. */
export function getVisitStore(): VisitStore | null {
  if (store !== undefined) return store;
  const token = readWriteToken();
  store =
    isSanityConfigured && token
      ? createSanityVisitStore(
          createClient({
            projectId: env.sanity.projectId,
            dataset: env.sanity.dataset,
            apiVersion: env.sanity.apiVersion,
            token,
            useCdn: false,
            perspective: "published",
          })
        )
      : null;
  return store;
}
