import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/flavors/survey/components/site/page";
import { Container } from "@/flavors/survey/components/ui/container";
import { PageHeader } from "@/flavors/survey/components/ui/page-header";
import { SectionHead } from "@/flavors/survey/components/ui/section-head";
import { RoleTransect } from "@/flavors/survey/components/work/role-transect";
import { isoMonth } from "@/flavors/survey/lib/relief";
import { getRelief } from "@/flavors/survey/lib/sheet";

import { sitePage } from "@/content/site";
import { getExperience } from "@/lib/data";
import { formatMonthYear } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/work");

export const metadata: Metadata = pageMetadata(page);

/** Experience as transects: one cross-section along each summit's ridge, newest first. */
export default async function WorkPage() {
  const [experience, relief] = await Promise.all([
    getExperience(),
    getRelief(),
  ]);
  const byId = new Map(relief.summits.map((s) => [s.id, s]));
  const tallest = relief.summits.reduce(
    (top, s) => (s.h > top.h ? s : top),
    relief.summits[0]!
  );

  return (
    <Page>
      <PageHeader
        kicker="Transects"
        title="Experience"
        lede={page.description}
        meta={[
          { label: "Summits", value: String(relief.summits.length) },
          {
            label: "Most at once",
            value: `${relief.peak.count}, from ${formatMonthYear(isoMonth(relief.peak.month))}`,
          },
          ...(tallest
            ? [
                {
                  label: "Highest",
                  value: `${tallest.company}, ${tallest.h} months`,
                },
              ]
            : []),
        ]}
        scene={{ relief, route: "work" }}
      />
      <Container
        as="section"
        aria-labelledby="transects-heading"
        className="mt-section"
      >
        <SectionHead
          id="transects-heading"
          kicker="Employment · rows 05 to 09"
          title="Every ridge, newest first"
          aside="Shading beyond a role's outline is another role running alongside"
        />
        <div>
          {experience.map((role) => {
            const summit = byId.get(role.id);
            return summit ? (
              <RoleTransect
                key={role.id}
                role={role}
                summit={summit}
                relief={relief}
              />
            ) : null;
          })}
        </div>
        <p className="mt-10 text-ink-soft">
          Skills and education are in the{" "}
          <Link
            href="/about"
            className="text-ink underline decoration-contour underline-offset-[0.35em] fine:hover:text-water"
          >
            survey history
          </Link>
          .
        </p>
      </Container>
    </Page>
  );
}
