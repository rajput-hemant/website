import type { Metadata } from "next";
import { NeedleMeter } from "@/flavors/surface/components/instruments/meter";
import { ChannelSelector } from "@/flavors/surface/components/knob/channel-selector";
import { LostPatch } from "@/flavors/surface/components/site/lost-patch";
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

/**
 * A path that isn't a channel: no signal, the channel selector to re-tune to
 * a real one, and every channel that exists.
 */
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
            This address isn&apos;t tuned to anything. Turn the knob to a
            channel that exists.
          </p>
          <div className="mod mt-8 inline-block p-2.5">
            <div className="glass px-6 pt-4 pb-5">
              <p className="legend mb-2">Error</p>
              <div className="flex items-end gap-6">
                <Seg
                  value="404"
                  label="Error 404, page not found"
                  className="h-20"
                />
                <NeedleMeter
                  name="no-signal"
                  value={0}
                  hover="tremble"
                  className="max-sm:hidden"
                />
              </div>
              <p className="matrix mt-3 border-t border-lcd-ink-2/35 pt-2.5 text-[0.9375rem]">
                Not found
              </p>
            </div>
          </div>
          <LostPatch routes={channels.slice(0, 3)} className="mt-6 max-w-sm" />
        </div>
        <ChannelSelector
          current={null}
          className="mx-auto max-w-[34rem] lg:col-span-5"
        />
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
