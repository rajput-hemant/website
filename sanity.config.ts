"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";

import { resolveDocumentActions } from "./sanity/actions";
import { apiVersion, dataset, projectId, studioBasePath } from "./sanity/env";
import { schemaTypes, singletonTypes } from "./sanity/schemas";
import { structure } from "./sanity/structure";

export default defineConfig({
  name: "default",
  title: "Hemant Rajput",
  basePath: studioBasePath,
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
  document: {
    actions: resolveDocumentActions,
    newDocumentOptions: (prev) =>
      prev.filter(({ templateId }) => !singletonTypes.has(templateId)),
  },
  plugins: [
    structureTool({ structure }),
    presentationTool({
      previewUrl: {
        previewMode: {
          enable: "/api/draft-mode/enable",
          disable: "/api/draft-mode/disable",
        },
      },
    }),
    ...(process.env.NODE_ENV === "development"
      ? [visionTool({ defaultApiVersion: apiVersion })]
      : []),
  ],
});
