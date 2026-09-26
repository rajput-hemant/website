import type { Metadata } from "next";
import Link from "next/link";

import { nav } from "@/content/site";
import { Page, SceneSlot } from "@/components/site";

export const metadata: Metadata = {
  title: "Misfiled",
  robots: { index: false },
};

const linkClass =
  "text-sm text-paper underline decoration-hairline underline-offset-4 transition-colors duration-(--duration-ui) fine:hover:text-accent";

/**
 * The global 404: outside the `(site)` route group, so it renders with no
 * header, footer or dock, just the drawer illustration and a way back.
 */
export default function NotFound() {
  return (
    <Page>
      <SceneSlot route="notfound" size="window" />
      <div className="mx-auto max-w-[60ch] px-gutter py-section text-center">
        <span className="inline-flex items-center rounded-sm border border-hairline px-3 py-1 font-mono text-mono-xs tracking-[0.14em] text-lamp uppercase">
          404
        </span>
        <h1 className="mt-6 font-display text-3xl tracking-[-0.02em] text-paper">
          Misfiled
        </h1>
        <p className="mt-4 text-graphite">
          Whatever was in this drawer has been misfiled, or never existed. Try
          one of these instead.
        </p>
        <nav aria-label="Main pages" className="mt-8">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <li>
              <Link href="/" className={linkClass}>
                Home
              </Link>
            </li>
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </Page>
  );
}
