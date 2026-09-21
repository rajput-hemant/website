import Link from 'next/link';

type FooterProps = {
  path: `/${string}`;
};

export function Footer({ path }: FooterProps) {
  const markdownHref = path === '/' ? '/index.md' : `${path}.md`;

  return (
    <footer className="border-rule text-fg-muted mt-auto border-t pt-6 pb-10 text-sm sm:pb-14">
      <ul className="flex flex-wrap gap-x-5 gap-y-1">
        <li>
          <a
            href="https://github.com/rajput-hemant"
            rel="me"
            className="quiet-link"
          >
            GitHub
          </a>
        </li>
        <li>
          <Link href="/resume" className="quiet-link">
            Resume
          </Link>
        </li>
        <li>
          <a href={markdownHref} className="quiet-link">
            View as markdown
          </a>
        </li>
      </ul>
      <p className="mt-6">
        Set in Bricolage Grotesque, Fraunces and Martian Mono. Built with
        Next.js.
      </p>
    </footer>
  );
}
