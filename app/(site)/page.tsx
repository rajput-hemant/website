import { ArrowRight } from "lucide-react";

import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";
import { Section } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "@/components/ui/external-link";
import { Kbd } from "@/components/ui/kbd";
import { SectionHeading } from "@/components/ui/section-heading";
import { Separator } from "@/components/ui/separator";
import { Tag, TagList } from "@/components/ui/tag";

// Temporary style guide; the pages agent replaces this file with the home page.

const swatches = [
  "background",
  "surface",
  "surface-2",
  "border",
  "subtle",
  "muted",
  "foreground",
  "accent-soft",
  "accent",
] as const;

const swatchClass: Record<(typeof swatches)[number], string> = {
  background: "bg-background",
  surface: "bg-surface",
  "surface-2": "bg-surface-2",
  border: "bg-border",
  subtle: "bg-subtle",
  muted: "bg-muted",
  foreground: "bg-foreground",
  "accent-soft": "bg-accent-soft",
  accent: "bg-accent",
};

export default function StyleGuidePage() {
  return (
    <Container>
      <PageHeader
        title="Hemant Rajput"
        description="Fullstack engineer crafting fast, accessible, pixel-perfect web experiences with TypeScript, React and Next.js."
        meta={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Style guide</span>
            <Separator orientation="vertical" className="h-3" />
            <span>Updated Sep 2026</span>
          </span>
        }
      />

      <Section className="pt-0">
        <SectionHeading
          eyebrow="Tokens"
          title="Paper, ink and one accent"
          link={{ href: "/work", label: "All work" }}
        />
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {swatches.map((name) => (
            <li key={name} className="grid gap-2">
              <span
                className={`aspect-square rounded-md border border-border ${swatchClass[name]}`}
              />
              <span className="truncate meta text-subtle">{name}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <SectionHeading eyebrow="Type" title="A scale in minor thirds" />
        <div className="grid gap-5">
          <p className="display text-5xl">Fraunces display</p>
          <p className="display text-3xl">Quietly precise interfaces</p>
          <p className="text-xl font-semibold">Bricolage Grotesque, 24</p>
          <p className="text-lg text-muted">
            Body copy at 17px with a 1.7 line height, set for reading.
          </p>
          <p className="meta text-subtle">Martian mono · metadata · 2021–now</p>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Prose" title="Portable Text output" />
        <div className="prose">
          <p>
            I build <strong>fast, accessible interfaces</strong> and the systems
            behind them. Most recently at{" "}
            <a href="https://example.com">a product studio</a>, where I led the
            move to the App Router and cut the median LCP{" "}
            <em>by almost half</em>.
          </p>
          <p>
            Day to day that means React Server Components, a strict{" "}
            <code>tsconfig.json</code>, and design tokens that survive a
            redesign. Some things I care about:
          </p>
          <ul>
            <li>Text that loads first and reads well at any width.</li>
            <li>Keyboard paths that feel designed, not patched.</li>
            <li>
              Motion that answers the visitor and then gets out of the way.
            </li>
          </ul>
          <h2>A heading inside prose</h2>
          <ol>
            <li>Measure the thing.</li>
            <li>Change one variable.</li>
            <li>Measure again.</li>
          </ol>
          <blockquote>
            Craft over decoration; interaction as a layer, never a toll.
          </blockquote>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Components" title="Small, shared pieces" />
        <div className="grid gap-8">
          <TagList tags={["TypeScript", "React", "Next.js", "Sanity", "Bun"]} />
          <div className="flex flex-wrap items-center gap-2">
            <Tag variant="accent">Featured</Tag>
            <Tag>2024 – now</Tag>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <ExternalLink href="https://github.com/rajput-hemant">
              GitHub
            </ExternalLink>
            <ExternalLink href="https://www.linkedin.com">
              LinkedIn
            </ExternalLink>
            <a href="/work" className="link">
              Internal link
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">
              Get in touch <ArrowRight aria-hidden />
            </Button>
            <Button variant="accent">Ask a question</Button>
            <Button>Download CV</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
          <p className="text-sm text-muted">
            Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search.
          </p>
        </div>
      </Section>
    </Container>
  );
}
