import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

type OgFont = {
  name: string;
  data: ArrayBuffer;
  style: 'normal';
  weight: 400 | 500;
};

async function readFont(relativePath: string): Promise<ArrayBuffer> {
  const filePath = join(process.cwd(), 'node_modules', relativePath);
  const buffer = await readFile(filePath);
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  );
}

export async function getOgFonts(): Promise<OgFont[]> {
  const [fraunces, bricolage400, bricolage500] = await Promise.all([
    readFont('@fontsource/fraunces/files/fraunces-latin-500-normal.woff'),
    readFont(
      '@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-400-normal.woff',
    ),
    readFont(
      '@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-500-normal.woff',
    ),
  ]);

  return [
    {
      name: 'Fraunces',
      data: fraunces,
      style: 'normal',
      weight: 500,
    },
    {
      name: 'Bricolage Grotesque',
      data: bricolage400,
      style: 'normal',
      weight: 400,
    },
    {
      name: 'Bricolage Grotesque',
      data: bricolage500,
      style: 'normal',
      weight: 500,
    },
  ];
}
