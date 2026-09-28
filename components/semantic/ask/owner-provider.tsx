"use client";

import * as React from "react";

import { getOwnerSession } from "@/lib/ask/client";

export type OwnerState = {
  /** True once the session check has answered; owner-only UI waits for it. */
  ready: boolean;
  owner: boolean;
  setOwner: (owner: boolean) => void;
};

const OwnerContext = React.createContext<OwnerState>({
  ready: false,
  owner: false,
  setOwner: () => {},
});

/**
 * Asks `GET /api/owner/session` once after mount. The pages around it stay
 * static: owner mode exists only in the browser, after hydration.
 */
export function OwnerProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState({ ready: false, owner: false });

  React.useEffect(() => {
    let active = true;
    void getOwnerSession().then((result) => {
      if (active) setSession({ ready: true, owner: result.ok && result.owner });
    });
    return () => {
      active = false;
    };
  }, []);

  const value = React.useMemo<OwnerState>(
    () => ({
      ...session,
      setOwner: (owner) => setSession({ ready: true, owner }),
    }),
    [session]
  );

  return <OwnerContext value={value}>{children}</OwnerContext>;
}

export function useOwner(): OwnerState {
  return React.use(OwnerContext);
}
