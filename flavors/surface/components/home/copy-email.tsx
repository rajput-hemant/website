"use client";

import { cn } from "@/flavors/surface/lib/utils";

import { useCopyEmail } from "@/components/semantic/copy-email/use-copy-email";

/**
 * The address as a real mailto link, plus a small key that copies it. The
 * key's legend confirms for two seconds, and a live region says so.
 */
export function CopyEmail({
  email,
  className,
}: {
  email: string;
  className?: string;
}) {
  const { copied, copy } = useCopyEmail(email, 2000);

  return (
    <div
      className={cn("flex flex-wrap items-center gap-x-3 gap-y-2", className)}
    >
      <a
        href={`mailto:${email}`}
        className="border-b border-seam pb-px font-medium transition-[border-color] duration-150 fine:hover:border-ink"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        className="key key-sm min-w-[4.5rem]"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <span role="status" className="sr-only">
        {copied ? "Email address copied" : ""}
      </span>
    </div>
  );
}
