import { defineCliConfig } from 'sanity/cli';
import { dataset, projectId } from './src/sanity/env';

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  typegen: {
    path: './src/**/*.{ts,tsx}',
    schema: './schema.json',
    generates: './src/sanity/types.ts',
    overloadClientMethods: true,
  },
});
