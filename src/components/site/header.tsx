import Link from 'next/link';
import { siteConfig } from '~/content/site';
import { ThemeToggle } from './theme-toggle';
import { Wordmark } from './wordmark';

export function Header() {
  return (
    <header className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 py-6 sm:py-10">
      <Link href="/">
        <Wordmark />
      </Link>
      <div className="flex items-center gap-x-5">
        <nav aria-label="Main">
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="quiet-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
