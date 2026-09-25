import Link from 'next/link';
import { Customize } from '~/components/customize/customize';
import { siteConfig } from '~/content/site';
import { Signature } from './signature';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <header className="flex flex-col items-center gap-y-4 py-6 sm:gap-y-5 sm:py-10">
      <Link
        href="/"
        aria-label={`${siteConfig.name}, home`}
        className="rounded-sm"
      >
        <Signature />
      </Link>
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <nav aria-label="Main">
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="quiet-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-x-2">
          <ThemeToggle />
          <Customize />
        </div>
      </div>
    </header>
  );
}
