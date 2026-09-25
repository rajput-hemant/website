import { defineConfig } from 'sanity';
import { presentationTool } from 'sanity/presentation';
import { structureTool } from 'sanity/structure';
import {
  ApproveAction,
  BanAuthorAction,
  HideAction,
  UnhideAction,
} from './src/sanity/actions/question';
import { dataset, projectId } from './src/sanity/env';
import { presentationResolve } from './src/sanity/presentation';
import {
  privateTypes,
  schemaTypes,
  singletonTypes,
} from './src/sanity/schemas';
import { structure } from './src/sanity/structure';

const singletonActions = new Set(['publish', 'discardChanges', 'restore']);

export default defineConfig({
  name: 'website',
  title: 'Portfolio',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [
    structureTool({ structure }),
    presentationTool({
      resolve: presentationResolve,
      previewUrl: {
        previewMode: {
          enable: '/api/draft-mode/enable',
          disable: '/api/draft-mode/disable',
        },
      },
    }),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(
        ({ schemaType }) =>
          !singletonTypes.has(schemaType) && !privateTypes.has(schemaType),
      ),
  },
  document: {
    actions: (input, context) => {
      if (singletonTypes.has(context.schemaType)) {
        return input.filter(
          ({ action }) => action !== undefined && singletonActions.has(action),
        );
      }

      if (context.schemaType === 'question') {
        return [
          ApproveAction,
          HideAction,
          UnhideAction,
          BanAuthorAction,
          ...input,
        ];
      }

      return input;
    },
  },
});
