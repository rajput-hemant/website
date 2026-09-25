"use client";

import {
  createContext,
  use,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getOwnerSession } from "./api";

type OwnerState = {
  /** True once the session check has answered; owner-only UI waits for it. */
  ready: boolean;
  owner: boolean;
  setOwner: (owner: boolean) => void;
};

const OwnerContext = createContext<OwnerState>({
  ready: false,
  owner: false,
  setOwner: () => {},
});

/**
 * Asks `GET /api/owner/session` once after mount. The pages around it stay
 * static: owner mode exists only in the browser, after hydration.
 */
export function OwnerProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState({ ready: false, owner: false });

  useEffect(() => {
    let active = true;
    void getOwnerSession().then((result) => {
      if (active) setSession({ ready: true, owner: result.ok && result.owner });
    });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<OwnerState>(
    () => ({
      ...session,
      setOwner: (owner) => setSession({ ready: true, owner }),
    }),
    [session]
  );

  return <OwnerContext value={value}>{children}</OwnerContext>;
}

export function useOwner(): OwnerState {
  return use(OwnerContext);
}
