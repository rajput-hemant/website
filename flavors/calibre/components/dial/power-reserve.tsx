import { cn } from "@/flavors/calibre/lib/utils";

/**
 * The power reserve: a gauge from Booked to Open, the hand at Open when the
 * owner is available for work. The words under it say the same in text.
 */
export function PowerReserve({
  availability,
  email,
  className,
}: {
  availability: string | undefined;
  email: string;
  className?: string;
}) {
  const open = Boolean(availability);
  const a = ((open ? 58 : -58) - 90) * (Math.PI / 180);
  return (
    <div className={cn("flex items-center gap-6", className)}>
      <svg
        viewBox="0 0 120 70"
        aria-hidden
        focusable="false"
        className="block w-28 shrink-0"
      >
        {Array.from({ length: 13 }, (_, i) => {
          const t = ((-60 + i * 10 - 90) * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={60 + Math.cos(t) * 44}
              y1={58 + Math.sin(t) * 44}
              x2={60 + Math.cos(t) * (i % 6 === 0 ? 36 : 40)}
              y2={58 + Math.sin(t) * (i % 6 === 0 ? 36 : 40)}
              className="stroke-ink"
              strokeWidth={i % 6 === 0 ? 1.4 : 0.8}
            />
          );
        })}
        <line
          x1="60"
          y1="58"
          x2={60 + Math.cos(a) * 42}
          y2={58 + Math.sin(a) * 42}
          className="stroke-steel"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="60" cy="58" r="3" className="fill-steel" />
        <text x="14" y="68" fontSize="7" className="fill-faint font-spec">
          booked
        </text>
        <text
          x="106"
          y="68"
          fontSize="7"
          textAnchor="end"
          className="fill-faint font-spec"
        >
          open
        </text>
      </svg>
      <div className="min-w-0">
        <p className="spec">Power reserve</p>
        <p className="mt-1 font-medium">
          {open
            ? `Fully wound: ${availability?.toLowerCase()}.`
            : "Wound down: booked for now."}
        </p>
        <a
          href={`mailto:${email}`}
          className="break-all text-steel underline underline-offset-[0.24em]"
        >
          {email}
        </a>
      </div>
    </div>
  );
}
