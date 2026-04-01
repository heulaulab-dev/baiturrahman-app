# Admin UI Polish and Shadcn Normalization Design

## Context

The admin surface under `frontend/src/app/(app)` currently mixes polished and ad-hoc UI patterns. Several pages and shared components use hardcoded layout/color decisions and custom primitives where shadcn components already provide better consistency. This creates visible style drift, especially against the existing landing-page palette system.

This design defines a focused UI normalization pass to remove "UI slop" without changing backend contracts or route behavior.

## Goals

- Normalize admin UI to shadcn-first composition where practical.
- Align visual tokens to the existing landing-page palette and semantic theme usage.
- Improve spacing, hierarchy, and state consistency across admin pages.
- Keep feature behavior, data flow, and routing unchanged.

## Non-Goals

- No API changes, no data model changes, no hook/service contract changes.
- No broad product redesign or feature scope expansion.
- No unrelated refactors outside admin surface and directly coupled shared components.

## Selected Approach

Use a targeted component replacement strategy (recommended option):

1. Replace non-shadcn primitives in admin pages and shared admin components.
2. Normalize color/surface usage to semantic theme tokens mapped to existing landing palette.
3. Standardize spacing and typography rhythm while keeping page structure and behavior intact.
4. Extract only minimal reusable wrappers where repetition is obvious.

This balances speed, quality, and regression risk better than full-page redesign or heavy design-system extraction first.

## Scope

### In Scope

- Route files under `frontend/src/app/(app)` limited to:
  - `dashboard/page.tsx`
  - `dashboard/profil/page.tsx`
  - `pengaturan/page.tsx`
  - `jadwal/page.tsx`
  - `jamaah/page.tsx`
  - `donasi/page.tsx`
  - `laporan/page.tsx`
  - `konten/page.tsx`
  - `reservasi/page.tsx`
  - `layout.tsx`
- Directly related shared admin components, including:
  - `frontend/src/components/site-header.tsx`
  - `frontend/src/components/app-sidebar.tsx`
  - Dashboard/shared admin widgets used by `(app)` routes.
  - Any touched component must be imported by one of the route files above.

### Out of Scope

- Public landing pages and unrelated shared components.
- Backend and API logic.
- Any file not explicitly listed above (or directly imported by those listed files) requires a follow-up spec.

## Architecture and Component Strategy

### Page Layer

- Preserve current route structure and data fetching hooks.
- Recompose page sections with shadcn primitives (`Card`, `Tabs`, `Table`, `Badge`, `Button`, `Skeleton`, `Separator`, `DropdownMenu`) where equivalent custom UI exists.
- Ensure consistent section shell patterns (header + content + optional action row).

### Shared Layer

- Update `site-header` and `app-sidebar` spacing/token usage so all admin pages inherit a cleaner baseline.
- Keep sidebar behavior (expanded/collapsed/hover/mobile) unchanged.

### Behavior Freeze Clause

- No changes to event handler semantics, hook/service inputs and outputs, route transitions, query parameter contracts, auth gating, or sidebar interaction logic.
- If a shadcn replacement cannot preserve behavior 1:1, keep existing primitive and only normalize styling around it.

### Reuse Strategy

- Add thin reusable admin wrappers only when repeated structure appears in multiple pages.
- Avoid over-abstraction and keep components easy to reason about.

## Visual System Rules

- Use semantic color tokens and existing theme variables tied to landing palette direction.
- Remove harsh one-off color usage and ad-hoc emphasis styles.
- Keep visual hierarchy consistent:
  - predictable heading scale
  - stable card/table spacing
  - consistent muted/foreground usage for metadata text.

### Token/Class Contract

Approved classes for admin surfaces should be semantic/token-based (for example):
- Surfaces: `bg-background`, `bg-card`, `bg-muted/30`, `bg-muted/50`
- Text: `text-foreground`, `text-muted-foreground`
- Borders: `border`, `border-border`
- Emphasis/states: use existing variant props on shadcn components before adding ad-hoc utilities.

Disallowed patterns in touched admin files:
- Hardcoded color values in classes/styles (`#`, `rgb()`, `hsl()`).
- One-off custom utility stacks that bypass shadcn variants for standard UI states where equivalents exist.

## Data Flow and Behavior

- Existing hooks/services remain the source of truth (`useDonationStats`, `useAdminEvents`, `useAdminUsers`, and related admin hooks).
- UI normalization does not alter API requests, response handling, auth flow, or redirects.
- State rendering is standardized:
  - loading -> consistent `Skeleton` patterns
  - empty -> consistent `Card`-based empty states
  - populated -> consistent `Card` + content composition.

## Error Handling

- Preserve current auth gate behavior in admin layout.
- Keep existing network and error behavior in hooks/services.
- Any fallback/placeholder added by this pass must be purely presentational and non-breaking.

## Testing and Verification Plan

### Automated

- Run frontend lint after changes.

### Manual

- Spot-check key routes: `dashboard`, `pengaturan`, `jadwal`, `jamaah`, `donasi`, `laporan`, `konten`, `reservasi`.
- Verify desktop/mobile sidebar and header behavior remains intact.
- Validate loading/empty/populated states on dashboard and at least one data-table-heavy page.
- Validate behavioral invariants:
  - sidebar expand/collapse/hover/mobile drawer parity
  - header controls parity
  - one CRUD-like flow and one table flow (sort/filter/pagination if present) unchanged
  - auth guard and redirect behavior unchanged
  - network endpoint/payload parity (no new or changed requests from this refactor).

## Definition of Done

- All touched pages/components use approved semantic token classes for surface/text/border styling.
- No hardcoded hex/rgb/hsl color usage in touched admin files.
- No ad-hoc raw primitives where shadcn equivalents are available and behavior can be preserved 1:1.
- All behavioral invariant checks in the test plan pass.
- Shared admin chrome aligns with landing palette semantics.
- Lint passes for touched frontend files.

## Risks and Mitigations

- **Risk:** visual regressions from class/token migration.
  - **Mitigation:** incremental route-by-route updates and manual verification per route group.
- **Risk:** accidental behavior changes during JSX replacement.
  - **Mitigation:** keep state/data logic untouched and limit edits to presentational composition.
- **Risk:** over-abstracting too early.
  - **Mitigation:** extract wrappers only after repeated patterns are confirmed.

## Implementation Readiness

This spec is approved for planning and implementation once spec review passes and user confirms no additional scope constraints.
