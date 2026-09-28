import type { Metadata } from "next";
import Link from "next/link";
import { Face } from "@/flavors/calibre/components/dial/face";
import { posters } from "@/flavors/calibre/components/lab/experiments";
import { Page } from "@/flavors/calibre/components/site/page";
import { Container } from "@/flavors/calibre/components/ui/container";
import { PageHeader } from "@/flavors/calibre/components/ui/page-header";
import { bezelPrints, pad2 } from "@/flavors/calibre/lib/movement";

import { labExperiments } from "@/content/lab";
import { sitePage } from "@/content/site";
import { getProfile, getProjects, getSiteIdentity } from "@/lib/data";
import { labStatusLabels } from "@/lib/data/labels";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/lab");

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata(page);
}

/** The regulation bench: each experiment runs on its own page; the index shows static posters only. */
export default async function LabPage() {
  const site = await getSiteIdentity();
  const [profile, projects] = await Promise.all([getProfile(), getProjects()]);
  return (
    <Page>
      <PageHeader
        hour={6}
        kicker="Regulation bench"
        title={page.title}
        lede={page.description}
        meta={[{ label: "On the bench", value: String(labExperiments.length) }]}
        prints={bezelPrints(projects.length, profile.location, site.initials)}
        dial={<Face figure={labExperiments.length} unit="On the bench" />}
      />
      <Container className="mt-section">
        <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {labExperiments.map((experiment, i) => {
            const Poster = posters[experiment.slug];
            return (
              <li key={experiment.slug}>
                <Link href={`/lab/${experiment.slug}`} className="group block">
                  <div className="engraving rounded-[3px] p-2">
                    <div className="aspect-video overflow-hidden rounded-[2px] ring-steel transition-shadow duration-(--duration-ui) fine:group-hover:ring-2">
                      <Poster />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-3">
                    <span className="spec">
                      Trial {pad2(i + 1)} · {experiment.year}
                    </span>
                    <span className="spec">
                      {labStatusLabels[experiment.status]}
                    </span>
                  </div>
                  <h2 className="pt-2 text-[1.75rem] leading-tight underline decoration-transparent underline-offset-[0.2em] fine:group-hover:decoration-steel">
                    {experiment.title}
                  </h2>
                  <p className="pt-1.5 text-sm text-soft">
                    {experiment.description}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </Page>
  );
}
