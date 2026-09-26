import {
  askQuestionImageAlt,
  askQuestionImageParams,
  renderAskQuestionImage,
} from "@/components/og/ask";
import { ogSize } from "@/components/og/theme";

export const alt = askQuestionImageAlt;
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return askQuestionImageParams();
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return renderAskQuestionImage((await params).slug);
}
