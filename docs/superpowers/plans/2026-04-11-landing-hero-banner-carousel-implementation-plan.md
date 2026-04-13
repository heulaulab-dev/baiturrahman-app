# Landing Hero Banner Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add dashboard-managed hero background slides (separate from gallery), public API, Konten → Banner UI, and a full-bleed carousel on the landing `HeroSection` with graceful empty-state fallback.

**Architecture:** New GORM model `HeroSlide` mirrors `GalleryItem` (image URL, sort_order, is_published, alt_text). Handlers duplicate the gallery CRUD/reorder/toggle pattern. Public `GET /api/v1/hero/slides` returns published rows only. Frontend uses TanStack Query + `embla-carousel-react` (already in `package.json`) for the background carousel; `AdminImageUploadField` uses new upload module `hero`.

**Tech Stack:** Go 1.21+, Gin, GORM; Next.js App Router, TanStack Query, Embla Carousel, existing shadcn/ui + `AdminImageUploadField`.

**Spec:** `docs/superpowers/specs/2026-04-11-landing-hero-banner-carousel-design.md`

---

## File map

| File | Responsibility |
|------|----------------|
| `backend/internal/models/hero_slide.go` | `HeroSlide` struct + `BeforeCreate` UUID |
| `backend/internal/database/migrations.go` | Register `&models.HeroSlide{}` in `AutoMigrate` |
| `backend/internal/handlers/hero_slide_handler.go` | Public + admin handlers (mirror `gallery_item_handler.go`) |
| `backend/internal/handlers/upload_handler.go` | Add `"hero"` to `allowedUploadModules` |
| `backend/cmd/server/main.go` | `GET /hero/slides` (public); `admin` CRUD/reorder/toggle under `/hero/slides` |
| `frontend/src/types/index.ts` (or adjacent) | `HeroSlide` TypeScript interface |
| `frontend/src/services/apiService.ts` | `getHeroSlides()` → `GET /v1/hero/slides` |
| `frontend/src/services/adminApiService.ts` | Admin hero slide API functions |
| `frontend/src/services/adminHooks.ts` | `useAdminHeroSlides`, mutations, query keys |
| `frontend/src/services/hooks.ts` | `useHeroSlides` public query |
| `frontend/src/services/adminUploadService.ts` | Extend `AdminUploadModule` with `'hero'` |
| `frontend/src/components/landing/HeroBackgroundCarousel.tsx` | Embla + images + overlay + dots/prev-next + reduced-motion |
| `frontend/src/components/landing/HeroSection.tsx` | Conditionally render carousel layer; keep existing content |
| `frontend/src/components/dashboard/HeroBannerManagement.tsx` | CRUD UI modeled on `GalleryManagement.tsx` (simpler fields) |
| `frontend/src/app/(app)/konten/page.tsx` | Replace Banner tab placeholder with `HeroBannerManagement` |

---

### Task 1: Backend model `HeroSlide`

**Files:**

- Create: `backend/internal/models/hero_slide.go`

- [ ] **Step 1: Add model file**

```go
package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

const MaxHeroSlides = 10

// HeroSlide is a full-bleed landing hero background image managed from the dashboard (Konten → Banner).
type HeroSlide struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	ImageURL     string    `gorm:"type:varchar(1000);not null" json:"image_url"`
	AltText      string    `gorm:"type:varchar(500)" json:"alt_text"`
	SortOrder    int       `gorm:"not null;default:0;index" json:"sort_order"`
	IsPublished  bool      `gorm:"default:false;not null;index" json:"is_published"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (h *HeroSlide) BeforeCreate(tx *gorm.DB) error {
	if h.ID == uuid.Nil {
		h.ID = uuid.New()
	}
	return nil
}
```

- [ ] **Step 2: Register migration**

Modify `backend/internal/database/migrations.go`: inside `AutoMigrate(...)`, add `&models.HeroSlide{},` next to `GalleryItem`.

- [ ] **Step 3: Compile**

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/backend && go build -o /tmp/server ./cmd/server/main.go
```

Expected: exit code 0 (migration registration alone may not fail until main references the model — Task 2 wires handlers).

---

### Task 2: Hero slide handlers

**Files:**

- Create: `backend/internal/handlers/hero_slide_handler.go`

- [ ] **Step 1: Implement handlers** by copying the structure of `gallery_item_handler.go` with these substitutions:

  - Model: `HeroSlide` instead of `GalleryItem`.
  - No `Title`, `Summary`, `LinkURL` — only `image_url`, `alt_text`, `sort_order`, `is_published`.
  - `GetPublicHeroSlides`: `Where("is_published = ?", true).Order("sort_order ASC, created_at ASC")`.
  - `CreateHeroSlide`: bind `image_url` (required), `alt_text` (optional), `is_published` (optional); before `Create`, `Count` all rows; if `count >= models.MaxHeroSlides`, return `400` with a clear message (Indonesian or English consistent with other handlers).
  - `ReorderHeroSlides`: same loop as `ReorderGalleryItems` updating `hero_slides`.
  - `ToggleHeroSlidePublished`: same as gallery toggle.

