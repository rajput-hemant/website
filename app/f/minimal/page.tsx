import type { Metadata } from "next";
import { Intro, IntroContact } from "@/flavors/minimal/components/home/intro";
import { More } from "@/flavors/minimal/components/home/more";
import { RolesSummary } from "@/flavors/minimal/components/home/roles-summary";
import { SelectedProjects } from "@/flavors/minimal/components/home/selected-projects";
import { Container } from "@/flavors/minimal/components/site/container";

import { site } from "@/content/site";
import { getExperience, getNow, getProfile, getProjects } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  description: site.description,
  path: "/",
});

/** Roles shown on home; the rest are one "Full story" click away on /work. */
const HOME_ROLES = 3;

/**
 * The document order is the desktop reading order. On phones the contact row
 * moves below "Selected" (flex `order`), so the first project is on the first
 * screen; the sections after it keep their order.
 */
export default async function HomePage() {
  const [profile, now, projects, experience] = await Promise.all([
    getProfile(),
    getNow(),
    getProjects(),
    getExperience(),
  ]);

  return (
    <Container className="stagger flex flex-col">
      <Intro profile={profile} />
      <IntroContact
        profile={profile}
        className="mt-4 max-sm:order-1 max-sm:mt-12"
      />
      <SelectedProjects projects={projects} />
      <RolesSummary
        roles={experience}
        limit={HOME_ROLES}
        as="h2"
        className="mt-12 max-sm:order-2 sm:mt-14"
      />
      <More now={now} className="max-sm:order-2" />
    </Container>
  );
}
