import type { SearchIndex } from "./types";

let indexRequest: Promise<SearchIndex> | null = null;
let ownerRequest: Promise<boolean> | null = null;

/** One fetch per page load; a failure clears it so the next open retries. */
export function loadSearchIndex(): Promise<SearchIndex> {
  indexRequest ??= fetch("/search.json")
    .then(async (response) => {
      if (!response.ok) {
        // Release the unread body, or Chromium keeps the request open.
        await response.body?.cancel();
        throw new Error(`search.json: ${response.status}`);
      }
      return response.json() as Promise<SearchIndex>;
    })
    .catch((error: unknown) => {
      indexRequest = null;
      throw error;
    });
  return indexRequest;
}

/** Whether this browser holds an owner session. One fetch per page load; failures read as no. */
export function loadOwnerSession(): Promise<boolean> {
  ownerRequest ??= fetch("/api/owner/session")
    .then(async (response) => {
      if (!response.ok) {
        await response.body?.cancel();
        return false;
      }
      const data: unknown = await response.json();
      return (
        typeof data === "object" &&
        data !== null &&
        "owner" in data &&
        data.owner === true
      );
    })
    .catch(() => false);
  return ownerRequest;
}

/** Test hook: forget cached requests. */
export function resetCommandRequests() {
  indexRequest = null;
  ownerRequest = null;
}
