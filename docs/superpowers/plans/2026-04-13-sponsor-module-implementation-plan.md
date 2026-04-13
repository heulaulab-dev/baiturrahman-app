# Sponsor / Mitra Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship admin-managed sponsors with visibility and contract date ranges, public list + landing subset, manual reorder, RBAC menu permission `access_sponsors`, and upload module `sponsor`.

**Architecture:** GORM model `Sponsor` with soft delete; pure Go helper `PublicSponsorVisible` uses **Asia/Jakarta** calendar dates; Gin handlers mirror gallery/hero (admin CRUD + reorder, public GET with optional `for_landing=1`); public JSON strips contract fields. Dashboard adds **Konten → Mitra** tab; marketing adds `/mitra` and a landing strip component.

**Tech Stack:** Go 1.21+, Gin, GORM; Next.js App Router, TanStack Query, shadcn/ui, existing `AdminImageUploadField` and `resolveBackendAssetUrl`.

**Spec:** `docs/superpowers/specs/2026-04-13-sponsor-module-design.md`

---

## File map

| File | Responsibility |
|------|----------------|
| `backend/internal/utils/sponsor_visibility.go` | `PublicSponsorVisible`, `JakartaCalendarDate` |
| `backend/internal/utils/sponsor_visibility_test.go` | Table-driven tests for visibility |
| `backend/internal/models/sponsor.go` | `Sponsor` struct, `BeforeCreate` UUID |
| `backend/internal/database/migrations.go` | Register `&models.Sponsor{}` in `AutoMigrate` |
| `backend/internal/handlers/sponsor_handler.go` | Public + admin handlers, DTO without contract for public |
| `backend/internal/models/permission.go` | `PermissionAccessSponsors`, catalog entry, `defaultOrgRolePermissions` |
| `backend/internal/handlers/upload_handler.go` | `"sponsors": {}` in `allowedUploadModules`; alias `"sponsor": "sponsors"` if desired in `uploadModuleAliases` |
| `backend/cmd/server/main.go` | `GET /sponsors`; admin routes with `middleware.RequirePermission(models.PermissionAccessSponsors)` |
| `frontend/src/types/index.ts` | `Sponsor`, `PublicSponsor`, payload types |
| `frontend/src/services/apiService.ts` | `getSponsors`, `getSponsorsForLanding` |
| `frontend/src/services/hooks.ts` | `useSponsors`, `useSponsorsForLanding` |
| `frontend/src/services/adminApiService.ts` | Admin sponsor CRUD + reorder |
| `frontend/src/services/adminHooks.ts` | Queries/mutations + keys |
| `frontend/src/services/adminUploadService.ts` | Extend `AdminUploadModule` with `'sponsors'` |
| `frontend/src/components/dashboard/SponsorManagement.tsx` | CRUD UI (modeled on `HeroBannerManagement.tsx`) |
| `frontend/src/components/landing/SponsorsLandingSection.tsx` | Strip + link to `/mitra` |
| `frontend/src/app/(app)/konten/page.tsx` | Tab `mitra`, gated by `hasPermission('access_sponsors')` |
| `frontend/src/app/(marketing)/mitra/page.tsx` | Full public list |
| `frontend/src/app/(marketing)/page.tsx` | Insert `SponsorsLandingSection` (e.g. after `GallerySection`) |
| `frontend/src/components/landing/Navbar.tsx` | Add `{ name: 'Mitra', href: '/mitra' }` (or Indonesian label) |
| `frontend/src/context/AuthContext.tsx` | No change if permissions come from `/me` dynamically; verify new key flows |

---

### Task 1: Visibility helper + tests (TDD)

**Files:**

- Create: `backend/internal/utils/sponsor_visibility.go`
- Create: `backend/internal/utils/sponsor_visibility_test.go`

- [ ] **Step 1: Write `sponsor_visibility.go`**

```go
package utils

import "time"

// AsiaJakarta is used for sponsor public visibility (calendar date).
var AsiaJakarta = func() *time.Location {
	loc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		return time.FixedZone("WIB", 7*3600)
	}
	return loc
}()

// JakartaCalendarDate returns the calendar date of t in Asia/Jakarta (time at 00:00:00 in that zone).
func JakartaCalendarDate(t time.Time) time.Time {
	t = t.In(AsiaJakarta)
	y, m, d := t.Date()
	return time.Date(y, m, d, 0, 0, 0, 0, AsiaJakarta)
}

// PublicSponsorVisible returns whether a sponsor should appear on public APIs.
// visibilityStart must be non-nil; visibilityEnd nil means open-ended.
func PublicSponsorVisible(visibilityStart, visibilityEnd *time.Time, now time.Time) bool {
	if visibilityStart == nil {
		return false
	}
	today := JakartaCalendarDate(now)
	start := JakartaCalendarDate(*visibilityStart)
	if today.Before(start) {
		return false
	}
	if visibilityEnd == nil {
		return true
	}
	end := JakartaCalendarDate(*visibilityEnd)
	return !today.After(end)
}
```

