import { buildLinkPreviewMap } from "@/lib/link-previews/build";

/** Built once at build time; hover cards read it lazily on the first hover. */
export const dynamic = "force-static";

export async function GET() {
  return Response.json(await buildLinkPreviewMap());
}
