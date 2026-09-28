import { getProfile } from "@/lib/data";
import { SiteCard } from "@/components/og/og-card";
import {
  loadAvatar,
  ogDisplayUrl,
  renderOgImage,
} from "@/components/og/render";
import { ogSize } from "@/components/og/theme";

// Image `alt` exports are static strings, so they don't name the owner.
export const alt = "Name, headline and address of this site";
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
