import type { Metadata } from "next";

import { sheetFor, sitePage } from "@/content/site";
import { getExperience } from "@/lib/data";
import { formatMonthYear } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { Page, SceneSlot } from "@/components/site";
import { ArrowLink, Container, PageHeader } from "@/components/ui";
import { ExperienceTimeline } from "@/components/work/experience-timeline";
import { YearRail, type YearMark } from "@/components/work/year-rail";

const page = sitePage("/work");
const sheet = sheetFor(page.path)?.sheet ?? "02";

export const metadata: Metadata = pageMetadata(page);

function yearMarks(roles: { id: string; startDate: string }[]): YearMark[] {
  const seen = new Set<string>();
  const marks: YearMark[] = [];
  for (const role of roles) {
    const year = role.startDate.slice(0, 4);
    if (seen.has(year)) continue;
    seen.add(year);
    marks.push({ year, targetId: role.id });
  }
  return marks;
}

export default async function WorkPage() {
  const experience = await getExperience();
  const earliest = experience.at(-1);
  const marks = yearMarks(experience);

  const meta = [
    {
      label: "Roles",
      value: `${experience.length} ${experience.length === 1 ? "role" : "roles"}`,
    },
    ...(earliest
      ? [
          {
            label: "Since",
            value: `Since ${formatMonthYear(earliest.startDate)}`,
          },
        ]
      : []),
  ];

  return (
    <Page>
      <Container>
        <PageHeader
          sheet={sheet}
          title={page.title}
          lede={page.description}
          meta={meta}
        />

        <SceneSlot route="work" size="band" />

        <div className="lg:grid lg:grid-cols-[5rem_1fr] lg:gap-10">
          {marks.length > 1 && (
            <div className="hidden lg:block">
              <YearRail years={marks} />
            </div>
          )}
          <section aria-label="Roles, newest first">
            <ExperienceTimeline id="roles" roles={experience} />
          </section>
        </div>

        <p className="mt-section border-t border-line pt-8 text-ink-soft">
          Skills and education live on the{" "}
          <ArrowLink href="/about">About page</ArrowLink>.
        </p>
      </Container>
    </Page>
  );
}
