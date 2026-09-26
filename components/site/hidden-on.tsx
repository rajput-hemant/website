"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/** Renders its (server-rendered) children everywhere except on one path. */
export function HiddenOn({
  path,
  children,
}: {
  path: string;
  children: React.ReactNode;
}) {
  return usePathname() === path ? null : children;
}
