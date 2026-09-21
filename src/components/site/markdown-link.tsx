'use client';

import { usePathname } from 'next/navigation';

export function MarkdownLink({ className }: { className?: string }) {
  const pathname = usePathname();
  const href = pathname === '/' ? '/index.md' : `${pathname}.md`;

  return (
    <a href={href} className={className}>
      View as markdown
    </a>
  );
}
