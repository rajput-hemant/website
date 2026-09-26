import type { Metadata } from "next";
import Link from "next/link";
import {
  DrawingFrame,
  Page,
  SceneSlot,
} from "@/flavors/drawing-set/components/site";
import { nav, sheetTotal } from "@/flavors/drawing-set/content";
import { cn } from "@/flavors/drawing-set/lib/utils";

export const metadata: Metadata = {
  title: "Sheet not found",
  robots: { index: false },
};

const linkClass =
  "inline-flex min-h-11 items-center gap-2 font-display text-sm leading-none font-semibold tracking-[0.09em] text-ink-soft uppercase [font-stretch:72%] transition-colors duration-200 fine:hover:text-accent";

/**
 * The global 404, outside the `(site)` group: just the frame, the empty
 * drawer and a way back to the register.
 */
export default function NotFound() {
  return (
    <>
      <DrawingFrame />
      <div className="m-(--frame-inset) md:pt-3.5 md:pl-3.5">
        <Page className="px-4 py-12 md:px-12">
          <p className="font-mono text-mono-xs tracking-[0.08em] text-ink-soft uppercase">
            Sheet -- / {sheetTotal} · <span className="text-accent">404</span>
          </p>
          <h1 className="mt-4 text-display tracking-[-0.018em] uppercase [font-stretch:62%]">
            Sheet not found in set
          </h1>
          <p className="mt-6 max-w-[48ch] text-lead text-ink-soft">
            This drawing was never issued, or it has been withdrawn. The
            register lists every sheet that exists.
          </p>
          <nav aria-label="Sheets" className="mt-8">
            <ul className="flex flex-wrap gap-x-8">
              <li>
                <Link href="/projects" className={cn(linkClass, "text-ink")}>
                  Open the register <span className="text-accent">→</span>
                </Link>
              </li>
              <li>
                <Link href="/" className={linkClass}>
                  <span className="font-mono text-[0.625rem]">00</span> Home
                </Link>
              </li>
              {nav.slice(1).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    <span className="font-mono text-[0.625rem]">
                      {item.sheet}
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <SceneSlot route="notfound" size="window" className="mt-12" />
        </Page>
      </div>
    </>
  );
}
