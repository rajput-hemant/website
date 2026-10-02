# Identity and profile

Status: DRAFT, not live-verified. Last live proof: none. Open problems and gaps: [verification ledger](../../../../docs/checks/verification-issues.md) (entries tagged `identity`).

Who the site is about comes from the profile in the data layer (`lib/data/identity.ts`: name, first name, short name, handle, initials, description, URL, locale), resolved once per layout and published to client code through `SiteIdentityProvider`. Scenes run in their own React root, so they read the identity the provider published (`components/semantic/identity/site-identity.tsx`). `content/site.ts` is only the fallback when the profile has nothing to derive a field from. `NEXT_PUBLIC_OWNER_BRANDING=true` shows owner-only art (Minimal's handwritten signature); unset, those elements render the resolved name in the edition's display type.

## Sub-features

- `identity-text` shows the resolved name, handle, initials and description in headers, footers, wordmarks, page titles, hero text and 404s of every edition.
- `identity-scenes` shows the same identity inside 3D scenes (plates, handles, glyph text) once the scene is live, and in the poster before it.
- `identity-metadata` carries the identity in document titles, Open Graph and Twitter images, the icon, `llms.txt`, markdown mirrors and the sitemap.
- `identity-branding` shows Minimal's signature only when `NEXT_PUBLIC_OWNER_BRANDING=true`.
- `identity-leaks` keeps the owner's name and handle out of source outside content, docs, tests and repository metadata (`bun run check:identity`).

## How to get to it (user POV)

- Read any page's header, footer and `h1` in any edition.
- Open the page source and the tab title; open `/opengraph-image`, `/twitter-image`, `/icon`, `/apple-icon`, `/llms.txt`, `/index.md`.
- Wait for a scene slot to go live and read its text and accessible label.
- Open `/lab/signature-field` and read the stage label and hint.

## Driving it with the chosen browser skill (not supplied; hold in force)

Preconditions:

- Fallback content is active, so the profile is the bundled one (`content/fallback/profile.ts`); the expected name, handle and initials are whatever `getSiteIdentity()` derives from it. Read them first from `content/fallback/profile.ts` through `lib/data/identity.ts`, and write them into the evidence notes.
- Existing coverage to cite, not duplicate: `lib/data/__tests__/identity.test.ts` (resolution rules), `scripts/check-identity.ts` (leaks), `flavors/__tests__` and `e2e/home.spec.ts` (Minimal's contact row follows the profile).

- **Text.** In each edition load `/`, `/about`, `/resume` and a 404 URL. The name and handle on screen match the profile-derived identity and appear nowhere else. Evidence: ARIA snapshot per page, search of the text for the expected name.
- **Scene.** On a WebGL2 browser wait for the scene to go live in an edition with identity text in 3D (Timetable's plate and handle; Press, whose identity fix landed in `aad74b8`) and read the visible text. It matches the poster's. Evidence: screenshots of poster and live frame at the same viewport, tier signals.
- **Metadata.** `curl -s http://127.0.0.1:3071/llms.txt | head` and the `<title>` of `/` use the identity. `curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://127.0.0.1:3071/opengraph-image` is 200 `image/png`. Evidence: output.
- **Branding flag.** With a build without the variable, Minimal's home shows the display-type name where the signature would be; with a separate build with `NEXT_PUBLIC_OWNER_BRANDING=true`, the handwritten signature shows (`e2e/home.spec.ts` asserts it is present, not in the footer). Evidence: screenshots of both builds.
- **Another person's data.** Not drivable today: there is no disposable fixture profile and owner content must not change. This is a recorded gap, not a step to improvise.

## Gotchas

- A passing `check:identity` proves source hygiene only; it says nothing about what a running page or scene shows.
- Scenes mount after hydration, so an identity read before the scene is live comes from the poster.
- Pointing the data layer at someone else's profile renames everything at once, which is the property worth proving live, and is currently unprovable without a fixture.
