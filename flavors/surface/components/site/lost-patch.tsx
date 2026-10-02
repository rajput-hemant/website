"use client";

import { useRouter } from "next/navigation";
import { PatchBay } from "@/flavors/surface/components/instruments/patch";

type Route = { href: string; label: string };

/**
 * The 404's unplugged cable: drag the plug into a socket to route to that
 * channel; let go anywhere else and it swings back. The channel keys below
 * are the keyboard way.
 */
export function LostPatch({
  routes,
  className,
}: {
  routes: readonly Route[];
  className?: string | undefined;
}) {
  const router = useRouter();
  return (
    <PatchBay
      name="lost"
      sockets={routes.map((route) => route.label)}
      onPlug={(socket) => {
        const route = routes[socket];
        if (route) router.push(route.href);
      }}
      {...(className !== undefined && { className })}
    />
  );
}
