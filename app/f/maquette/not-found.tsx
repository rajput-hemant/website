import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/flavors/maquette/components/site/page";
import { SceneSlot } from "@/flavors/maquette/components/site/scene-slot";
import { Container } from "@/flavors/maquette/components/ui/container";
import { pages } from "@/flavors/maquette/content";

export const metadata: Metadata = {
  title: "Site cleared",
  robots: { index: false },
};

/** A 404 as a cleared site: nothing stands here, but every room is listed. */
export default function NotFound() {
  return (
    <Page>
      <Container className="grid gap-x-10 gap-y-10 pt-[clamp(2rem,1rem+4vw,5rem)] lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6">
          <p className="caps">Site cleared · 404</p>
          <h1 className="mt-5 text-display tracking-[-0.035em]">
            Nothing stands on this plot
          </h1>
          <p className="mt-6 max-w-[40ch] text-lead text-soft">
            There is no page at this address; the plinth is bare. Every room in
            the model is below.
          </p>
          <nav aria-label="Pages" className="mt-10">
            <ul className="grid border-t border-line sm:grid-cols-2 sm:gap-x-6">
              {pages.map((entry) => (
                <li key={entry.href}>
                  <Link
                    href={entry.href}
                    className="flex min-h-12 items-center gap-3 border-b border-line font-display text-lead transition-colors duration-(--duration-ui) fine:hover:text-cut"
                  >
                    <span className="w-8 num">{entry.key.toUpperCase()}</span>
                    {entry.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <SceneSlot
          route="notfound"
          board="|"
          className="w-full lg:col-span-6"
        />
      </Container>
    </Page>
  );
}
