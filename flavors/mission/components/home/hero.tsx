import Link from "next/link";
import { Trajectory } from "@/flavors/mission/components/flight/trajectory";
import { SceneSlot } from "@/flavors/mission/components/site/scene-slot";
import { buttonClass } from "@/flavors/mission/components/ui/button";
import { Checklist } from "@/flavors/mission/components/ui/checklist";
import { Container } from "@/flavors/mission/components/ui/container";
import { RichText } from "@/flavors/mission/components/ui/rich-text";
import { launchLabel, type Flight } from "@/flavors/mission/lib/flight";
import { boardFor } from "@/flavors/mission/lib/scene/poses";

import type { Profile } from "@/lib/data/types";

/**
 * The crew profile, 1.0: the name, the line and the pre-flight checklist on
 * the left, Fig. 1 (the globe) on the right, and Fig. 2 (the trajectory)
 * across the foot of the first screen.
 */
export function Hero({
  profile,
  flight,
}: {
  profile: Profile;
  flight: Flight;
}) {
  const [first = "", ...rest] = profile.name.split(" ");
  const [place = profile.location] = profile.location.split(",");
  return (
    <Container
      as="section"
      aria-labelledby="crew"
      className="grid grid-cols-1 gap-x-6 gap-y-10 pt-7 pb-6 lg:min-h-[max(47.5rem,calc(100svh-6.5rem))] lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)_auto] lg:gap-y-6"
    >
      <div className="flex min-w-0 flex-col justify-between gap-6 lg:col-span-7">
        <p className="flex flex-wrap gap-x-3.5 gap-y-1 label text-ink-soft">
          <b className="font-semibold text-signal">1.0</b>
          <span>Crew profile</span>
          <span>T-0 {launchLabel(flight)}</span>
        </p>
        <div>
          <h1 id="crew" className="-ml-[0.04em] text-name tracking-[-0.035em]">
            <span className="block">{first}</span>{" "}
            <span className="block">{rest.join(" ")}</span>
          </h1>
          <div className="mt-7 grid gap-x-10 gap-y-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] xl:items-start">
            <div>
              <p className="max-w-[21ch] text-lead font-medium tracking-[-0.01em]">
                {profile.headline}.
              </p>
              <RichText
                value={profile.bio}
                className="mt-3 max-w-[36ch] text-ink-soft"
              />
            </div>
            <div>
              <Checklist
                rows={[
                  ...(profile.availability
                    ? [
                        {
                          label: "Status",
                          value: profile.availability,
                          nominal: true,
                        },
                      ]
                    : []),
                  { label: "Launch site", value: profile.location },
                  { label: "Operations", value: `Remote from ${place}` },
                  {
                    label: "Downlink",
                    value: (
                      <a
                        href={`mailto:${profile.email}`}
                        className="rule-link normal-case"
                      >
                        {profile.email}
                      </a>
                    ),
                  },
                ]}
              />
              <p className="mt-[1.125rem] flex flex-wrap gap-3">
                <Link
                  href="/projects"
                  className={buttonClass({ variant: "signal" })}
                >
                  View missions{" "}
                  <span aria-hidden className="font-mono text-label">
                    →
                  </span>
                </Link>
                <Link
                  href="/ask"
                  className={buttonClass({ variant: "outline" })}
                >
                  Ask capcom
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <SceneSlot
        route="home"
        board={boardFor(flight)}
        fill
        caption="Inclination = months in phase × 4°. Node = start month."
        className="min-h-[24rem] lg:col-span-5 lg:border-l lg:border-rule lg:pl-6"
      />

      <Trajectory flight={flight} className="lg:col-span-12" />
    </Container>
  );
}
