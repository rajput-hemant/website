"use client";

/** Opens the print dialog, where "Save as PDF" is the download. */
export function PrintButton() {
  return (
    <button
      type="button"
      data-print="hide"
      onClick={() => window.print()}
      className="key key-sm"
    >
      Print or save as PDF
    </button>
  );
}
