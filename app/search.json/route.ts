import { buildSearchIndex } from "@/components/command/build-index";

export const dynamic = "force-static";

export async function GET() {
  return Response.json(await buildSearchIndex());
}
