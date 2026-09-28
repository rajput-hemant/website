"use client";

import * as React from "react";

import type { SiteIdentity } from "@/lib/data/identity";

// No default: deriving one would ship the resolver to every client bundle.
const SiteIdentityContext = React.createContext<SiteIdentity | null>(null);

/**
 * Hands the layout's resolved identity (`getSiteIdentity()`) to client code,
 * so nothing on the client fetches or hard-codes who the site is about.
 */
export function SiteIdentityProvider({
  identity,
  children,
}: {
  identity: SiteIdentity;
  children: React.ReactNode;
}) {
  return <SiteIdentityContext value={identity}>{children}</SiteIdentityContext>;
}

export function useSiteIdentity(): SiteIdentity {
  const identity = React.use(SiteIdentityContext);
  if (!identity) {
    throw new Error("useSiteIdentity needs a SiteIdentityProvider above it");
  }
  return identity;
}

type TextField = Exclude<keyof SiteIdentity, "url" | "locale">;

/**
 * One identity field as text, for components that render on both the server
 * and the client (a server component can't read context, this leaf can).
 */
export function SiteIdentityText({
  field,
  upper = false,
}: {
  field: TextField;
  /** Set in capitals, e.g. a handle on a sign plate. */
  upper?: boolean;
}) {
  const value = useSiteIdentity()[field];
  return upper ? value.toLocaleUpperCase() : value;
}
