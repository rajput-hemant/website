import Link from 'next/link';
import { MarkdownLink } from './markdown-link';

const quietLink = 'no-underline hover:text-fg';

export function Footer() {
  return (
    <footer className="border-rule text-fg-muted border-t pt-6 pb-10 text-sm sm:pb-14">
      <ul className="flex flex-wrap gap-x-5 gap-y-1">
        <li>
          <a
            href="https://github.com/rajput-hemant"
            rel="me"
            className={quietLink}
          >
            GitHub
          </a>
        </li>
        <li>
          <Link href="/resume" className={quietLink}>
            Resume
          </Link>
        </li>
        <li>
          <MarkdownLink className={quietLink} />
        </li>
      </ul>
      <p className="mt-6">
        Set in Bricolage Grotesque, Fraunces and Martian Mono. Built with
        Next.js.
      </p>
    </footer>
  );
}
