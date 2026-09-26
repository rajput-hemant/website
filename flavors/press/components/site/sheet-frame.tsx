import { RegMark } from "@/flavors/press/components/ui/reg-mark";
import { controlStrip } from "@/flavors/press/lib/proof";
import { cn } from "@/flavors/press/lib/utils";

import { site } from "@/content/site";
import { getProfile, getProjects } from "@/lib/data";

import { SheetSlug } from "./sheet-slug";

const CROP = "M4 40H31M40 4V31";

function Crop({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn(
        "absolute size-10 overflow-visible fill-none stroke-ink",
        className
      )}
    >
      <path d={CROP} />
    </svg>
  );
}

const proofDate = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})
  .format(new Date())
  .replaceAll("/", ".");

/**
 * The trimmed sheet's margin on wide screens: crop marks, registration
 * targets on every side, the control strip (one patch per project, solid
 * when featured) and the slug lines. Decorative, so it is hidden from
 * assistive tech; every fact in it is also on a page.
 */
export async function SheetFrame() {
  const [projects, profile] = await Promise.all([getProjects(), getProfile()]);
  const strip = controlStrip(projects);
  const featured = strip.filter((patch) => patch.solid).length;

  return (
    <div
      aria-hidden
      data-print="hide"
      style={{ viewTransitionName: "sheet-frame" }}
      className="pointer-events-none fixed inset-0 z-40 hidden lg:block"
    >
      <div className="stock absolute inset-x-0 top-0 h-m" />
      <div className="stock absolute inset-x-0 bottom-0 h-m" />
      <div className="stock absolute inset-y-0 left-0 w-m" />
      <div className="stock absolute inset-y-0 right-0 w-m" />
      <div className="absolute inset-m">
        <Crop className="-top-10 -left-10" />
        <Crop className="-top-10 -right-10 -scale-x-100" />
        <Crop className="-bottom-10 -left-10 -scale-y-100" />
        <Crop className="-right-10 -bottom-10 -scale-100" />
        <RegMark className="absolute -top-[31px] left-[calc(50%-11px)] size-[22px]" />
        <RegMark className="absolute -bottom-[31px] left-[calc(50%-11px)] size-[22px]" />
        <RegMark className="absolute top-[calc(50%-11px)] -left-[31px] size-[22px]" />
        <RegMark className="absolute top-[calc(50%-11px)] -right-[31px] size-[22px]" />

        <div className="absolute inset-x-8 -top-m flex h-m items-center justify-between gap-6 slug">
          <div className="flex items-center gap-3">
            <div className="flex">
              <i className="block size-[13px] bg-yellow" />
              <i className="block size-[13px] bg-pink" />
              <i className="block size-[13px] bg-blue" />
              <i className="overprint block size-[13px]" />
              <i className="block w-[7px]" />
              {strip.map((patch) => (
                <i
                  key={patch.slug}
                  className={cn(
                    "block size-[13px]",
                    patch.solid
                      ? "overprint"
                      : patch.plate === "p1"
                        ? "bg-[color-mix(in_srgb,var(--color-pink)_30%,var(--color-paper))]"
                        : "bg-[color-mix(in_srgb,var(--color-blue)_28%,var(--color-paper))]"
                  )}
                />
              ))}
            </div>
            <span className="max-xl:hidden">
              Control strip: {strip.length} projects, {featured} solid =
              featured
            </span>
          </div>
          <span>
            <span className="dark:hidden">Paper proof</span>
            <span className="hidden dark:inline">
              Plate view, shown as negative
            </span>
            &nbsp;/&nbsp; {proofDate} &nbsp;/&nbsp;{" "}
            {site.url.replace(/^https?:\/\//, "")}
          </span>
        </div>

        <span className="absolute top-30 -left-7 rotate-180 slug [writing-mode:vertical-rl]">
          Gripper edge &nbsp;→
        </span>

        <div className="absolute inset-x-8 -bottom-m flex h-m items-center justify-between gap-6 slug">
          <span className="max-xl:hidden">
            Stock: uncoated &nbsp;/&nbsp; Inks: P1 interface, P2 systems, P3
            what is current
          </span>
          <span className="flex gap-2">
            <SheetSlug />
            <span>&nbsp;/&nbsp; {profile.location}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
