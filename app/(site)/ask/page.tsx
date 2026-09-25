import type { Metadata } from "next";

import { getQuestions } from "@/lib/data";
import { AskForm } from "@/components/ask/ask-form";
import { AskPagination } from "@/components/ask/ask-pagination";
import { QuestionList } from "@/components/ask/question-list";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";
import { Section } from "@/components/site/section";
import { SectionHeading } from "@/components/ui/section-heading";

import { askFeedAlternates } from "./_lib/metadata";
import { ASK_PAGE_SIZE, askPageCount } from "./_lib/pagination";

const title = "Ask me anything, or just say hi.";
const description =
  "Questions, comments and hellos. Every message is read and moderated before it appears here with my answer.";

export const metadata: Metadata = {
  title: "Ask",
  description,
  alternates: { canonical: "/ask", types: askFeedAlternates },
  openGraph: { title, description, url: "/ask" },
};

export default async function AskPage() {
  const { items, total } = await getQuestions({
    page: 1,
    pageSize: ASK_PAGE_SIZE,
  });

  return (
    <Container>
      <PageHeader
        title={title}
        description="Curious about something I built, how I work, or anything else? Every message is read and moderated by hand, and the ones I answer appear on this page. Your email is never shown."
        meta={
          <a href="/ask/feed.xml" className="link hover:text-foreground">
            RSS feed
          </a>
        }
      />

      <Section className="pt-0">
        <AskForm />
      </Section>

      <Section aria-labelledby="answered">
        <SectionHeading
          id="answered"
          eyebrow={total > 0 ? `${total} answered` : "Answered"}
          title="From the inbox"
        />
        <QuestionList questions={items} />
        <AskPagination
          page={1}
          pageCount={askPageCount(total)}
          className="mt-10"
        />
      </Section>
    </Container>
  );
}
