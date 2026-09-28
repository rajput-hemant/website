import type { Metadata } from "next";
import { Panel } from "@/flavors/surface/components/site/panel";
import { KeyLink } from "@/flavors/surface/components/ui/primitives";
import { Readout } from "@/flavors/surface/components/ui/readout";
import { pad2 } from "@/flavors/surface/components/ui/seg";
import { Multitrack } from "@/flavors/surface/components/work/multitrack";
import { RoleStrip } from "@/flavors/surface/components/work/role-strip";

import { sitePage } from "@/content/site";
import { getExperience } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/work");

export const metadata: Metadata = pageMetadata(page);

/** The multitrack of every role, then each role as a channel strip. The knob steps through the tracks. */
export default async function WorkPage() {
  const experience = await getExperience();
  const today = new Date();
  const since = Math.min(
    today.getFullYear(),
    ...experience.map((role) => Number(role.startDate.slice(0, 4)))
  );
  const ongoing = experience.filter((role) => !role.endDate).length;

  return (
    <Panel
      ch="02"
      name="Experience"
      aside="Newest first"
      title="Experience"
      lede={page.description}
      meta={
        <Readout
          fields={[
            { label: "Roles", value: pad2(experience.length) },
            { label: "Since", value: String(since) },
            { label: "Ongoing", value: pad2(ongoing) },
          ]}
        />
      }
      knob={{
        items: experience.map((role) => ({
          label: role.company,
          href: `#${role.id}`,
        })),
        unit: "Track",
        label: "Track selector",
      }}
    >
      <Multitrack
        roles={experience}
        today={today}
        hrefFor={(role) => `#${role.id}`}
        detents
      />

      <ol className="mt-12 grid gap-4">
        {experience.map((role, i) => (
          <li key={role.id}>
            <RoleStrip role={role} track={i + 1} today={today} />
          </li>
        ))}
      </ol>

      <p className="seam-t mt-12 flex flex-wrap items-center gap-4 pt-6 text-ink-2">
        Skills and education are on the About channel.
        <KeyLink href="/about" size="sm">
          Open About
        </KeyLink>
      </p>
    </Panel>
  );
}
