"use client";

import {
  PageHeader,
  type PageHeaderProps,
} from "@/flavors/timetable/components/ui/page-header";
import { OWNER_ON_BOARD } from "@/flavors/timetable/lib/board";

import { useOwner } from "@/components/semantic/ask/owner-provider";

/**
 * The /owner platform sign. Its indicator reads the sign-in state, so the
 * desk padlock beside it opens once the owner is on duty.
 */
export function OwnerHeader(props: Omit<PageHeaderProps, "scene" | "board">) {
  const { ready, owner } = useOwner();
  return (
    <PageHeader
      {...props}
      scene="owner"
      board={ready && owner ? OWNER_ON_BOARD : "Staff only|Information desk"}
    />
  );
}
