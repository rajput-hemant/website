import Image from 'next/image';
import Avatar from 'boring-avatars';
import { formatDate } from '~/lib/format';

const PALETTE = ['#4f5d75', '#6b8a99', '#a3b8a1', '#d9c9a8', '#c98b6b'];

export function AuthorAvatar({
  name,
  avatarUrl,
  seed,
  size = 22,
}: {
  name: string;
  avatarUrl: string | null;
  seed: string | null;
  size?: number;
}) {
  return avatarUrl ? (
    <Image
      src={avatarUrl}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-full"
    />
  ) : (
    <Avatar
      name={seed ?? name}
      variant="marble"
      colors={PALETTE}
      size={size}
      aria-hidden
      className="shrink-0"
    />
  );
}

export function When({ iso }: { iso: string }) {
  if (!iso) return null;

  return <time dateTime={iso}>{formatDate(iso, { dateStyle: 'medium' })}</time>;
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="border-rule text-fg-muted rounded-sm border px-1 font-mono text-xs">
      {children}
    </span>
  );
}

export function MessageFrame({
  avatar,
  header,
  children,
  className = '',
}: {
  avatar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <li className={`flex gap-3 ${className}`}>
      <div className="flex h-lh shrink-0 items-center text-sm">{avatar}</div>
      <div className="min-w-0 flex-1">
        <div className="flex min-h-lh flex-wrap items-center gap-x-2 text-sm">
          {header}
        </div>
        <div className="mt-1">{children}</div>
      </div>
    </li>
  );
}
