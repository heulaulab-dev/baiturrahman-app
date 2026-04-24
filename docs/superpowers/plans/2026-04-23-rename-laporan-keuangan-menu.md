# Rename Menu Laporan Bulanan ke Laporan Keuangan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ubah label navigasi dan copy header halaman laporan agar netral (mencakup periode Bulanan dan Mingguan) tanpa mengubah URL, data, atau perilaku fitur.

**Architecture:** Dua perubahan string di frontend: item submenu `navMain` di sidebar, lalu `CardTitle` + `CardDescription` di halaman route `/keuangan/laporan`. Tidak ada layer baru, tidak ada abstraksi tambahan.

**Tech Stack:** Next.js (App Router), TypeScript, React, Tailwind; perintah di `frontend/` memakai Bun.

**Spec sumber:** `docs/superpowers/specs/2026-04-23-rename-laporan-keuangan-menu-design.md`

---

## File map

| File | Tanggung jawab |
|------|----------------|
| `frontend/src/components/app-sidebar.tsx` | Label submenu di grup Keuangan |
| `frontend/src/app/(app)/keuangan/laporan/page.tsx` | Judul dan deskripsi hero card halaman laporan |

---

### Task 1: Sidebar — label "Laporan Keuangan"

**Files:**
- Modify: `frontend/src/components/app-sidebar.tsx` (sekitar baris 130–132)

- [ ] **Step 1: Ganti `title` submenu**

Ganti teks `Laporan Bulanan` menjadi `Laporan Keuangan`. URL `/keuangan/laporan` jangan diubah.

Contoh hasil (fragment):

```typescript
        {
          title: "Laporan Keuangan",
          url: "/keuangan/laporan",
        },
```

- [ ] **Step 2: Verifikasi cepat**

Run: `cd frontend && bun run lint`  
Expected: exit code 0; tidak ada error baru di file yang diubah.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/app-sidebar.tsx
git commit -m "feat(finance): rename laporan menu label to Laporan Keuangan"
```

---

### Task 2: Halaman laporan — judul & deskripsi netral

**Files:**
- Modify: `frontend/src/app/(app)/keuangan/laporan/page.tsx` (sekitar baris 110–111)

- [ ] **Step 1: Ganti `CardTitle` dan `CardDescription`**

Ganti:
- Dari: `Laporan bulanan` + `Ringkasan mutasi per bulan dan unduhan PDF atau Excel.`
- Ke arah: judul "Laporan keuangan" (atau "Laporan Keuangan" — samakan kapitalisasi dengan judul card lain jika perlu) dan deskripsi yang menyebut ringkasan mutasi per periode pilihan (bulanan atau mingguan) serta unduhan PDF/Excel.

Contoh hasil (sesuaikan gaya jika desainer ingin teks beda, tetap isinya multi-periode):

```tsx
              <CardTitle className="text-xl sm:text-2xl">Laporan keuangan</CardTitle>
              <CardDescription>
                Ringkasan mutasi per periode pilihan (bulanan atau mingguan) dan unduhan PDF atau Excel.
              </CardDescription>
```

Perhatikan: jangan ubah `Bulanan` / `Mingguan` pada toggle di bawah (baris ~115–133).

- [ ] **Step 2: Verifikasi**

Run: `cd frontend && bun run lint`  
Expected: exit code 0.

- [ ] **Step 3: Uji manual singkat (checklist spec)**

1. Buka app → pastikan di sidebar Keuangan ada **Laporan Keuangan**.
2. Klik → URL `/keuangan/laporan` — toggle Bulanan/Mingguan, export, dan isi tabel tetap bekerja seperti sebelum perubahan copy.

- [ ] **Step 4: Commit**

```bash
git add "frontend/src/app/(app)/keuangan/laporan/page.tsx"
git commit -m "feat(finance): align laporan page title with monthly and weekly modes"
```

---

## Self-review (plan vs spec)

| Bagian spec | Tercakup task |
|-------------|---------------|
| Submenu "Laporan Keuangan" | Task 1 |
| Header netral multi-periode | Task 2 |
| URL & tab tidak berubah | Disebutkan di Task 2 |
| No backend / API | Tidak ada task backend |

Tidak ada placeholder TBD di langkah di atas.

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-23-rename-laporan-keuangan-menu.md`. Two execution options:**

1. **Subagent-Driven (recommended)** — dispatch subagent per task, review antar task, iterasi cepat  
2. **Inline execution** — jalankan task di sesi yang sama (executing-plans) dengan checkpoint

**Pilih yang mana?**

---

_Brainstorming handoff: spec sudah di-commit (`579a0bc`); langkah implementasi berikut ini mengikuti rencana di atas._
