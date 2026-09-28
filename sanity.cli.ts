import { defineCliConfig } from "sanity/cli";

import { dataset, projectId } from "./sanity/env";

export default defineCliConfig({
  api: { projectId, dataset },
  schemaExtraction: { path: "sanity/extract.json" },
  typegen: {
    path: ["./sanity/lib/**/*.ts", "./lib/data/**/*.ts"],
    schema: "sanity/extract.json",
    generates: "sanity.types.ts",
    overloadClientMethods: false,
  },
});