- [ ] **Step 2: Write failing tests `sponsor_visibility_test.go`**

```go
package utils

import (
	"testing"
	"time"
)

func TestPublicSponsorVisible(t *testing.T) {
	j := AsiaJakarta
	d := func(y int, m time.Month, day int) time.Time {
		return time.Date(y, m, day, 12, 0, 0, 0, j)
	}
	start := d(2026, time.April, 1)
	end := d(2026, time.April, 30)

	tests := []struct {
		name   string
		vs, ve *time.Time
		now    time.Time
		want   bool
	}{
		{"nil start", nil, nil, d(2026, time.April, 15), false},
		{"before range", &start, &end, d(2026, time.March, 31), false},
		{"on start", &start, &end, d(2026, time.April, 1), true},
		{"mid range", &start, &end, d(2026, time.April, 15), true},
		{"on end", &start, &end, d(2026, time.April, 30), true},
		{"after end", &start, &end, d(2026, time.May, 1), false},
		{"open end", &start, nil, d(2027, time.January, 1), true},
		{"open end before start", &start, nil, d(2026, time.March, 1), false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := PublicSponsorVisible(tt.vs, tt.ve, tt.now); got != tt.want {
				t.Fatalf("got %v want %v", got, tt.want)
			}
		})
	}
}
```

