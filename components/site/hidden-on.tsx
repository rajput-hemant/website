"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Renders its (server-rendered) children everywhere except on one path. */
export function HiddenOn({
  path,
  children,
}: {
  path: string;
  children: ReactNode;
}) {
  return usePathname() === path ? null : children;
}
