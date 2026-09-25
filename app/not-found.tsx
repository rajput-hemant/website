import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/site/container";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SkipLink } from "@/components/site/skip-link";

export const metadata: Metadata = {
  title: "Page not found",
  description: "There is nothing at this address.",
  robots: { index: false },
};

const suggestions = [
  { href: "/", label: "Home", hint: "Who I am, in a few lines" },
  { href: "/work", label: "Work", hint: "Experience, skills and education" },
  { href: "/projects", label: "Projects", hint: "Things I have built" },
  { href: "/ask", label: "Ask", hint: "Ask me anything, or just say hi" },
] as const;

// Renders outside the (site) group, so it brings its own header and footer.
export default function NotFound() {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="content" tabIndex={-1} className="flex-1 outline-none">
        <Container className="pt-16 sm:pt-24">
          <p className="meta text-subtle">Error 404</p>
          <h1 className="mt-5 display text-display text-foreground">
            Nothing here.
          </h1>
          <p className="mt-5 max-w-[44ch] text-lg text-muted">
            The page you were after has moved or never existed. One of these
            might be what you wanted.
          </p>
          <nav aria-label="Suggested pages" className="mt-12">
            <ul className="border-t border-border">
              {suggestions.map((item) => (
                <li key={item.href} className="border-b border-border">
                  <Link
                    href={item.href}
                    className="group flex items-baseline justify-between gap-6 py-4"
                  >
                    <span className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                      <span className="display text-xl text-foreground transition-colors group-hover:text-accent">
                        {item.label}
                      </span>
                      <span className="text-sm text-muted">{item.hint}</span>
                    </span>
                    <ArrowRight
                      aria-hidden
                      strokeWidth={1.75}
                      className="size-4 shrink-0 translate-y-0.5 text-subtle transition-[translate,color] duration-200 ease-snappy group-hover:translate-x-1 group-hover:text-accent"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
