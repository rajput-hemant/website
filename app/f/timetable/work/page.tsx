import type { Metadata } from "next";
import Link from "next/link";
import { NetworkSection } from "@/flavors/timetable/components/network/network-section";
import { Page } from "@/flavors/timetable/components/site/page";
import { SceneDockTarget } from "@/flavors/timetable/components/site/scene-dock";
import { SceneView } from "@/flavors/timetable/components/site/scene-view";
import { RoundelPoster } from "@/flavors/timetable/components/site/view-posters";
import {
  Container,
  PageHeader,
  SectionHead,
} from "@/flavors/timetable/components/ui";
import { LineGuide } from "@/flavors/timetable/components/work/line-guide";
import { buildNetwork } from "@/flavors/timetable/lib/network";

import { sitePage } from "@/content/site";
import { getExperience } from "@/lib/data";
import { formatMonthYear } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/work");

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata(page);
}

export default async function WorkPage() {
  const experience = await getExperience();
  const network = buildNetwork(experience);
  const lineOf = new Map(network.lines.map((line) => [line.id, line]));
  const earliest = experience.at(-1);

  return (
    <Page>
      <PageHeader
        platform="2"
        kicker="Network map"
        title="Experience"
        lede={page.description}
        meta={[
          { label: "Lines", value: String(network.lines.length) },
          { label: "Interchanges", value: String(network.interchanges.length) },
          ...(earliest
            ? [
                {
                  label: "In service since",
                  value: formatMonthYear(earliest.startDate),
                },
              ]
            : []),
        ]}
        scene="work"
        dock
        board={`${network.lines.length} lines|${network.interchanges.length} interchanges`}
      />
      <Container className="mt-section">
        <NetworkSection network={network} linkRoles={false} overlay="train" />

        <section
          aria-labelledby="guides-heading"
          className="mt-section"
          data-scene-section
        >
          <SectionHead
            id="guides-heading"
            kicker="Line guides"
            title="Every line, newest first"
          />
          {/* The indicator docks beside the guides, so the scrub stays in view. */}
          <div className="mt-6 lg:grid lg:grid-cols-12 lg:gap-x-6">
            <div className="@container lg:col-span-8">
              {experience.map((role) => {
                const line = lineOf.get(role.id);
                return line ? (
                  <LineGuide key={role.id} role={role} line={line} />
                ) : null;
              })}
            </div>
            <div className="max-lg:hidden lg:col-span-4 lg:pt-12">
              <div className="sticky top-[calc(var(--header-height)+1.5rem)]">
                <SceneDockTarget className="static" />
                {/* The active line's roundel hangs under the indicator. */}
                <SceneView
                  id="roundel"
                  poster={<RoundelPoster />}
                  className="mx-auto mt-2 size-28"
                />
              </div>
            </div>
          </div>
        </section>

        <p className="mt-12 border-t border-rule pt-6 text-ink-soft">
          Skills and education are in the{" "}
          <Link
            href="/about"
            className="font-bold text-ink underline decoration-2 underline-offset-[0.2em]"
          >
            station guide
          </Link>
          .
        </p>
      </Container>
    </Page>
  );
}
