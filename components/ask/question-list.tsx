import { type Question } from "@/lib/data/types";
import { RevealGroup, RevealItem } from "@/components/interaction/reveal";

import { QuestionEntry } from "./question-entry";

export function QuestionList({ questions }: { questions: Question[] }) {
  if (questions.length === 0) return <EmptyQuestions />;

  return (
    <RevealGroup as="ol" className="border-t border-border">
      {questions.map((question) => (
        <RevealItem
          as="li"
          key={question.id}
          className="border-b border-border py-10"
        >
          <QuestionEntry question={question} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

function EmptyQuestions() {
  return (
    <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <p className="display text-2xl text-foreground">
        No questions yet. Be the first.
      </p>
      <p className="mx-auto mt-3 max-w-[40ch] text-muted">
        Answered messages show up here, newest first. Yours could be the one
        that starts it.
      </p>
    </div>
  );
}
