/** Placeholder cover for a project without an image: an ink-raised box with a lid line and a mono label. */
export function SpecimenBox({ label }: { label: string }) {
  return (
    <div
      aria-hidden
      className="relative flex aspect-[16/10] w-full flex-col items-center justify-center overflow-hidden rounded-md border border-hairline bg-ink-sunken"
    >
      <span className="absolute inset-x-6 top-[38%] border-t border-hairline" />
      <span className="px-6 text-center font-mono text-mono-xs tracking-[0.14em] text-pencil uppercase">
        Specimen
        <br />
        {label}
      </span>
    </div>
  );
}
