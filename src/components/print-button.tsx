'use client';

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="border-rule hover:border-fg rounded-sm border px-3 py-1 text-sm print:hidden"
    >
      Download PDF
    </button>
  );
}
