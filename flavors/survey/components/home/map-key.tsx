import { SHEET } from "@/flavors/survey/lib/relief";

const swatch = "h-3.5 w-7.5 shrink-0 overflow-visible";

/** The sheet's reference key: every symbol on the map and what it means. */
export function MapKey() {
  const wave = "M1 9C8 3 14 11 21 6S28 5 29 6";
  const rows = [
    {
      label: `Contour, every ${SHEET.INTERVAL} months in a role`,
      icon: (
        <path d={wave} className="fill-none stroke-contour" strokeWidth=".9" />
      ),
    },
    {
      label: `Index contour, ${SHEET.INDEX} months`,
      icon: (
        <path d={wave} className="fill-none stroke-contour" strokeWidth="1.8" />
      ),
    },
    {
      label: "Summit, total months in the role",
      icon: (
        <>
          <circle cx="5" cy="8" r="1.8" className="fill-ink" />
          <text
            x="10"
            y="12"
            className="fill-ink font-sans text-[10px] font-semibold"
          >
            16
          </text>
        </>
      ),
    },
    {
      label: "Trig pillar, maintained project",
      icon: (
        <>
          <path
            d="M8 1.5L14 12.5H2Z"
            className="fill-none stroke-ink"
            strokeWidth="1.1"
          />
          <circle cx="8" cy="8.6" r="1.2" className="fill-ink" />
        </>
      ),
    },
    {
      label: "Antiquity, archived project",
      icon: (
        <text x="0" y="12" className="fill-ink font-gothic text-[14px]">
          Site
        </text>
      ),
    },
    {
      label: "Under construction, in progress",
      icon: (
        <rect
          x="2.5"
          y="1.5"
          width="11"
          height="11"
          className="fill-none stroke-ink"
          strokeWidth="1.1"
          strokeDasharray="2.5 1.8"
        />
      ),
    },
    {
      label: "Revised this edition, current role",
      icon: (
        <>
          <circle cx="5" cy="8" r="1.8" className="fill-revision" />
          <text
            x="10"
            y="12"
            className="fill-revision font-sans text-[10px] font-semibold"
          >
            8
          </text>
        </>
      ),
    },
    {
      label: "Unsurveyed, after today",
      icon: (
        <>
          <rect width="30" height="14" className="fill-sea" />
          <path
            d="M2 0V14M5 0V14M9 0V14M14 0V14M21 0V14"
            className="stroke-water"
            strokeWidth=".6"
          />
        </>
      ),
    },
    {
      label: "Grid square, one year east",
      icon: (
        <rect
          x=".5"
          y=".5"
          width="29"
          height="13"
          className="fill-none stroke-water opacity-60"
          strokeWidth=".8"
        />
      ),
    },
  ];

  return (
    <div className="border border-rule-strong px-4 pt-3.5 pb-4">
      <h2 className="caps">Reference</h2>
      <ul className="mt-3 grid gap-2">
        {rows.map((row) => (
          <li
            key={row.label}
            className="grid grid-cols-[1.875rem_minmax(0,1fr)] items-center gap-3 text-[0.8125rem] leading-snug text-ink-soft"
          >
            <svg aria-hidden viewBox="0 0 30 14" className={swatch}>
              {row.icon}
            </svg>
            {row.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
