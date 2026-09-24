import { ImageResponse } from 'next/og';
import { siteConfig } from '~/content/site';
import { getProfile } from '~/lib/data';
import { getOgFonts } from '~/lib/og/fonts';
import { urlForImage } from '~/sanity/lib/image';

export const alt = siteConfig.name;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

const ogFonts = await getOgFonts();

const palette = {
  bg: '#f8f9fa',
  fg: '#1c1e21',
  muted: '#5c6570',
};

export default async function Image() {
  const profile = await getProfile();
  const name = profile?.name ?? siteConfig.name;
  const headline =
    profile?.headline ?? 'Software engineer. Work, projects and notes.';
  const avatarUrl =
    profile?.avatar?.asset != null
      ? urlForImage(profile.avatar).width(256).height(256).fit('crop').url()
      : null;

  if (avatarUrl) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            backgroundColor: palette.bg,
            padding: 80,
            alignItems: 'center',
            gap: 48,
          }}
        >
          <img
            src={avatarUrl}
            width={200}
            height={200}
            alt=""
            style={{ borderRadius: 16, objectFit: 'cover' }}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              flex: 1,
            }}
          >
            <div
              style={{
                fontFamily: 'Bricolage Grotesque',
                fontSize: 56,
                fontWeight: 500,
                color: palette.fg,
                lineHeight: 1.1,
              }}
            >
              {name}
            </div>
            <div
              style={{
                fontFamily: 'Bricolage Grotesque',
                fontSize: 32,
                fontWeight: 400,
                color: palette.muted,
                lineHeight: 1.35,
                maxWidth: 720,
              }}
            >
              {headline}
            </div>
          </div>
        </div>
      ),
      {
        ...size,
        fonts: ogFonts,
      },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: palette.bg,
          padding: 80,
          justifyContent: 'center',
          gap: 28,
        }}
      >
        <div
          style={{
            fontFamily: 'Fraunces',
            fontSize: 88,
            fontWeight: 500,
            color: palette.fg,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: 'Bricolage Grotesque',
            fontSize: 34,
            fontWeight: 400,
            color: palette.muted,
            lineHeight: 1.35,
            maxWidth: 900,
          }}
        >
          {headline}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: ogFonts,
    },
  );
}