- [ ] **Step 3: Run tests**

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/backend && go test ./internal/utils/ -run TestPublicSponsorVisible -v
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add backend/internal/utils/sponsor_visibility.go backend/internal/utils/sponsor_visibility_test.go
git commit -m "feat(sponsors): add Jakarta visibility helper and tests"
```

---

### Task 2: GORM model + AutoMigrate

**Files:**

- Create: `backend/internal/models/sponsor.go`
- Modify: `backend/internal/database/migrations.go`

- [ ] **Step 1: Add `sponsor.go`**

```go
package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Sponsor is a partner logo/link shown on the public site within a visibility window.
type Sponsor struct {
	ID               uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name             string         `gorm:"type:varchar(255);not null" json:"name"`
	LogoURL          string         `gorm:"type:varchar(1000)" json:"logo_url"`
	WebsiteURL       string         `gorm:"type:varchar(1000)" json:"website_url"`
	Description      string         `gorm:"type:text" json:"description"`
	VisibilityStart  *time.Time     `gorm:"type:date" json:"visibility_start"`
	VisibilityEnd    *time.Time     `gorm:"type:date" json:"visibility_end"`
	ContractStart    *time.Time     `gorm:"type:date" json:"contract_start"`
	ContractEnd      *time.Time     `gorm:"type:date" json:"contract_end"`
	ShowOnLanding    bool           `gorm:"default:false;not null;index" json:"show_on_landing"`
	SortOrder        int            `gorm:"not null;default:0;index" json:"sort_order"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}

func (s *Sponsor) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}
```

- [ ] **Step 2: Register in `Migrate`**

In `backend/internal/database/migrations.go`, add `&models.Sponsor{},` next to `HeroSlide` (or gallery models).

- [ ] **Step 3: Build**

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/backend && go build -o /tmp/server ./cmd/server/main.go
```

Expected: exit code 0.

- [ ] **Step 4: Commit**

```bash
git add backend/internal/models/sponsor.go backend/internal/database/migrations.go
git commit -m "feat(sponsors): add Sponsor model and migration"
```

---

### Task 3: RBAC permission catalog + org defaults

**Files:**

- Modify: `backend/internal/models/permission.go`

- [ ] **Step 1: Add constant** next to `PermissionAccessKonten`:

```go
PermissionAccessSponsors = "access_sponsors"
```

- [ ] **Step 2: Add catalog entry** in `DefaultPermissionsCatalog()` (after Konten entry):

```go
{
	Key:         PermissionAccessSponsors,
	Name:        "Akses Mitra & Sponsor",
	Description: "Dapat mengelola mitra dan sponsor di menu Konten",
	Module:      "menu",
	IsActive:    true,
},
```

- [ ] **Step 3: Extend `baseMenuPermissions`** inside `defaultOrgRolePermissions`:

```go
PermissionAccessSponsors: true,
```

- [ ] **Step 4: For every** `StrukturRole*` block in the returned map (`Bendahara`, `Ketua`, `Sekretaris`, `Humas`, `ImamSyah`, `Muadzin`, `DaiAmil`, `Marbot`, `Lainnya`), add:

```go
PermissionAccessSponsors: baseMenuPermissions[PermissionAccessSponsors],
```

- [ ] **Step 5: Build**

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/backend && go build -o /tmp/server ./cmd/server/main.go
```

Expected: exit code 0.

- [ ] **Step 6: Commit**

```bash
git add backend/internal/models/permission.go
git commit -m "feat(rbac): add access_sponsors permission"
```

---

### Task 4: Sponsor handlers

**Files:**

- Create: `backend/internal/handlers/sponsor_handler.go`

- [ ] **Step 1: Implement handlers** using this contract:

**Validation helpers (private in file):**

- Trim `name`; reject empty.
- If `visibility_end != nil`: require `visibility_start != nil` and `!visibility_end.Before(*visibilityStart)` (compare Jakarta calendar dates or date-only truncation).
- If `contract_end != nil`: require `contract_start != nil` and same end ≥ start rule.

**`GetPublicSponsors`:**

- Query `c.Query("for_landing") == "1"` (also accept `landing=true` if you prefer—pick one and document).
- `db.Model(&models.Sponsor{}).Order("sort_order ASC, created_at ASC").Find(&rows)`.
- Filter in Go: `utils.PublicSponsorVisible(s.VisibilityStart, s.VisibilityEnd, time.Now())`; if landing query, also `s.ShowOnLanding`.
- Map to **public DTO** struct with fields: `id`, `name`, `logo_url`, `website_url`, `description`, `visibility_start`, `visibility_end`, `show_on_landing`, `sort_order`, `created_at` — **omit** `contract_*`.

**Admin:**

- `GetAdminSponsors`: all non-deleted, same order, **full** model JSON (including contract fields).
- `CreateSponsor` / `UpdateSponsor`: bind JSON; run validation; for `sort_order` on create default to `max(sort_order)+1` or `0` like gallery pattern.
- `DeleteSponsor`: `Delete` (soft).
- `ReorderSponsors`: same loop as `ReorderHeroSlides` updating `sort_order` by `id`.

**Date binding:** Use `*string` for optional date fields in bind structs (`"2006-01-02"`), parse with `time.ParseInLocation("2006-01-02", s, utils.AsiaJakarta)` and store pointer; empty string → `nil`.

- [ ] **Step 2: Build**

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/backend && go build -o /tmp/server ./cmd/server/main.go
```

Expected: compiles after Task 5 wires routes (if build fails before routes, add temporary `_ = h` or skip—prefer completing Step 3 same session).

- [ ] **Step 3: Commit** (after routes compile)

```bash
git add backend/internal/handlers/sponsor_handler.go
git commit -m "feat(sponsors): add public and admin handlers"
```

---

### Task 5: Routes, upload allowlist

**Files:**

- Modify: `backend/cmd/server/main.go`
- Modify: `backend/internal/handlers/upload_handler.go`

- [ ] **Step 1: Public routes** in `public` group (near `hero/slides`):

```go
public.GET("/sponsors", h.GetPublicSponsors)
```

- [ ] **Step 2: Admin routes** with permission middleware on **each** line:

```go
admin.GET("/sponsors", middleware.RequirePermission(models.PermissionAccessSponsors), h.GetAdminSponsors)
admin.POST("/sponsors", middleware.RequirePermission(models.PermissionAccessSponsors), h.CreateSponsor)
admin.PUT("/sponsors/:id", middleware.RequirePermission(models.PermissionAccessSponsors), h.UpdateSponsor)
admin.DELETE("/sponsors/:id", middleware.RequirePermission(models.PermissionAccessSponsors), h.DeleteSponsor)
admin.PUT("/sponsors/reorder", middleware.RequirePermission(models.PermissionAccessSponsors), h.ReorderSponsors)
```

- [ ] **Step 3: Upload** — in `allowedUploadModules`:

```go
"sponsors": {},
```

Optional in `uploadModuleAliases`: `"sponsor": "sponsors",`

- [ ] **Step 4: Build**

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/backend && go build -o /tmp/server ./cmd/server/main.go
```

Expected: exit code 0.

- [ ] **Step 5: Commit**

```bash
git add backend/cmd/server/main.go backend/internal/handlers/upload_handler.go
git commit -m "feat(sponsors): wire routes and upload module"
```

---

### Task 6: Frontend types + public API + hooks

**Files:**

- Modify: `frontend/src/types/index.ts`
- Modify: `frontend/src/services/apiService.ts`
- Modify: `frontend/src/services/hooks.ts`

- [ ] **Step 1: Add interfaces** to `types/index.ts` (names align with JSON):

```ts
export interface PublicSponsor {
  id: string
  name: string
  logo_url: string
  website_url: string
  description: string
  visibility_start: string | null
  visibility_end: string | null
  show_on_landing: boolean
  sort_order: number
  created_at: string
}

export interface Sponsor extends PublicSponsor {
  contract_start: string | null
  contract_end: string | null
}

export interface SponsorReorderItem {
  id: string
  sort_order: number
}
```

- [ ] **Step 2: Add to `apiService.ts`**

```ts
export const getSponsors = async (): Promise<PublicSponsor[]> => {
  const response = await api.get<ApiResponse<PublicSponsor[]>>('/v1/sponsors')
  return response.data.data ?? []
}

export const getSponsorsForLanding = async (): Promise<PublicSponsor[]> => {
  const response = await api.get<ApiResponse<PublicSponsor[]>>('/v1/sponsors', {
    params: { for_landing: '1' },
  })
  return response.data.data ?? []
}
```

- [ ] **Step 3: Add to `hooks.ts`**

```ts
export const useSponsors = () => {
  return useQuery({
    queryKey: ['sponsors', 'public'],
    queryFn: getSponsors,
    staleTime: 1000 * 60 * 5,
  })
}

export const useSponsorsForLanding = () => {
  return useQuery({
    queryKey: ['sponsors', 'landing'],
    queryFn: getSponsorsForLanding,
    staleTime: 1000 * 60 * 5,
  })
}
```

Add imports for `getSponsors`, `getSponsorsForLanding` from `./apiService`.

- [ ] **Step 4: Lint**

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/frontend && bun run lint
```

Expected: no new errors in touched files.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/types/index.ts frontend/src/services/apiService.ts frontend/src/services/hooks.ts
git commit -m "feat(sponsors): public types, API client, and hooks"
```

---

### Task 7: Admin API + hooks + upload module

**Files:**

- Modify: `frontend/src/services/adminApiService.ts`
- Modify: `frontend/src/services/adminHooks.ts`
- Modify: `frontend/src/services/adminUploadService.ts`

- [ ] **Step 1: In `adminApiService.ts`** add functions mirroring hero slides:

- `getAdminSponsors()` → `GET /v1/admin/sponsors`
- `createAdminSponsor(body)` → `POST`
- `updateAdminSponsor(id, body)` → `PUT /v1/admin/sponsors/:id`
- `deleteAdminSponsor(id)` → `DELETE`
- `reorderAdminSponsors(items: SponsorReorderItem[])` → `PUT /v1/admin/sponsors/reorder` with `{ items }`

Use `ApiResponse<Sponsor>` / `Sponsor[]` types.

- [ ] **Step 2: In `adminHooks.ts`** add:

- `useAdminSponsors` with queryKey `['admin', 'sponsors']`
- Mutations: create, update, delete, reorder — on success `invalidateQueries` for `['admin', 'sponsors']`, `['sponsors', 'public']`, `['sponsors', 'landing']`

- [ ] **Step 3: In `adminUploadService.ts`** extend `AdminUploadModule` type with `'sponsors'`.

- [ ] **Step 4: Lint + commit**

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/frontend && bun run lint
git add frontend/src/services/adminApiService.ts frontend/src/services/adminHooks.ts frontend/src/services/adminUploadService.ts
git commit -m "feat(sponsors): admin API, hooks, upload module"
```

---

### Task 8: `SponsorManagement` dashboard UI

**Files:**

- Create: `frontend/src/components/dashboard/SponsorManagement.tsx`

- [ ] **Step 1: Implement** by adapting `HeroBannerManagement.tsx`:

- Form fields: `name` (required), `logo_url` (`AdminImageUploadField` with `module="sponsors"`), `website_url`, `description` (textarea), four optional date inputs (use existing `FinanceFormDatePicker` or shadcn date picker used in finance), `show_on_landing` switch.
- List: sorted by `sort_order`; **Up/Down** buttons calling reorder mutation with reindexed `sort_order` (same `persistOrder` pattern as hero).
- Dialog create/edit; `AlertDialog` delete.
- Map entity dates to input: `visibility_start` string slice `YYYY-MM-DD` from ISO string.

- [ ] **Step 2: Lint**

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/frontend && bun run lint
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/dashboard/SponsorManagement.tsx
git commit -m "feat(sponsors): dashboard SponsorManagement UI"
```

---

### Task 9: Konten tab + marketing surfaces + navbar

**Files:**

- Modify: `frontend/src/app/(app)/konten/page.tsx`
- Modify: `frontend/src/components/landing/Navbar.tsx`
- Create: `frontend/src/components/landing/SponsorsLandingSection.tsx`
- Create: `frontend/src/app/(marketing)/mitra/page.tsx`
- Modify: `frontend/src/app/(marketing)/page.tsx`

- [ ] **Step 1: `konten/page.tsx`**

- Extend `TabType` with `'mitra'`.
- Add tab `{ key: 'mitra', label: 'Mitra' }` **only** when `useAuth().hasPermission('access_sponsors')` is true (conditionally include in `tabs` array).
- `TabsContent value="mitra"`: render `<SponsorManagement />`.

- [ ] **Step 2: `SponsorsLandingSection.tsx`**

- `useSponsorsForLanding()`; if `data?.length === 0` or loading with no data → return `null`.
- Grid of logos with `next/image` + `resolveBackendAssetUrl`; wrap in `Link` only when `website_url` set; bottom link `Link href="/mitra"` “Lihat semua mitra”.

- [ ] **Step 3: `mitra/page.tsx`**

- Client page using `useSponsors()`; empty state copy; grid of cards (logo, name, description, external link).

- [ ] **Step 4: `page.tsx` (marketing home)** — import and render `<SponsorsLandingSection />` (e.g. after `GallerySection`).

- [ ] **Step 5: `Navbar.tsx`** — add `{ name: 'Mitra', href: '/mitra' }` to `navLinks` (adjust label to Indonesian preference if needed).

- [ ] **Step 6: Lint + commit**

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/frontend && bun run lint
git add frontend/src/app/\(app\)/konten/page.tsx frontend/src/components/landing/Navbar.tsx frontend/src/components/landing/SponsorsLandingSection.tsx frontend/src/app/\(marketing\)/mitra/page.tsx frontend/src/app/\(marketing\)/page.tsx
git commit -m "feat(sponsors): landing strip, /mitra page, konten tab, nav link"
```

---

### Task 10: Manual QA + backend regression

- [ ] **Step 1: Run backend**

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/backend && go test ./internal/utils/... ./internal/services/...
```

Expected: all pass (add `./internal/handlers/...` only if you add handler tests later).

- [ ] **Step 2: Smoke** — With DB running, create sponsor via admin API or UI: set visibility including today, `show_on_landing` true, verify `GET /api/v1/sponsors` and `?for_landing=1`, verify contract fields absent on public JSON.

- [ ] **Step 3: Final commit** if any fixes.

---

## Self-review (spec coverage)

| Spec section | Task(s) |
|--------------|---------|
| Model + visibility rule | 1–2, 4 |
| Public API + landing query | 4–5 |
| Admin CRUD + reorder | 4–5 |
| Contract admin-only | 4 (public DTO) |
| Upload module | 5, 7 |
| RBAC `access_sponsors` | 3, 5, 9 |
| Landing + `/mitra` + hide empty | 9 |
| Jakarta today | 1, 4 |
| Unit tests visibility | 1 |

**Placeholder scan:** None intentional; date parsing and handler bodies are specified at the interface level—implementer fills Gin bind structs to match the JSON keys in Task 4.

**Type consistency:** `PublicSponsor` / `Sponsor` / `SponsorReorderItem` align with `items: [{ id, sort_order }]` reorder body.

---

## Execution handoff

**Plan complete and saved to** `docs/superpowers/plans/2026-04-13-sponsor-module-implementation-plan.md`. **Two execution options:**

1. **Subagent-Driven (recommended)** — Dispatch a fresh subagent per task, review between tasks, fast iteration. **Required sub-skill:** superpowers:subagent-driven-development.

2. **Inline execution** — Run tasks in this session using executing-plans with checkpoints.

**Which approach do you want?**
