import type { Metadata } from "next";

import { site } from "@/content/site";
import { getExperience, getNow, getProfile, getProjects } from "@/lib/data";
import { ExperienceSummary } from "@/components/home/experience-summary";
import { Intro } from "@/components/home/intro";
import { NowTeaser } from "@/components/home/now-teaser";
import { SelectedProjects } from "@/components/home/selected-projects";
import { Container } from "@/components/site/container";

export const metadata: Metadata = {
  title: { absolute: site.name },
  description: site.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [profile, now, projects, experience] = await Promise.all([
    getProfile(),
    getNow(),
    getProjects(),
    getExperience(),
  ]);

  return (
    <Container>
      <Intro profile={profile} />
      <NowTeaser now={now} />
      <SelectedProjects projects={projects} />
      <ExperienceSummary roles={experience} />
    </Container>
  );
}
