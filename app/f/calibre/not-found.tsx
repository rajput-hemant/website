import type { Metadata } from "next";
import Link from "next/link";
import { Bezel } from "@/flavors/calibre/components/dial/bezel";
import { Page } from "@/flavors/calibre/components/site/page";
import { SceneSlot } from "@/flavors/calibre/components/site/scene-slot";
import { Container } from "@/flavors/calibre/components/ui/container";
import { pages } from "@/flavors/calibre/content";
import { bezelPrints, roman } from "@/flavors/calibre/lib/movement";
import { encodeBoard } from "@/flavors/calibre/lib/scene/poses";

import { getProfile, getProjects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Stopped",
  robots: { index: false },
};

/** A 404 as a stopped movement: the balance at rest and the index still, with every page listed. */
export default async function NotFound() {
  const [profile, projects] = await Promise.all([getProfile(), getProjects()]);
  return (
    <Page>
      <Container className="grid gap-x-12 gap-y-10 pt-[clamp(2rem,1rem+4vw,5rem)] lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <p className="spec">Stopped · 404</p>
          <h1 className="mt-5 text-display">
            The movement <em>stopped</em> here
          </h1>
          <p className="mt-6 max-w-[40ch] text-lead text-soft">
            There is no page at this address, so the balance is at rest. Every
            page of the movement is below.
          </p>
          <nav aria-label="Pages" className="mt-10">
            <ul className="grid border-t border-line-strong sm:grid-cols-2 sm:gap-x-6">
              {pages.map((entry) => (
                <li key={entry.href}>
                  <Link
                    href={entry.href}
                    className="flex min-h-12 items-center gap-3 border-b border-line text-lead font-medium transition-colors duration-(--duration-ui) fine:hover:text-steel"
                  >
                    <span aria-hidden className="w-10 numeral-italic text-soft">
                      {entry.hour !== null ? roman(entry.hour) : "·"}
                    </span>
                    {entry.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="lg:col-span-5">
          <Bezel
            prints={bezelPrints(projects.length, profile.location)}
            beat={false}
            className="mx-auto max-w-[28rem]"
          >
            <SceneSlot
              route="notfound"
              board={encodeBoard({ jewels: projects.length, lit: 0 })}
            />
          </Bezel>
        </div>
      </Container>
    </Page>
  );
}
