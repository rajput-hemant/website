import { getProfile } from "@/lib/data";
import { siteCardAlt } from "@/lib/metadata";
import { SiteCard } from "@/components/og/og-card";
import {
  loadAvatar,
  ogDisplayUrl,
  renderOgImage,
} from "@/components/og/render";
import { ogSize } from "@/components/og/theme";

export const alt = siteCardAlt;
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  const profile = await getProfile();
  const avatar = await loadAvatar(profile.avatar);

  return renderOgImage(
    <SiteCard
      name={profile.name}
      headline={profile.headline}
      url={ogDisplayUrl()}
      avatar={avatar}
    />
  );
}
