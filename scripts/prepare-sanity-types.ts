import { readFile, writeFile } from 'node:fs/promises';

const path = new URL('../src/sanity/types.ts', import.meta.url);
const bridge = `// Lets @sanity/client releases that predate the global registry read it too
declare module '@sanity/client' {
  interface SanityQueries extends globalThis.SanityQueries {}
}
`;
const source = await readFile(path, 'utf8');

if (!source.includes(bridge)) {
  throw new Error('Sanity TypeGen compatibility bridge was not found.');
}

await writeFile(path, source.replace(bridge, ''));
