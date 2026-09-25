import type { Metadata } from "next";

import { site } from "@/content/site";
import { getExperience, getNow, getProfile, getProjects } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";
import { Intro } from "@/components/home/intro";
import { More } from "@/components/home/more";
import { SelectedProjects } from "@/components/home/selected-projects";
import { Container } from "@/components/site/container";

export const metadata: Metadata = pageMetadata({
  description: site.description,
  path: "/",
});

export default async function HomePage() {
  const [profile, now, projects, experience] = await Promise.all([
    getProfile(),
    getNow(),
    getProjects(),
    getExperience(),
  ]);

  return (
    <Container className="stagger">
      <Intro profile={profile} />
      <SelectedProjects projects={projects} />
      <More now={now} roles={experience} />
    </Container>
  );
}