- [ ] **Step 2: Build**

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/backend && go build -o /tmp/server ./cmd/server/main.go
```

Expected: exit code 0.

---

### Task 3: Routes and upload allowlist

**Files:**

- Modify: `backend/cmd/server/main.go`
- Modify: `backend/internal/handlers/upload_handler.go`

- [ ] **Step 1: Public route** — In the `public` block after `gallery/items`, add:

```go
public.GET("/hero/slides", h.GetPublicHeroSlides)
```

- [ ] **Step 2: Admin routes** — After the `// Gallery` block, add:

```go
// Hero slides (landing banner)
admin.GET("/hero/slides", h.GetAdminHeroSlides)
admin.POST("/hero/slides", h.CreateHeroSlide)
admin.PUT("/hero/slides/:id", h.UpdateHeroSlide)
admin.DELETE("/hero/slides/:id", h.DeleteHeroSlide)
admin.PUT("/hero/slides/reorder", h.ReorderHeroSlides)
admin.PUT("/hero/slides/:id/toggle", h.ToggleHeroSlidePublished)
```

- [ ] **Step 3: Upload** — In `allowedUploadModules`, add: `"hero": {}`.

- [ ] **Step 4: Build**

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/backend && go build -o /tmp/server ./cmd/server/main.go
```

Expected: exit code 0.

- [ ] **Step 5: Commit**

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app && git add backend/internal/models/hero_slide.go backend/internal/database/migrations.go backend/internal/handlers/hero_slide_handler.go backend/internal/handlers/upload_handler.go backend/cmd/server/main.go && git commit -m "feat(api): hero slides CRUD and public list for landing banner"
```

---

### Task 4: Frontend types and API layer

**Files:**

- Modify: `frontend/src/types/index.ts` (or the file where `GalleryItem` is exported)
- Modify: `frontend/src/services/apiService.ts`
- Modify: `frontend/src/services/adminApiService.ts`
- Modify: `frontend/src/services/adminUploadService.ts`

- [ ] **Step 1: TypeScript interface** (match JSON tags from Go):

```ts
export interface HeroSlide {
	id: string;
	image_url: string;
	alt_text?: string;
	sort_order: number;
	is_published: boolean;
	created_at?: string;
	updated_at?: string;
}
```

- [ ] **Step 2: Public API** — In `apiService.ts`, add:

```ts
export async function getHeroSlides(): Promise<HeroSlide[]> {
	const response = await api.get<ApiResponse<HeroSlide[]>>('/v1/hero/slides');
	return response.data.data ?? [];
}
```

Use the same axios instance as `getGalleryItems` (`import api from '@/lib/axios'`).

- [ ] **Step 3: Admin API** — Mirror `getAdminGalleryItems` / `createGalleryItem` / etc. with paths `/v1/admin/hero/slides` and the same request/response shapes as backend handlers.

- [ ] **Step 4: `AdminUploadModule`** — Add `'hero'` to the union type in `adminUploadService.ts`.

- [ ] **Step 5: Lint / typecheck**

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/frontend && bun run build
```

Expected: successful build (fix any import paths).

---

### Task 5: TanStack Query hooks

**Files:**

- Modify: `frontend/src/services/hooks.ts`
- Modify: `frontend/src/services/adminHooks.ts`

- [ ] **Step 1: Public hook**

```ts
export const useHeroSlides = () => {
	return useQuery({
		queryKey: ['hero', 'slides'],
		queryFn: getHeroSlides,
		staleTime: 1000 * 60 * 5,
	});
};
```

- [ ] **Step 2: Admin hooks** — Copy the gallery admin hook block: `useAdminHeroSlides`, `useCreateHeroSlide`, `useUpdateHeroSlide`, `useDeleteHeroSlide`, `useReorderHeroSlides`, `useToggleHeroSlidePublished`, with `queryKey` `['admin', 'hero', 'slides']` and invalidation on mutations.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/types frontend/src/services/apiService.ts frontend/src/services/adminApiService.ts frontend/src/services/adminUploadService.ts frontend/src/services/hooks.ts frontend/src/services/adminHooks.ts && git commit -m "feat(frontend): hero slides API types and hooks"
```

---

### Task 6: `HeroBannerManagement` dashboard component

**Files:**

- Create: `frontend/src/components/dashboard/HeroBannerManagement.tsx`
- Modify: `frontend/src/app/(app)/konten/page.tsx`

