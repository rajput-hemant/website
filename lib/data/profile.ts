import type { PROFILE_QUERY_RESULT } from "@/sanity.types";

import { urlForImage } from "@/sanity/lib/image";

import { optional, toRichText } from "./shared";
import type { Image, Profile } from "./types";

type ProfileResult = NonNullable<PROFILE_QUERY_RESULT>;
type AvatarResult = ProfileResult["avatar"];

function mapAvatar(avatar: AvatarResult): Image | null {
  const asset = avatar?.asset;
  const dimensions = asset?.metadata?.dimensions;
  if (!avatar || !asset || !dimensions?.width || !dimensions.height) {
    return null;
  }

  const crop = avatar.crop;
  const visibleWidth = 1 - (crop?.left ?? 0) - (crop?.right ?? 0);
  const visibleHeight = 1 - (crop?.top ?? 0) - (crop?.bottom ?? 0);
  const lqip = asset.metadata?.lqip;

  return {
    url: urlForImage({
      asset: { _id: asset._id },
      crop: crop ?? undefined,
      hotspot: avatar.hotspot ?? undefined,
    }).url(),
    alt: avatar.alt ?? "",
    width: Math.round(dimensions.width * visibleWidth),
    height: Math.round(dimensions.height * visibleHeight),
    ...(lqip ? { blurDataUrl: lqip } : {}),
  };
}

export function mapProfile(result: ProfileResult): Profile {
  return {
    name: result.name ?? "",
    headline: result.headline ?? "",
    bio: toRichText(result.bio),
    availability: optional(result.availability),
    avatar: mapAvatar(result.avatar),
    location: result.location ?? "",
    email: result.email ?? "",
    links: (result.links ?? []).flatMap(({ label, url }) =>
      label && url ? [{ label, url }] : []
    ),
    resumeNote: optional(result.resumeNote),
  };
}
