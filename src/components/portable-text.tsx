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
  value: NonNullable<NonNullable<Profile>['bio']> | ExperienceRole['body'];
};

export function PortableText({ value }: PortableTextProps) {
  if (!value?.length) return null;

  return <SanityPortableText value={value} components={components} />;
}
