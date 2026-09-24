import Image from 'next/image';
import type { Profile } from '~/lib/data';
import { urlForImage } from '~/sanity/lib/image';

type AvatarProps = {
  avatar: NonNullable<Profile>['avatar'];
  size: number;
};

export function Avatar({ avatar, size }: AvatarProps) {
  if (!avatar?.asset) return null;

  return (
    <Image
      src={urlForImage(avatar)
        .width(size * 2)
        .height(size * 2)
        .fit('crop')
        .auto('format')
        .url()}
      alt={avatar.alt ?? ''}
      width={size}
      height={size}
      className="shrink-0 rounded-full object-cover"
    />
  );
}
