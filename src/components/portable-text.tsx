import { PortableText as SanityPortableText } from '@portabletext/react';
import type { PortableTextComponents } from '@portabletext/react';
import type { ExperienceRole, Profile } from '~/lib/data';

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => <code>{children}</code>,
    link: ({ children, value }) =>
      value?.href ? <a href={value.href}>{children}</a> : children,
  },
};

type PortableTextProps = {
  value:
    | NonNullable<NonNullable<Profile>['bio']>
    | NonNullable<ExperienceRole['body']>;
};

export function PortableText({ value }: PortableTextProps) {
  return <SanityPortableText value={value} components={components} />;
}
