import type { Metadata } from "next";
import { LampKey } from "@/flavors/surface/components/projects/lamp-key";
import { PresetModule } from "@/flavors/surface/components/projects/preset-module";
import { Panel } from "@/flavors/surface/components/site/panel";
import { LegendRow } from "@/flavors/surface/components/ui/primitives";
import { Readout } from "@/flavors/surface/components/ui/readout";
import { pad2 } from "@/flavors/surface/components/ui/seg";

import { sitePage } from "@/content/site";
import { getProjects } from "@/lib/data";
import type { Project } from "@/lib/data/types";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/projects");

export const metadata: Metadata = pageMetadata(page);

const BANK_SIZE = 4;

function banks(projects: Project[]) {
  const out: { letter: string; first: number; items: Project[] }[] = [];
  for (let i = 0; i < projects.length; i += BANK_SIZE) {
    out.push({
      letter: String.fromCharCode(65 + i / BANK_SIZE),
      first: i,
      items: projects.slice(i, i + BANK_SIZE),
    });
  }
  return out;
}

/** Every project as a preset, four to a bank. The knob steps through all of them. */
export default async function ProjectsPage() {
  const projects = await getProjects();
  const featured = projects.filter((project) => project.featured).length;
  const bankList = banks(projects);

  return (
    <Panel
      ch="01"
      name="Projects"
      aside={`${bankList.length} banks of ${BANK_SIZE}`}
      title={page.title}
      lede={page.description}
      meta={
        <Readout
          fields={[
            { label: "Presets", value: pad2(projects.length) },
            { label: "Banks", value: pad2(bankList.length) },
            { label: "Selected", value: pad2(featured) },
          ]}
        />
      }
      knob={{
        items: projects.map((project) => ({
          label: project.name,
          href: `/projects/${project.slug}`,
        })),
        unit: "Preset",
        label: "Preset selector",
      }}
    >
      <LampKey className="seam-b pb-5" />
      <div className="mt-10 grid gap-16">
        {bankList.map((bank) => (
          <section key={bank.letter} aria-labelledby={`bank-${bank.letter}`}>
            <h2 id={`bank-${bank.letter}`} className="legend mb-4">
              <LegendRow
                parts={[
                  `Bank ${bank.letter}`,
                  `Presets ${pad2(bank.first + 1)} to ${pad2(bank.first + bank.items.length)}`,
                ]}
              />
            </h2>
            <ol className="grid gap-3.5 sm:grid-cols-2">
              {bank.items.map((project, j) => (
                <li key={project.id}>
                  <PresetModule
                    project={project}
                    number={bank.first + j + 1}
                    detent={bank.first + j}
                  />
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </Panel>
  );
}
