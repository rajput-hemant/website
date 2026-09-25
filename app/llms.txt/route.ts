import { llmsTxt } from "@/lib/markdown/llms-txt";

export const dynamic = "force-static";

export async function GET() {
  return new Response(await llmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
