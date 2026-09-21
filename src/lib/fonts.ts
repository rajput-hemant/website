import { Bricolage_Grotesque, Fraunces, Martian_Mono } from 'next/font/google';

export const bricolage = Bricolage_Grotesque({
  axes: ['opsz', 'wdth'],
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-sans',
});

export const fraunces = Fraunces({
  axes: ['opsz', 'SOFT', 'WONK'],
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-serif',
});

export const martianMono = Martian_Mono({
  axes: ['wdth'],
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-mono',
});
