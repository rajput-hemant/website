import { ArrowLink } from "@/components/ui/arrow-link";
import { ExternalLink } from "@/components/ui/external-link";

/**
 * The printable /resume and, when the profile has one, the hosted copy. Each
 * link is its own element so a `MetaList` separates them.
 */
export function ResumeLinks({ resumeUrl }: { resumeUrl?: string }) {
  return (
    <>
      <span>
        <ArrowLink href="/resume" className="text-muted hover:text-foreground">
          Printable resume
        </ArrowLink>
      </span>
      {resumeUrl && (
        <span>
          <ExternalLink
            href={resumeUrl}
            underline={false}
            data-no-preview
            className="text-muted transition-colors duration-150 hover:text-foreground"
          >
            Resume
          </ExternalLink>
        </span>
      )}
    </>
  );
}
