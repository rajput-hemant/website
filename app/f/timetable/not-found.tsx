import type { Metadata } from "next";
import Link from "next/link";
import { PlatformPlate } from "@/flavors/timetable/components/site/nav-links";
import { Page } from "@/flavors/timetable/components/site/page";
import { SceneSlot } from "@/flavors/timetable/components/site/scene-slot";
import { Container } from "@/flavors/timetable/components/ui";
import { platforms } from "@/flavors/timetable/content";

export const metadata: Metadata = {
  title: "Not in service",
  robots: { index: false },
};

/** A 404 as a platform with no service: the board says so, the list says where to go. */
export default function NotFound() {
  return (
    <Page>
      <Container className="grid gap-x-6 gap-y-10 pt-[clamp(2.5rem,1rem+4vw,5rem)] lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6">
          <p className="font-mono text-mono-sm font-bold tracking-[0.08em] text-ink-soft uppercase">
            Platform -- / 404
          </p>
          <h1 className="mt-5 text-display font-extrabold tracking-[-0.035em]">
            This service does not run
          </h1>
          <p className="mt-6 max-w-[40ch] text-statement font-medium text-ink-soft">
            There is no page at this address. Every platform that exists is
            listed below.
          </p>
          <nav aria-label="Platforms" className="mt-10">
            <ul className="grid border-t border-rule sm:grid-cols-2">
              {platforms.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-12 items-center gap-3 border-b border-rule text-lead font-bold fine:hover:bg-surface"
                  >
                    <PlatformPlate n={item.platform} className="text-ink" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mx-auto w-full max-w-lg lg:col-span-6 lg:max-w-none">
          <SceneSlot route="notfound" size="hero" />
        </div>
      </Container>
    </Page>
  );
}
