# Landing Page Redesign - Masjid Baiturrahman
**Date:** 2026-03-17
**Aesthetic:** Minimalist Sacred
**Status:** Approved for Implementation

---

## Design Philosophy

Pure restraint. White (#ffffff) background, deep forest green (#1a3d2b) for headings, gold (#b8962e) for micro-accents only. Massive typographic scale. Full-bleed photography with zero overlays. Refined, sophisticated — the most dignified mosque website in Southeast Asia.

## Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Background | `#ffffff` | Pure white, entire page |
| Primary | `#1a3d2b` | Headings, text, borders |
| Accent | `#b8962e` | Micro-accents, CTAs, active states, prayer highlight |
| Text | `#1a1a1a` | Body text |
| Muted | `#6b6b6b` | Secondary text, labels |

## Typography

| Context | Font | Size |
|---------|------|------|
| Display/H1 | Cormorant Garamond | `clamp(2rem, 5vw, 4rem)` |
| Headings (H2-H4) | Cormorant Garamond | `clamp(1.5rem, 3vw, 2.5rem)` |
| Body | Plus Jakarta Sans | `clamp(0.95rem, 1.5vw, 1.1rem)` |
| Prayer times/data | JetBrains Mono | Fixed small size |

**Google Fonts to load:**
- Cormorant Garamond (400, 500, 600, 700)
- Plus Jakarta Sans (300, 400, 500, 600)
- JetBrains Mono (400)
- Noto Naskh Arabic (400, 500, 600) — for Arabic calligraphy

## Hero Hook

**Arabic:** "بيت الرحمن" (Baiturrahman) — The House of Mercy

**Indonesian:** "Merahmati Umat, Menerangi Jiwa"

## Section Specifications

### 1. Navigation

- Left: Mosque logo (line art) + "Baiturrahman" in Cormorant Garamond, forest green
- Right: Nav links — Beranda, Jadwal Sholat, Layanan, Kajian, Berita, Donasi — Plus Jakarta Sans, small uppercase, wide letter-spacing
- Sticky with blur backdrop on scroll
- Mobile: Slide-in panel with blur backdrop

### 2. Hero Section

**Layout:** Split composition, full viewport (100vh)

- **Left (55%):** Large Arabic calligraphy "بيت الرحمن" — 50vw max, forest green at 30% opacity. Tagline below.
- **Right (45%):** Subtle mosque silhouette line drawing — single-stroke SVG, forest green.
- **Floating widget (center-right):** Prayer countdown capsule — white bg, forest green border. Magnetic hover effect.
- **CTAs (bottom-center):** "Jadwal Kajian" (outline, forest green) + "Donasi Sekarang" (solid, gold)
- **Scroll indicator:** 40px line at bottom center, forest green, bounce animation

**Animations:**
- Nav: 0ms
- Hero Arabic text: 200ms
- Hero silhouette: 400ms
- Prayer widget: 500ms
- CTAs: 600ms

### 3. Prayer Times Widget

Horizontal strip, full width. Five pills in row:

- Each: prayer name + time
- Current/next prayer: gold with pulse animation
- Others: forest green
- Right side: Hijri + Gregorian date in JetBrains Mono, small uppercase

### 4. Layanan Masjid

3-column grid (desktop), 2 (tablet), 1 (mobile):

- Services: Kajian Harian, Muallaf Center, Zakat & Wakaf, Reservasi Ruangan, Kunjungan Rombongan, Perpustakaan Islam
- Card: name in Cormorant H3, one-line descriptor in Plus Jakarta Sans, muted
- Hover: lift (-4px), gold border (1px), icon reveals (Lucide icons)
- Grid proportions based on √2 ratio

### 5. Kajian & Konten Islam

Editorial magazine layout:

- Featured: Full width (or 2/3 desktop), large image left, content right. Cormorant H2 title, Plus Jakarta Sans excerpt
- Category badges: Tafsir, Fiqh, Tasawuf, Khutbah, Keislaman — forest green outline pills
- Below: 3 supporting cards, 1:1.2 ratio, thumbnail + title + date + category
- "Lihat Semua Artikel" CTA: text link with gold underline

### 6. Mimbar Jumat

Two-column layout:

- **Left:** Khatib name (Cormorant H3), theme (body), Imam & Muadzin listing (small uppercase)
- **Right:** PDF download button (gold outline), archive preview (last 4 sermons)

### 7. Berita & Kegiatan

Bold editorial grid:

- Featured: Full-bleed image, title overlay at bottom (Cormorant H2, white + shadow), date/category pills
- Below: 2 supporting stories, 4:3 images, Cormorant H3 titles, JetBrains Mono dates
- Hover: images scale 1.02, titles shift to gold

### 8. Donasi & Wakaf

Full-width dignified conversion:

- **Left:** Trust signals (legal badge, transparency link, stats)
- **Center:** QRIS placeholder with "Scan untuk Donasi"
- **Right:** Bank details vertical list (JetBrains Mono for numbers)
- **Bottom:** Zakat calculator toggle (slide animation)

### 9. Kontak & Lokasi

Two-column layout:

- **Left:** Map placeholder, address/phone/email, operating hours
- **Right:** Contact form (Nama, Email, WhatsApp, Layanan dropdown, Pesan textarea)
- Form fields: white bg, forest green border on focus, gold border on submit only

### 10. Footer

Three columns:

- **Left:** Logo + "Baiturrahman" (Cormorant H3) + tagline + copyright
- **Center:** Quick links in 3 columns
- **Right:** Prayer time brief (compact, JetBrains Mono)
- Bottom right: Social media icons

## Unique Interactive Element

**Prayer Time Magnetic Countdown**

- Compact capsule widget showing next prayer name + time + countdown
- Magnetic effect: element follows cursor within 20px radius (desktop)
- Subtle pulse animation (opacity 0.8 → 1)
- Countdown ticks with precision using setInterval

## Motion Design

| Interaction | Effect |
|-------------|--------|
| Page load | Orchestrated reveal by section |
| Scroll | Fade-in-up, translateY(30px) → translateY(0) |
| Hover cards | Scale 1.02, 200ms color transitions |
| Hover links | Gold underline animation |
| Prayer widget | Magnetic pull + pulse |
| Hero background | Subtle grain texture (5% opacity) |

## Content Placeholders

- Mosque Name: Masjid Baiturrahman
- Tagline: "Merahmati Umat, Menerangi Jiwa"
- Address: Jl. Masjid Baiturrahman No. 1, [Kota], Indonesia
- Phone: +62 xxx-xxxx-xxxx
- Email: info@baiturrahman.or.id
- Khatib: Ustadz Dr. Abdullah Hakim, M.A.
- Tema: "Membangun Keluarga Sakinah di Era Digital"
- Prayer times: Subuh 04:32, Dzuhur 12:04, Ashar 15:21, Maghrib 18:03, Isya 19:15
- Stats: 50.000+ Jamaah/Bulan, 200+ Kajian/Tahun, 15+ Tahun Berdiri, 1.000+ Muallaf Dibina

## Technical Requirements

- Next.js 15 App Router with TypeScript
- Tailwind CSS v4
- Framer Motion for animations
- Lucide React for icons
- CSS custom properties for theming
- Intersection Observer for scroll triggers
- Single-page scroll navigation
- Mobile-responsive (fluid typography)
