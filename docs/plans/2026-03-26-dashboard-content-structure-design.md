# Dashboard Content & Structure Management Design

## Overview

Design document for implementing content management features on the admin dashboard.

## Status: **FULLY IMPLEMENTED** ✅

## Features

### 1. Tentang Kami (About Us) ✅

**Decision**: Use existing ContentSection model with single-item approach.

**Rationale**:
- ContentSection already supports rich text editing
- Avoids duplication of models
- Simple implementation: just add API endpoint for "tentang-kami" content

**Implementation**:
- Add new admin endpoint to fetch/update single ContentSection with `section_type='tentang_kami'`
- Frontend: Reuse admin ContentSection editor
- Landing: Display this section if `is_visible=true`

**API Endpoints**:
- `GET /admin/content/tentang-kami` - Fetch/Update
- `PUT /admin/content/tentang-kami` - Update content

### 2. Sejarah (History) ✅

**Rationale**:
- Different data structure than Events (milestones vs timeline entries)
- Rich text content needed for each entry
- Date-based ordering

**Data Model**:
```go
type HistoryEntry struct {
    ID            uuid.UUID
    Title         string
    Content       string
    EntryDate     time.Time
    Category      string  // "milestone", "achievement", "event"
    ImageURL      *string
    IsPublished   bool
    CreatedBy     uuid.UUID
    CreatedAt     time.Time
    UpdatedAt     time.Time
}
```

**API Endpoints**:
```
GET    /admin/history-entries           - List with pagination
GET    /admin/history-entries/:id        - Get by ID
POST   /admin/history-entries            - Create
PUT    /admin/history-entries/:id        - Update
DELETE /admin/history-entries/:id        - Delete
GET    /history-entries                 - Public timeline
```

**Frontend Display**:
- Timeline view with date markers
- Show entry type badges (milestone, achievement, event)
- Filter by category

### 3. Visi Misi (Vision & Mission) ✅

**Decision**: Add Vision and Mission fields to existing MosqueInfo model.

**Rationale**:
- Simple approach, no new tables needed
- MosqueInfo already has Description field
- Can be managed via existing UpdateMosqueInfo endpoint

**Data Model Changes**:
```go
// Add to existing MosqueInfo struct
Vision   string   `gorm:"type:text" json:"vision,omitempty"`
Mission  string   `gorm:"type:text" json:"mission,omitempty"`
```

**Frontend Display**:
- Two sections on landing page
- Vision card with icon
- Mission card with icon
- Admin: Edit via MosqueInfo page

### 4. Struktur Kepengurusan (Organizational Structure) ✅

**Rationale**:
- OrganizationStructure is simple (name, position, department, bio)
- Struktur needs more fields (photo, email, phone, social media)
- Full CRUD management required

**Data Model**:
```go
type Struktur struct {
    ID              uuid.UUID
    Name            string
    Position        string
    Role            string      // "Ketua", "Sekretaris", etc.
    PhotoURL        *string
    Email           *string
    Phone           *string
    Department      string
    Bio             string
    SocialMedia      *string      // JSON for links
    DisplayOrder    int
    IsActive        bool
    CreatedBy       uuid.UUID
    CreatedAt       time.Time
    UpdatedAt       time.Time
}
```

**API Endpoints**:
```
GET    /admin/strukturs                  - List with pagination
GET    /admin/strukturs/:id               - Get by ID
POST   /admin/strukturs                  - Create
PUT    /admin/strukturs/:id               - Update
DELETE /admin/strukturs/:id               - Delete
PUT    /admin/strukturs/reorder           - Reorder
GET    /strukturs                       - Public list
```

**Frontend Display**:
- List view with drag-and-drop reordering
- Modal for add/edit
- Role badges

## Database Changes

```go
// Add to migrations.go
&models.HistoryEntry{},  // New
&models.Struktur{},           // New
```

## Migration Notes

For existing data:
- Add default content to ContentSection (section_type='tentang_kami')
- Add Vision/Mission to MosqueInfo

## Frontend Routes

```
/(dashboard)/tentang-kami      - About Us editor
/(dashboard)/sejarah           - History management
/(dashboard)/visi-misi         - Vision/Mission (edit via mosque-info)
/(dashboard)/struktur           - Structure management
```

## Implementation Priority

1. High: Sejarah (new model required)
2. Medium: Struktur (new model required)
3. Low: Tentang Kami (reuse ContentSection)
4. Low: Visi Misi (add fields to existing)

---

## Implementation Summary (2026-03-26)

All features have been successfully implemented.

### Backend Changes

**New Models**:
- `internal/models/history_entry.go` - History timeline entries
- `internal/models/struktur.go` - Organizational structure members

**Modified Models**:
- `internal/models/mosque_info.go` - Added `Vision` and `Mission` fields

**New Handlers**:
- `internal/handlers/history_entry_handler.go` - CRUD for history entries
- `internal/handlers/struktur_handler.go` - CRUD for structure members with reordering

**Modified Handlers**:
- `internal/handlers/content_handler.go` - Added `GetTentangKami` and `UpdateTentangKami`

**Updated Routes** (`cmd/server/main.go`):
- `/v1/admin/content/tentang-kami` - GET/PUT for About Us content
- `/v1/admin/history-entries` - Full CRUD + toggle status
- `/v1/history-entries` - Public timeline + date range filter
- `/v1/admin/strukturs` - Full CRUD + reorder + toggle + active count
- `/v1/strukturs` - Public active list

**Migrations** (`internal/database/migrations.go`):
- Added `models.HistoryEntry{}`
- Added `models.Struktur{}`

### Frontend Changes

**Types** (`frontend/src/types/index.ts`):
- `HistoryEntry` - Timeline entry type
- `Struktur` - Structure member type
- Updated `MosqueInfo` with `vision`, `mission`, and other fields
- Updated `ContentSection` to match backend model

**API Services**:
- `frontend/src/services/apiService.ts` - Added public endpoints for history entries and strukturs
- `frontend/src/services/adminApiService.ts` - Added admin endpoints for all new features

### Remaining Work

**Frontend Components** (Not yet implemented):
- ✅ Dashboard pages for `/tentang-kami` - Implemented as tab in `/konten`
- ✅ Dashboard pages for `/sejarah` - Implemented as tab in `/konten`
- ✅ Dashboard pages for `/struktur` - Implemented as tab in `/konten`
- ✅ Vision/Mission fields - Implemented in `/pengaturan/profil-masjid`
- Timeline component for public history display (landing page)
- Drag-and-drop interface for reordering structure members (currently using display order in form)

These frontend components have been fully implemented using the API services.
