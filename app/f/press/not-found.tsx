import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/flavors/press/components/site/page";
import { SceneSlot } from "@/flavors/press/components/site/scene-slot";
import { Container } from "@/flavors/press/components/ui/container";
import { Overprint } from "@/flavors/press/components/ui/overprint";
import { sheets } from "@/flavors/press/content";
import { pad2 } from "@/flavors/press/lib/proof";

export const metadata: Metadata = {
  title: "Spoiled sheet",
  robots: { index: false },
};

/** A 404 as a spoiled sheet, printed far out of register, with every sheet in the set listed. */
export default function NotFound() {
  return (
    <Page>
      <Container className="grid gap-x-6 gap-y-10 pt-[clamp(2rem,1rem+4vw,5rem)] lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6">
          <p className="slug">Spoiled sheet &nbsp;/&nbsp; 404</p>
          <Overprint
            as="h1"
            className="mt-5 pb-[0.08em] text-display [--mis:5]"
          >
            This sheet was never printed
          </Overprint>
          <p className="mt-6 max-w-[40ch] text-lead text-ink-soft">
            There is no page at this address. Every sheet in the set is below.
          </p>
          <nav aria-label="Sheets" className="mt-10">
            <ul className="grid border-t-2 border-ink sm:grid-cols-2 sm:gap-x-6">
              {sheets.map((sheet) => (
                <li key={sheet.href}>
                  <Link
                    href={sheet.href}
                    className="flex min-h-12 items-center gap-3 border-b border-rule text-lead font-bold fine:hover:bg-sheet"
                  >
                    <span className="w-6 slug">{pad2(sheet.n)}</span>
                    {sheet.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <SceneSlot
          route="notfound"
          className="mx-auto w-full max-w-lg lg:col-span-6 lg:max-w-none"
        />
      </Container>
    </Page>
  );
}
