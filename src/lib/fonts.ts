import { Bricolage_Grotesque, Fraunces, Martian_Mono } from 'next/font/google';

export const bricolage = Bricolage_Grotesque({
  axes: ['opsz'],
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-bricolage',
});

export const fraunces = Fraunces({
  axes: ['opsz', 'SOFT', 'WONK'],
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-fraunces',
});

export const martianMono = Martian_Mono({
  axes: ['wdth'],
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-martian-mono',
});
