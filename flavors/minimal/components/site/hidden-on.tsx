"use client";

import * as React from "react";

import { usePublicPathname } from "@/lib/public-pathname";

/** Renders its (server-rendered) children everywhere except on one path. */
export function HiddenOn({
  path,
  children,
}: {
  path: string;
  children: React.ReactNode;
}) {
  return usePublicPathname() === path ? null : children;
}
