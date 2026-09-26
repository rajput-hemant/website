import type { Metadata } from "next";
import { Page } from "@/flavors/surface/components/site/page";
import {
  KeyLink,
  Legend,
  LegendRow,
} from "@/flavors/surface/components/ui/primitives";
import { Seg } from "@/flavors/surface/components/ui/seg";
import { channels } from "@/flavors/surface/content";

export const metadata: Metadata = {
  title: "No signal",
  robots: { index: false },
};

/** A path that isn't a channel: no signal, and every channel that exists. */
export default function NotFound() {
  return (
    <Page className="px-4 pt-8 md:px-6 md:pt-12 lg:px-12">
      <div className="seam-b pb-3.5">
        <Legend>
          <LegendRow parts={["Channel --", "No signal"]} />
        </Legend>
      </div>
      <div className="mt-10 grid items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h1 className="-ml-[0.04em] text-display tracking-[-0.022em]">
            No signal on this channel
          </h1>
          <p className="mt-6 max-w-[44ch] text-lead font-medium">
            This address isn&apos;t tuned to anything. Pick a channel that
            exists.
          </p>
        </div>
        <div className="mod p-2.5 lg:col-span-5">
          <div className="glass px-6 pt-4 pb-5">
            <p className="legend mb-2">Error</p>
            <Seg
              value="404"
              label="Error 404, page not found"
              className="h-20"
            />
            <p className="matrix mt-3 border-t border-lcd-ink-2/35 pt-2.5 text-[0.9375rem]">
              Not found
            </p>
          </div>
        </div>
      </div>
      <nav aria-label="Channels" className="mt-12">
        <ul className="flex flex-wrap gap-2">
          {channels.map((item) => (
            <li key={item.href}>
              <KeyLink href={item.href}>
                <span aria-hidden className="font-medium text-ink-2">
                  {item.ch}
                </span>
                {item.label}
              </KeyLink>
            </li>
          ))}
        </ul>
      </nav>
    </Page>
  );
}
