import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/flavors/jacquard/components/site/page";
import { SceneSlot } from "@/flavors/jacquard/components/site/scene-slot";
import { Container } from "@/flavors/jacquard/components/ui/container";
import { cards } from "@/flavors/jacquard/content";
import { draftWeave } from "@/flavors/jacquard/lib/scene/poses";
import { buildDraft, pad2 } from "@/flavors/jacquard/lib/weave";

import { getProjects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Broken end",
  robots: { index: false },
};

/** A 404 as a broken end: one warp thread snapped and hanging, with every card in the chain listed. */
export default async function NotFound() {
  const draft = buildDraft(await getProjects());
  return (
    <Page>
      <Container className="grid gap-x-14 gap-y-10 pt-[clamp(2rem,1rem+4vw,5rem)] lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:items-center">
        <div className="min-w-0">
          <p className="label">Broken end · 404</p>
          <h1 className="mt-6 text-display">This end was never threaded</h1>
          <p className="mt-7 max-w-[40ch] text-lead font-medium text-ink-soft">
            There is no page at this address. Every card in the chain is below.
          </p>
          <nav aria-label="Cards" className="mt-10">
            <ul className="grid border-t border-rule-strong sm:grid-cols-2 sm:gap-x-8">
              {cards.map((card) => (
                <li key={card.href}>
                  <Link
                    href={card.href}
                    className="flex min-h-12 items-center gap-4 border-b border-rule text-lg transition-colors duration-(--duration-ui) ease-out fine:hover:text-madder"
                  >
                    <span className="w-7 label">{pad2(card.n)}</span>
                    {card.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <SceneSlot
          route="notfound"
          weave={draftWeave(draft)}
          caption="One end snapped, hanging where the page should be."
          className="mx-auto w-full max-w-[20rem] lg:max-w-none"
        />
      </Container>
    </Page>
  );
}
