import Link from 'next/link';
import { Wordmark } from './wordmark';

const navigation = [
  { href: '/work', label: 'Work' },
  { href: '/projects', label: 'Projects' },
  { href: '/now', label: 'Now' },
  { href: '/changelog', label: 'Changelog' },
] as const;

export function Header() {
  return (
    <header className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 py-6 sm:py-10">
      <Link href="/" className="hover:text-fg no-underline">
        <Wordmark />
      </Link>
      <nav aria-label="Main">
        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {navigation.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-fg-muted hover:text-fg no-underline"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
