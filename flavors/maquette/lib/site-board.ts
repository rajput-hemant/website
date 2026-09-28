import { getProjects } from "@/lib/data";
import { orderProjectsForCatalog } from "@/lib/data/project-order";

import { encodeBoard, pieces, sitePlan } from "./model";

/**
 * The home site model as a `data-scene-board`, for pages that show the model
 * as it stands, with every piece's pin: its catalogue number and name.
 */
export async function siteBoard() {
  const all = pieces(orderProjectsForCatalog(await getProjects()), new Date());
  return {
    board: encodeBoard(sitePlan(all)),
    pins: all.map((piece) => ({
      id: piece.project.slug,
      n: piece.n,
      name: piece.project.name,
    })),
  };
}
