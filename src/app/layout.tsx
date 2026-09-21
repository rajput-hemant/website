import type { Metadata } from 'next';
import { Footer } from '~/components/site/footer';
import { Header } from '~/components/site/header';
import { bricolage, fraunces, martianMono } from '~/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Hemant Rajput', template: '%s · Hemant Rajput' },
  description: 'Software engineer. Work, projects and notes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${fraunces.variable} ${martianMono.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <a
          href="#content"
          className="focus:bg-bg sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-10 focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <div className="max-w-measure px-gutter mx-auto flex w-full flex-1 flex-col">
          <Header />
          <div
            id="content"
            tabIndex={-1}
            className="flex-1 pt-6 pb-16 outline-none sm:pt-12 sm:pb-24"
          >
            {children}
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
