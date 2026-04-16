# SEO Metadata Design - Masjid Baiturrahim Sungai Bambu

## Context

This design defines complete, production-ready SEO metadata primitives for the Next.js App Router frontend:

- Static sitemap at `app/sitemap.ts`
- Robots config at `app/robots.ts`
- Dynamic Open Graph image at `app/opengraph-image.tsx`
- Expanded global metadata in `app/layout.tsx`

Brand and deployment constants:

- Name: `Masjid Baiturrahim Sungai Bambu`
- Domain: `https://masjidbaiturrahimsb.org`
- Locale: `id_ID`
- Tagline: `Pusat Ibadah dan Pembinaan Umat`
- Description: `Website resmi Masjid Baiturrahim Sungai Bambu - Informasi kegiatan, donasi, dan layanan jamaah.`

## Goals

1. Ensure crawler-friendly discovery via sitemap and robots.
2. Ensure social sharing previews are complete and consistent across Open Graph and Twitter.
3. Keep implementation aligned with native Next.js metadata routes and conventions.
4. Keep scope intentionally minimal and static for reliable first release.

## Non-Goals

- Dynamic sitemap generation from database or CMS.
- Per-page SEO customization for all routes.
- External SEO provider integrations.

## Chosen Approach

Use native Next.js metadata route files and metadata object configuration directly in App Router:

- `app/sitemap.ts` with static URL entries for public routes.
- `app/robots.ts` that allows all crawling and points to the generated sitemap endpoint.
- `app/opengraph-image.tsx` returning `ImageResponse` sized `1200x630` with Islamic visual theme.
- `app/layout.tsx` metadata configured with `metadataBase`, canonical, Open Graph, and Twitter card fields.

This approach is selected because it is framework-native, low-maintenance, and fully satisfies current requirements without introducing unnecessary abstraction.

## Design Details

### 1. `app/sitemap.ts`

- Export `MetadataRoute.Sitemap`.
- Use absolute canonical base domain: `https://masjidbaiturrahimsb.org`.
- Include static entries for public-facing pages only.
- For each entry, define:
  - `url`
  - `lastModified` (generated at runtime for build/request context)
  - optional `changeFrequency`
  - optional `priority` (homepage highest)

Constraints:

- Do not include protected dashboard/auth/internal pages.
- Keep entries deterministic and human-reviewable.

### 2. `app/robots.ts`

- Export `MetadataRoute.Robots`.
- Set rules to allow all:
  - `userAgent: '*'`
  - `allow: '/'`
- Set sitemap URL explicitly:
  - `https://masjidbaiturrahimsb.org/sitemap.xml`

### 3. `app/opengraph-image.tsx`

- Use `ImageResponse` from `next/og`.
- Output dimensions: `1200x630`.
- Visual style:
  - Dominant dark green background
  - Islamic-inspired accent treatment (subtle geometric ornament feel)
  - Strong visual contrast for readability
- Content:
  - Primary text: `Masjid Baiturrahim Sungai Bambu`
  - Secondary text: `Pusat Ibadah dan Pembinaan Umat`

Technical constraints:

- Avoid network-dependent assets to reduce runtime failure risk.
- Keep implementation deterministic and fast.

### 4. `app/layout.tsx` Metadata Expansion

Global metadata contract:

- `metadataBase: new URL('https://masjidbaiturrahimsb.org')`
- `title`:
  - `default: 'Masjid Baiturrahim Sungai Bambu'`
  - `template: '%s | Masjid Baiturrahim Sungai Bambu'`
- `description`:
  - `Website resmi Masjid Baiturrahim Sungai Bambu - Informasi kegiatan, donasi, dan layanan jamaah.`
- `alternates.canonical: '/'`
- `openGraph`:
  - `type: 'website'`
  - `locale: 'id_ID'`
  - `url: '/'`
  - `siteName: 'Masjid Baiturrahim Sungai Bambu'`
  - `title`, `description`
  - `images: ['/opengraph-image']` with size metadata `1200x630`
- `twitter`:
  - `card: 'summary_large_image'`
  - `title`, `description`
  - `images: ['/opengraph-image']`

Consistency rules:

- All SEO surfaces must reference the same canonical domain.
- Name, description, and locale must remain identical across metadata fields unless explicitly overridden in future work.

## Alternatives Considered

1. Shared `lib/seo.ts` constants module:
   - Pros: central constants, easier reuse
   - Cons: unnecessary indirection for current scope
2. Fully dynamic metadata via `generateMetadata` and API sources:
   - Pros: high flexibility
   - Cons: over-engineered for current static needs

Both were rejected for now in favor of direct native metadata configuration.

## Acceptance Criteria

1. `https://masjidbaiturrahimsb.org/sitemap.xml` is generated and valid with public URLs.
2. `https://masjidbaiturrahimsb.org/robots.txt` allows crawling and points to sitemap URL.
3. `https://masjidbaiturrahimsb.org/opengraph-image` returns a valid OG image `1200x630` with agreed text and dark-green Islamic theme.
4. Root metadata exposes canonical URL, Open Graph fields, and Twitter card fields aligned to the agreed brand/domain/locale constants.

## Test Plan

1. Run frontend lint/type checks after implementation.
2. Verify metadata endpoints:
   - `/sitemap.xml`
   - `/robots.txt`
   - `/opengraph-image`
3. Validate rendered HTML metadata includes:
   - canonical link
   - `og:*` tags
   - Twitter card tags
4. Confirm title behavior:
   - homepage default title is correct
   - child pages can use `%s | Masjid Baiturrahim Sungai Bambu`

## Risks and Mitigations

- Risk: Route coverage in sitemap misses some public page.
  - Mitigation: initial explicit static list, later migration to generated entries if needed.
- Risk: OG image visual readability on social previews.
  - Mitigation: high contrast typography and simple deterministic layout.

## Implementation Readiness

This scope is intentionally constrained and ready for implementation planning.
