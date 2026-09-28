import { ChartNoAxesColumnIncreasing } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * The footer's visitor counter. Written only by `POST /api/visits`, which
 * creates the singleton on the first visit; read-only in Studio.
 */
export const siteStats = defineType({
  name: "siteStats",
  title: "Site stats",
  type: "document",
  icon: ChartNoAxesColumnIncreasing,
  readOnly: true,
  fields: [
    defineField({
      name: "visitors",
      title: "Unique visitors",
      type: "number",
      description: "Browsers counted once per UTC day. Bots are not counted.",
    }),
    defineField({
      name: "updatedAt",
      title: "Last counted",
      type: "datetime",
    }),
  ],
  preview: {
    select: { visitors: "visitors" },
    prepare: ({ visitors }: { visitors?: number }) => ({
      title: "Site stats",
      subtitle: `${visitors ?? 0} visitors`,
    }),
  },
});
