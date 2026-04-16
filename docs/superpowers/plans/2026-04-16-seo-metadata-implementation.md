# SEO Metadata Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement complete Next.js App Router SEO metadata primitives (sitemap, robots, OG image, and root metadata) for the production domain `https://masjidbaiturrahimsb.org`.

**Architecture:** Use native App Router metadata route files in `frontend/src/app` so SEO behavior is framework-standard and low maintenance. Keep sitemap static and deterministic for public routes only. Centralize domain/name/description consistency via root `metadata` and reference the generated OG image route in both Open Graph and Twitter metadata.

**Tech Stack:** Next.js App Router (TypeScript), `next/og` `ImageResponse`, ESLint via Bun.

---

## File Structure

- Create: `frontend/src/app/sitemap.ts` — static metadata route returning public page URLs for sitemap XML.
- Create: `frontend/src/app/robots.ts` — robots metadata route allowing all crawlers and advertising sitemap URL.
- Create: `frontend/src/app/opengraph-image.tsx` — dynamic OG image renderer (`1200x630`) with Islamic dark-green visual.
- Modify: `frontend/src/app/layout.tsx` — expand root `metadata` (`metadataBase`, canonical, Open Graph, Twitter).

---

### Task 1: Add static sitemap metadata route

**Files:**
- Create: `frontend/src/app/sitemap.ts`
- Test: Manual verification via local route `/sitemap.xml`

- [ ] **Step 1: Write the sitemap metadata route file**

```ts
import type { MetadataRoute } from 'next'

const SITE_URL = 'https://masjidbaiturrahimsb.org'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/mitra`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/galeri`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]
}
```

- [ ] **Step 2: Run lint for the new file**

Run: `cd frontend && bun run lint`
Expected: PASS (no new lint errors from `src/app/sitemap.ts`)

- [ ] **Step 3: Verify sitemap output in dev**

Run: `cd frontend && bun run dev`
Then open: `http://localhost:3000/sitemap.xml`
Expected: XML contains `https://masjidbaiturrahimsb.org/`, `/mitra`, and `/galeri`.

- [ ] **Step 4: Commit Task 1**

```bash
git add frontend/src/app/sitemap.ts
git commit -m "feat(seo): add static sitemap metadata route"
```

---

### Task 2: Add robots metadata route

**Files:**
- Create: `frontend/src/app/robots.ts`
- Test: Manual verification via local route `/robots.txt`

- [ ] **Step 1: Write the robots metadata route file**

```ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://masjidbaiturrahimsb.org/sitemap.xml',
  }
}
```

- [ ] **Step 2: Run lint for robots route**

Run: `cd frontend && bun run lint`
Expected: PASS (no new lint errors from `src/app/robots.ts`)

- [ ] **Step 3: Verify robots output in dev**

With dev server running, open: `http://localhost:3000/robots.txt`
Expected:
- `User-Agent: *`
- `Allow: /`
- `Sitemap: https://masjidbaiturrahimsb.org/sitemap.xml`

- [ ] **Step 4: Commit Task 2**

```bash
git add frontend/src/app/robots.ts
git commit -m "feat(seo): add robots metadata route"
```

---

### Task 3: Add dynamic Open Graph image route

**Files:**
- Create: `frontend/src/app/opengraph-image.tsx`
- Test: Manual verification via local route `/opengraph-image`

- [ ] **Step 1: Write OG image route with Islamic dark-green theme**

```tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background:
            'radial-gradient(circle at 20% 20%, #14532d 0%, #052e16 55%, #022c22 100%)',
          color: '#ecfdf5',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.14,
            backgroundImage:
              'linear-gradient(45deg, transparent 25%, #34d399 25%, #34d399 50%, transparent 50%, transparent 75%, #34d399 75%)',
            backgroundSize: '120px 120px',
          }}
        />

        <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '12px', height: '72px', background: '#facc15', borderRadius: '99px' }} />
          <div style={{ fontSize: 34, letterSpacing: 2 }}>MASJID RESMI</div>
        </div>

        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1 }}>
            Masjid Baiturrahim
            <br />
            Sungai Bambu
          </div>
          <div style={{ fontSize: 34, color: '#bbf7d0' }}>
            Pusat Ibadah dan Pembinaan Umat
          </div>
        </div>
      </div>
    ),
    size
  )
}
```

- [ ] **Step 2: Run lint for OG route**

Run: `cd frontend && bun run lint`
Expected: PASS (no new lint errors from `src/app/opengraph-image.tsx`)

