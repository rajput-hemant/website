import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/flavors/darkroom/components/site/page";
import { SceneSlot } from "@/flavors/darkroom/components/site/scene-slot";
import { Container } from "@/flavors/darkroom/components/ui/container";
import { pages } from "@/flavors/darkroom/content";

export const metadata: Metadata = {
  title: "Fogged frame",
  robots: { index: false },
};

/** A 404 as a frame fogged in the box: nothing came up, but every page on the roll is listed. */
export default function NotFound() {
  return (
    <Page>
      <Container className="grid gap-x-10 gap-y-10 pt-[clamp(2rem,1rem+4vw,5rem)] lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6">
          <p className="edge">Fogged frame / 404</p>
          <h1 className="mt-5 text-display">Nothing came up on this frame</h1>
          <p className="mt-6 max-w-[40ch] text-lead text-soft">
            There is no page at this address; light got into the box. Every page
            on the roll is below.
          </p>
          <nav aria-label="Pages" className="mt-10">
            <ul className="grid border-t border-line-strong sm:grid-cols-2 sm:gap-x-6">
              {pages.map((entry) => (
                <li key={entry.href}>
                  <Link
                    href={entry.href}
                    className="flex min-h-12 items-center gap-3 border-b border-line text-lead font-semibold transition-colors duration-(--duration-ui) fine:hover:text-grease"
                  >
                    <span className="w-8 edge">▸{entry.key.toUpperCase()}</span>
                    {entry.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <SceneSlot route="notfound" className="w-full lg:col-span-6" />
      </Container>
    </Page>
  );
}
