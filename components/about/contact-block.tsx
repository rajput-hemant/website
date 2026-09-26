"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import type { Link as ProfileLink } from "@/lib/data/types";
import { ArrowLink, ExternalLink } from "@/components/ui";

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
    <span className="inline-flex items-center gap-2">
      <a href={`mailto:${email}`} className="underline decoration-rule">
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${email} to the clipboard`}
        className="inline-flex size-8 items-center justify-center rounded-sm text-pencil transition-colors duration-(--duration-ui) hover:bg-ink-raised hover:text-paper"
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

export function ContactBlock({
  email,
  links,
  resumeUrl,
}: {
  email: string;
  links: readonly ProfileLink[];
  resumeUrl?: string;
}) {
  return (
    <div className="grid gap-4 border-t border-hairline pt-6 text-sm">
      <CopyEmail email={email} />
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {links.map((link) => (
          <li key={link.url}>
            <ExternalLink href={link.url} className="text-graphite">
              {link.label}
            </ExternalLink>
          </li>
        ))}
      </ul>
      <p>
        <ArrowLink href="/resume">Printable resume</ArrowLink>
        {resumeUrl && (
          <>
            {" · "}
            <ExternalLink href={resumeUrl} className="text-graphite">
              Hosted resume
            </ExternalLink>
          </>
        )}
      </p>
    </div>
  );
}