- [ ] **Step 3: Verify image rendering**

With dev server running, open: `http://localhost:3000/opengraph-image`
Expected: PNG image generated at `1200x630` with:
- Dark green Islamic visual tone
- Text `Masjid Baiturrahim Sungai Bambu`
- Tagline `Pusat Ibadah dan Pembinaan Umat`

- [ ] **Step 4: Commit Task 3**

```bash
git add frontend/src/app/opengraph-image.tsx
git commit -m "feat(seo): add dynamic open graph image route"
```

---

### Task 4: Expand global metadata in root layout

**Files:**
- Modify: `frontend/src/app/layout.tsx`
- Test: Manual verification of page source metadata tags

- [ ] **Step 1: Replace minimal metadata object with full SEO metadata**

Update `metadata` in `frontend/src/app/layout.tsx` to:

```ts
export const metadata: Metadata = {
  metadataBase: new URL('https://masjidbaiturrahimsb.org'),
  title: {
    default: 'Masjid Baiturrahim Sungai Bambu',
    template: '%s | Masjid Baiturrahim Sungai Bambu',
  },
  description:
    'Website resmi Masjid Baiturrahim Sungai Bambu - Informasi kegiatan, donasi, dan layanan jamaah.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: '/',
    siteName: 'Masjid Baiturrahim Sungai Bambu',
    title: 'Masjid Baiturrahim Sungai Bambu',
    description:
      'Website resmi Masjid Baiturrahim Sungai Bambu - Informasi kegiatan, donasi, dan layanan jamaah.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Masjid Baiturrahim Sungai Bambu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Masjid Baiturrahim Sungai Bambu',
    description:
      'Website resmi Masjid Baiturrahim Sungai Bambu - Informasi kegiatan, donasi, dan layanan jamaah.',
    images: ['/opengraph-image'],
  },
}
```

- [ ] **Step 2: Run lint and type checks**

Run:
- `cd frontend && bun run lint`
- `cd frontend && bun run build`

Expected:
- Lint passes for `src/app/layout.tsx`
- Build succeeds with metadata route files recognized

- [ ] **Step 3: Verify rendered metadata tags**

With dev server running, open homepage and inspect source/devtools for:
- canonical URL pointing to `https://masjidbaiturrahimsb.org/`
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:locale`)
- Twitter tags (`twitter:card`, `twitter:title`, `twitter:image`)

Expected: all tags present and aligned to production domain/name/description.

- [ ] **Step 4: Commit Task 4**

```bash
git add frontend/src/app/layout.tsx
git commit -m "feat(seo): expand root metadata for canonical og and twitter"
```

---

### Task 5: End-to-end SEO validation and cleanup

**Files:**
- Modify: none required (verification task)

- [ ] **Step 1: Run final verification commands**

Run:

```bash
cd frontend && bun run lint && bun run build
```

Expected: all checks PASS.

- [ ] **Step 2: Run route validation checklist**

Check these paths on local dev server:
- `/sitemap.xml`
- `/robots.txt`
- `/opengraph-image`

Expected:
- sitemap and robots generated correctly
- OG image renders correctly

- [ ] **Step 3: Confirm requirement mapping**

Verify each original requirement is satisfied:
- static sitemap with production URL
- robots allow all + sitemap pointer
- dynamic `ImageResponse` OG image, 1200x630, Islamic dark-green theme, mosque name + tagline
- full metadata object in root layout with canonical, Open Graph, Twitter

- [ ] **Step 4: Commit verification checkpoint**

```bash
git add .
git commit -m "chore(seo): verify metadata routes and social preview configuration"
```

---

## Spec Coverage Check

- `app/sitemap.ts` static with production domain: covered by Task 1.
- `app/robots.ts` allow all + sitemap: covered by Task 2.
- `app/opengraph-image.tsx` dynamic 1200x630 with required brand text/theme: covered by Task 3.
- `app/layout.tsx` full metadata including canonical/OG/Twitter and locale/domain consistency: covered by Task 4.
- Verification requirements: covered by Task 5.

No uncovered spec items remain.

## Placeholder Scan

No `TODO`, `TBD`, or ambiguous "appropriate handling" instructions are present.

## Type Consistency Check

- `MetadataRoute.Sitemap` and `MetadataRoute.Robots` are used consistently in route files.
- OG image route name and path `/opengraph-image` are used consistently across Task 3 and Task 4.
- Domain/name/tagline/description values are consistent across all tasks.
