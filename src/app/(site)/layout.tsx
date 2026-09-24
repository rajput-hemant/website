import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { PrefsSync } from '~/components/customize/prefs-sync';
import { SmoothScroll } from '~/components/scroll/smooth-scroll';
import { Header } from '~/components/site/header';
import { siteConfig } from '~/content/site';
import { bricolage, fraunces, martianMono } from '~/lib/fonts';
import '../globals.css';

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
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
      suppressHydrationWarning
      className={`${bricolage.variable} ${fraunces.variable} ${martianMono.variable}`}
    >
      <body className="flex min-h-dvh flex-col px-4">
        <PrefsSync />
        <ThemeProvider
          attribute="data-theme"
          themes={['light', 'dark']}
          enableSystem={false}
          defaultTheme="light"
          disableTransitionOnChange
        >
          <SmoothScroll />
          <a
            href="#content"
            className="focus:bg-bg sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-10 focus:px-3 focus:py-2"
          >
            Skip to content
          </a>
          <div className="max-w-measure mx-auto flex w-full flex-1 flex-col">
            <Header />
            <div
              id="content"
              tabIndex={-1}
              className="flex flex-1 flex-col gap-16 pt-6 outline-none sm:gap-24 sm:pt-12"
            >
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
