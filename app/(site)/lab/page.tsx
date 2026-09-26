import type { Metadata } from "next";

import { labExperiments } from "@/content/lab";
import { sitePage } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { StudyCard } from "@/components/lab/study-card";
import { Page, SceneSlot } from "@/components/site";
import { Container, PageHeader } from "@/components/ui";

const page = sitePage("/lab");

export const metadata: Metadata = pageMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
});

/**
 * The lab index: a dated grid of experiment tiles. Each poster is the same
 * static fallback the experiment itself falls back to, so the index never
 * loads three.js just to show a preview.
 */
export default function LabPage() {
  return (
    <Page>
      <Container className="py-section">
        <PageHeader
          sheet="03"
          eyebrow="Studies"
          title={page.title}
          lede={page.description}
        />

        <SceneSlot route="lab" size="band" />

        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {labExperiments.map((experiment, i) => (
            <li key={experiment.slug}>
              <StudyCard
                experiment={experiment}
                n={String(i + 1).padStart(2, "0")}
              />
            </li>
          ))}
        </ul>
      </Container>
    </Page>
  );
}