- [ ] **Step 1: Implement UI** by adapting `GalleryManagement.tsx`:

  - Remove title, summary, link fields; keep image upload (`module="hero"`), optional `alt_text` (`Input` or `Textarea` single line), `Switch` for published, move up/down or same arrow pattern, delete confirm dialog, toggle published quick action.
  - Dialog for create/edit: only `image_url` (from upload), `alt_text`, `is_published`.

- [ ] **Step 2: Wire tab** — In `konten/page.tsx`, replace the Banner placeholder `CardContent` with `<HeroBannerManagement />` and update `CardDescription` to describe hero-only slides.

- [ ] **Step 3: Build**

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/frontend && bun run build
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/dashboard/HeroBannerManagement.tsx frontend/src/app/\(app\)/konten/page.tsx && git commit -m "feat(dashboard): manage hero banner slides under Konten"
```

---

### Task 7: Landing `HeroBackgroundCarousel` + `HeroSection` integration

**Files:**

- Create: `frontend/src/components/landing/HeroBackgroundCarousel.tsx`
- Modify: `frontend/src/components/landing/HeroSection.tsx`

- [ ] **Step 1: Carousel component** — Props: `slides: { id: string; src: string; alt: string }[]`.

  - Use `embla-carousel-react` with `loop: slides.length > 1`, `duration` tuned for fade if using fade plugin (optional: simple slide; YAGNI).
  - Wrapper: `absolute inset-0 z-0`.
  - Each slide: `Image` `fill` `className="object-cover"` `sizes="100vw"` `priority` only on first slide.
  - Overlay: `absolute inset-0` with `bg-gradient-to-b from-black/50 via-black/35 to-black/55` (tune to match design).
  - Autoplay: `setInterval` 7000ms advancing `emblaApi.scrollNext()` when `slides.length > 1`, cleared when `document.visibilityState !== 'visible'` or when `prefers-reduced-motion: reduce` (disable autoplay; show first slide or allow manual dots only).
  - Pause autoplay on hover over the carousel region (`onMouseEnter` / `onMouseLeave`).
  - Dots at bottom center (`z-20`); optional prev/next buttons with `aria-label`.
  - `onError` on `Image`: hide broken slide (filter from local state) or skip — minimal: use uncontrolled error by showing empty for that index.

- [ ] **Step 2: `HeroSection`** — Call `useHeroSlides()`. Map response with `resolveBackendAssetUrl`; filter empty URLs. If `slides.length === 0` or `isLoading` with no cached data, render **no** background layer (current look). If slides exist, render `HeroBackgroundCarousel` as first child inside `<section>`, then keep calligraphy + content with `z-10` (ensure section has `relative` and content stays above). Change `bg-white` to allow carousel to show: e.g. `bg-white` only when no slides; when slides, use `bg-neutral-900` or transparent behind overlay.

- [ ] **Step 3: Build and lint**

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/frontend && bun run lint && bun run build
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/landing/HeroBackgroundCarousel.tsx frontend/src/components/landing/HeroSection.tsx && git commit -m "feat(landing): hero background carousel from published slides"
```

---

### Task 8: Manual verification (spec §9)

- [ ] **Step 1:** Start backend + frontend; open `/` with no hero rows — hero matches previous static appearance.
- [ ] **Step 2:** Add one published slide in Konten → Banner — image appears full-bleed; text readable.
- [ ] **Step 3:** Add second slide — autoplay rotates; dots work.
- [ ] **Step 4:** Reorder in dashboard — order matches landing.
- [ ] **Step 5:** Unpublish one — disappears from public API.
- [ ] **Step 6:** OS “reduce motion” on — no intrusive autoplay (per implementation).
- [ ] **Step 7:** Mobile width — no horizontal scroll.

---

## Spec coverage checklist

| Spec item | Task |
|-----------|------|
| Separate table, not gallery | Task 1–2 |
| Max 10 slides | Task 2 (`MaxHeroSlides`) |
| Public GET published only | Task 2–3 |
| Admin CRUD + reorder + toggle | Task 2–3 |
| Upload module `hero` | Task 3–4 |
| Landing carousel + overlay + fallback | Task 7 |
| Dashboard Banner tab | Task 6 |
| Reduced motion / visibility pause | Task 7 |
| `resolveBackendAssetUrl` | Task 7 |

---

## Plan self-review

- **Placeholders:** None — paths and patterns are concrete.
- **Consistency:** Handler names follow `Gallery*` / `Hero*` parallel; frontend mirrors gallery hooks.

---

**Plan complete and saved to** `docs/superpowers/plans/2026-04-11-landing-hero-banner-carousel-implementation-plan.md`.

**Execution options:**

1. **Subagent-driven (recommended)** — Fresh subagent per task, review between tasks.  
2. **Inline execution** — Run tasks in this chat with checkpoints.

Which approach do you want?
