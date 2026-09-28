import { getProjects } from "@/lib/data";
import { orderProjectsForCatalog } from "@/lib/data/project-order";

import { encodeBoard, pieces, sitePlan } from "./model";

/** The home site model as a `data-scene-board`, for pages that show the model as it stands. */
export async function siteBoard() {
  const all = pieces(orderProjectsForCatalog(await getProjects()), new Date());
  return encodeBoard(sitePlan(all));
}
