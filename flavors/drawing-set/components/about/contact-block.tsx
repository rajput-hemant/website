"use client";

import * as React from "react";
import {
  ArrowLink,
  ExternalLink,
  TitleBlock,
} from "@/flavors/drawing-set/components/ui";
import { Check, Copy } from "lucide-react";

import type { Link as ProfileLink } from "@/lib/data/types";

const RESET_AFTER_MS = 1800;

/** The email as a `mailto:` link (works with no JS) plus a copy-to-clipboard button. */
function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = React.useState(false);
  const resetTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => () => clearTimeout(resetTimer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      window.location.href = `mailto:${email}`;
      return;
    }
    setCopied(true);
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), RESET_AFTER_MS);
  }

  return (
    <span className="inline-flex items-center gap-2 normal-case">
      <a href={`mailto:${email}`} className="underline decoration-line">
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${email} to the clipboard`}
        className="inline-flex size-8 items-center justify-center rounded-sm text-ink-faint transition-colors duration-(--duration-ui) fine:hover:bg-sheet fine:hover:text-ink"
      >
        {copied ? (
          <Check aria-hidden strokeWidth={2} className="size-3.5 text-accent" />
        ) : (
          <Copy aria-hidden strokeWidth={1.75} className="size-3.5" />
        )}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Email address copied" : ""}
      </span>
    </span>
  );
}

export type ContactTitleBlockProps = {
  email: string;
  links: readonly ProfileLink[];
  resumeUrl?: string;
  sheet: string;
  total: string;
  rev: string;
};

/** Contact, as the sheet's own title block: engineer, email, links and the printable resume. */
export function ContactTitleBlock({
  email,
  links,
  resumeUrl,
  sheet,
  total,
  rev,
}: ContactTitleBlockProps) {
  return (
    <TitleBlock
      sheet={sheet}
      total={total}
      rev={rev}
      rows={[
        { label: "Email", value: <CopyEmail email={email} /> },
        {
          label: "Links",
          value: (
            <ul className="flex flex-wrap gap-x-4 gap-y-1 normal-case">
              {links.map((link) => (
                <li key={link.url}>
                  <ExternalLink href={link.url} className="text-ink-soft">
                    {link.label}
                  </ExternalLink>
                </li>
              ))}
            </ul>
          ),
        },
        {
          label: "Resume",
          value: (
            <span className="normal-case">
              <ArrowLink href="/resume">Printable</ArrowLink>
              {resumeUrl && (
                <>
                  {" · "}
                  <ExternalLink href={resumeUrl} className="text-ink-soft">
                    Hosted
                  </ExternalLink>
                </>
              )}
            </span>
          ),
        },
      ]}
    />
  );
}
