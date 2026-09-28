import type { MetadataRoute } from "next";
import { DEFAULT_FLAVOR } from "@/flavors/registry";

import { labExperiments } from "@/content/lab";
import { pages } from "@/content/site";
import { getChangelog, getNow } from "@/lib/data";
import {
  getAllPublishedQuestions,
  questionDate,
} from "@/lib/markdown/questions";
import { absoluteUrl } from "@/lib/url";

/** The newest of the given dates, or `undefined` when none is known. */
function latest(...dates: (string | undefined)[]): string | undefined {
  return dates
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [now, changelog, questions] = await Promise.all([
    getNow(),
    getChangelog(),
    getAllPublishedQuestions(),
  ]);
  const newestQuestion = questions[0] && questionDate(questions[0]);

  const lastModifiedByPath: Record<string, string | undefined> = {
    "/": latest(now.updatedAt, changelog[0]?.date),
    "/now": latest(now.updatedAt, changelog[0]?.date),
    "/changelog": changelog[0]?.date,
    "/ask": newestQuestion,
  };

  return [
    // Crawlers get the default edition, so skip pages it only redirects away from.
    ...pages
      .filter((page) => !("only" in page) || page.only === DEFAULT_FLAVOR)
      .map((page) => ({
        url: absoluteUrl(page.path),
        lastModified: lastModifiedByPath[page.path],
      })),
    ...questions.map((question) => ({
      url: absoluteUrl(`/ask/${question.slug}`),
      lastModified: questionDate(question),
    })),
    ...labExperiments.map((experiment) => ({
      url: absoluteUrl(`/lab/${experiment.slug}`),
    })),
  ];
}
