import type { Metadata } from "next";
import { FutureSpecimen, liveSpecimens } from "@/flavors/picker/specimens";
import {
  DEFAULT_FLAVOR,
  flavors,
  liveFlavors,
  type FlavorId,
} from "@/flavors/registry";

import { site } from "@/content/site";

const title = `Choose an edition · ${site.name}`;
const description = `${site.name}'s portfolio comes in editions: the same work, pages and data, each told in its own visual language. Pick one and switch any time.`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, url: "/", siteName: site.name },
};

const headline =
  "Fullstack engineer crafting fast, pixel-perfect web experiences";

const futureFlavors = (Object.keys(flavors) as FlavorId[]).filter(
  (id) => flavors[id].status === "future"
);

const pad = (n: number) => String(n).padStart(2, "0");

const eyebrow =
  "text-xs font-medium tracking-[0.14em] text-muted uppercase tabular-nums";

export default function FlavorsPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[76rem] flex-col px-4 sm:px-8 lg:px-12">
      <header className="flex flex-col gap-1 border-b border-line py-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <p className="text-[0.9375rem] font-semibold tracking-[-0.01em]">
          {site.name}
        </p>
        <p className="text-sm text-muted">{headline}</p>
      </header>

      <main className="flex-1">
        <section className="pt-16 pb-14 sm:pt-24 sm:pb-20 lg:pt-32">
          <p className={eyebrow}>
            {pad(liveFlavors.length)} ready · {pad(futureFlavors.length)} in the
            works
          </p>
          <h1 className="mt-6 max-w-[14ch] font-serif text-display tracking-[-0.02em] text-balance">
            One portfolio, told in several editions.
          </h1>
          <p className="mt-8 max-w-[34rem] text-lg/relaxed text-pretty text-muted sm:text-xl/relaxed">
            Every edition carries the same content, URLs and data. Only the way
            it reads changes, so pick the one you like and switch any time.
          </p>
        </section>

        <section aria-labelledby="live-heading" className="pb-20 sm:pb-28">
          <div className="flex items-baseline justify-between border-b border-line pb-4">
            <h2 id="live-heading" className={eyebrow}>
              Ready to read
            </h2>
            <p className="text-sm text-muted">Choose one to enter</p>
          </div>

          <ul className="mt-8 grid gap-6 md:grid-cols-2 md:gap-8" role="list">
            {liveFlavors.map((id, i) => {
              const flavor = flavors[id];
              const isDefault = id === DEFAULT_FLAVOR;
              return (
                <li key={id}>
                  <a
                    href={`/?flavor=${id}`}
                    className="group flex h-full flex-col rounded-2xl border border-line bg-panel p-3 hover:border-line-strong focus-visible:outline-offset-4 motion-safe:transition-[border-color,translate] motion-safe:duration-300 motion-safe:ease-out-soft motion-safe:hover:-translate-y-0.5 sm:p-4"
                  >
                    <div className="overflow-hidden rounded-xl ring-1 ring-line">
                      <div className="motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out-soft motion-safe:group-hover:scale-[1.025]">
                        {liveSpecimens[id](flavor.swatch)}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col px-2 pt-6 pb-3 sm:px-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted tabular-nums">
                          {pad(i + 1)}
                        </span>
                        <h3 className="font-serif text-4xl tracking-[-0.01em] sm:text-[2.75rem]">
                          {flavor.name}
                        </h3>
                        {isDefault && (
                          <span className="ml-auto rounded-full border border-line-strong px-3 py-1 text-xs font-medium tracking-[0.08em] uppercase">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="mt-3 max-w-[38ch] text-base/relaxed text-pretty text-muted">
                        {flavor.tagline}
                      </p>
                      <span className="mt-auto flex min-h-11 items-center gap-2 pt-6 text-[0.9375rem] font-medium">
                        Enter {flavor.name}
                        <span
                          aria-hidden="true"
                          className="motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out-soft motion-safe:group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </span>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="future-heading" className="pb-24 sm:pb-32">
          <div className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 id="future-heading" className={eyebrow}>
              In the works
            </h2>
            <p className="text-sm text-muted">
              Designed as studies, not built yet
            </p>
          </div>

          <ul
            className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
            role="list"
          >
            {futureFlavors.map((id, i) => {
              const flavor = flavors[id];
              return (
                <li key={id} className="flex flex-col">
                  <div className="overflow-hidden rounded-lg ring-1 ring-line">
                    <FutureSpecimen {...flavor.swatch} />
                  </div>
                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="text-sm text-muted tabular-nums">
                      {pad(liveFlavors.length + i + 1)}
                    </span>
                    <h3 className="font-serif text-2xl">{flavor.name}</h3>
                    <span className="ml-auto shrink-0 text-xs font-medium tracking-[0.08em] text-muted uppercase">
                      Coming later
                    </span>
                  </div>
                  <p className="mt-2 text-sm/relaxed text-pretty text-muted">
                    {flavor.tagline}
                  </p>
                  <ul
                    className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted tabular-nums"
                    aria-label={`${flavor.name} palette`}
                  >
                    {Object.entries(flavor.swatch).map(([role, hex]) => (
                      <li key={role} className="flex items-center gap-1.5">
                        <span
                          aria-hidden="true"
                          className="size-2.5 rounded-full ring-1 ring-line-strong"
                          style={{ background: hex }}
                        />
                        <span className="sr-only">{role} </span>
                        {hex.toUpperCase()}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      <footer className="flex flex-col gap-3 border-t border-line py-8 text-sm text-muted sm:flex-row sm:justify-between sm:gap-8">
        <p className="max-w-[38rem] text-pretty">
          Your choice is remembered on this device. To switch later, use{" "}
          <span className="font-medium text-ink">Change edition</span> in the
          footer of any edition.
        </p>
        <p className="shrink-0">
          {site.name} · {new URL(site.url).host}
        </p>
      </footer>
    </div>
  );
}
