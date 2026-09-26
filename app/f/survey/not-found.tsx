import type { Metadata } from "next";
import Link from "next/link";
import { SceneSlot } from "@/flavors/survey/components/scene/scene-slot";
import { Page } from "@/flavors/survey/components/site/page";
import { Container } from "@/flavors/survey/components/ui/container";
import { places } from "@/flavors/survey/content";
import { getRelief } from "@/flavors/survey/lib/sheet";

export const metadata: Metadata = {
  title: "Unsurveyed",
  robots: { index: false },
};

/** A 404 as the sea past the coast: nothing has been surveyed here yet. */
export default async function NotFound() {
  const relief = await getRelief();
  return (
    <Page>
      <Container className="grid gap-x-12 gap-y-10 pt-[clamp(2.5rem,1rem+4vw,5rem)] lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6">
          <p className="caps text-ink-faint">Grid -- -- · 404</p>
          <h1 className="spaced mt-5 text-display tracking-[0.2em]">
            Unsurveyed
          </h1>
          <p className="mt-6 max-w-[40ch] font-serif text-statement text-ink-soft italic">
            There is no page at this address; the map ends at the coast. Every
            surveyed page is listed below.
          </p>
          <nav aria-label="Surveyed pages" className="mt-10">
            <ul className="grid border-t border-rule sm:grid-cols-2">
              {places.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-12 items-baseline justify-between gap-3 border-b border-rule py-3 fine:hover:text-water"
                  >
                    <span className="font-display text-lead">{item.label}</span>
                    <span className="caps text-ink-faint">{item.sheet}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <SceneSlot
          relief={relief}
          route="notfound"
          className="mx-auto w-full max-w-lg lg:col-span-6 lg:max-w-none"
        />
      </Container>
    </Page>
  );
}
