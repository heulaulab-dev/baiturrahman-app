# Design Spec: Modul Mitra & Sponsor (Publik + Dashboard)

**Date:** 2026-04-13  
**Branch:** `feature/sponsor-module`  
**Status:** Ready for review  
**Relates to:** Pola `HeroSlide` / `GalleryItem` (CRUD admin, reorder, GET publik), RBAC `permission.go`, landing + route publik baru.

---

## 1. Masalah

Belum ada cara terstruktur untuk mencatat **mitra/sponsor**, menampilkan **logo dan tautan** di **beranda** dan di **halaman daftar lengkap**, serta mengatur **periode tampil** di situs publik terpisah dari **periode kontrak** yang hanya relevan untuk administrasi.

## 2. Tujuan

1. **Backend:** Menyimpan sponsor sebagai entitas **pertama** (`sponsors`), dengan urutan manual, logo (URL upload), tautan opsional, teks singkat, jendela **visibilitas publik** (tanggal), jendela **kontrak/rekam** (tanggal, admin-only), dan flag **tampil di beranda**.
2. **API publik:** Mengembalikan hanya sponsor yang **saat ini layak tampil** menurut **tanggal visibilitas**; **tidak** mengekspos field kontrak.
3. **API admin:** CRUD + reorder konsisten dengan resource lain (`PUT .../reorder` dengan `{ items: [{ id, sort_order }] }`).
4. **Beranda:** Blok ringkas sponsor yang memenuhi visibilitas **dan** `show_on_landing`; tautan ke halaman daftar penuh.
5. **Halaman publik tunggal:** Satu route (mis. `/mitra`) berisi semua sponsor yang layak tampil (tanpa halaman detail per sponsor di v1).

## 3. Keputusan produk (terkunci)

| Topik | Keputusan |
|-------|-----------|
| Sumber kebenaran publik | Hanya **rentang visibilitas** (`visibility_start` / `visibility_end`). |
| Rentang kontrak | Disimpan untuk **admin**; **tidak** mempengaruhi apakah muncul di publik. |
| Permukaan publik | **Beranda** (subset) + **satu halaman daftar**; **tanpa** `/mitra/[slug]`. |
| Organisasi daftar | **Flat**, urutan **manual global** (`sort_order`). |
| Beranda vs daftar penuh | **Flag per sponsor** `show_on_landing`; urutan mengikuti **urutan global** (filter subset). |
| API landing | **Query** `for_landing=1` (atau `landing=true`) pada GET publik untuk mengurangi payload beranda. |

## 4. Ruang lingkup luar (non-goals) v1

- Halaman detail sponsor di domain sendiri (slug).
- Tier / level (Platinum, Gold, dll.).
- Bahasa ganda terpisah per field (bisa ditambah kemudian).
- Integrasi pembayaran atau donasi otomatis.

## 5. Model data

Tabel `sponsors` (nama tabel final mengikuti konvensi GORM/repo):

| Field | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID, PK | |
| `name` | string, wajib | Nama mitra |
| `logo_url` | string, opsional | URL hasil upload; UI fallback jika kosong |
| `website_url` | string, opsional | Tautan eksternal |
| `description` | text, opsional | Teks singkat untuk kartu di halaman daftar |
| `visibility_start` | date, nullable | Wajib **terisi** agar baris bisa masuk logika publik; jika null → **tidak** ditampilkan ke publik |
| `visibility_end` | date, nullable | Null = **terbuka** (tetap tampil setelah start sampai admin mengisi akhir atau menghapus) |
| `contract_start` | date, nullable | Hanya admin |
| `contract_end` | date, nullable | Hanya admin |
| `show_on_landing` | bool, default false | Subset beranda |
| `sort_order` | int | Urutan manual |
| `created_at` / `updated_at` / `deleted_at` | | Soft delete selaras entitas lain |

### 5.1 Validasi (admin)

- `name` non-kosong.
- Jika `visibility_end` diisi: `visibility_start` wajib ada dan `visibility_end >= visibility_start`.
- Jika `contract_end` diisi: `contract_start` wajib ada dan `contract_end >= contract_start`.
- **Tidak** ada validasi silang visibilitas vs kontrak.

### 5.2 Kelayakan publik (satu fungsi/helper di backend)

Baris ikut respons publik jika dan hanya jika:

- `visibility_start` **tidak null**, dan
- `today` (lihat §8) memenuhi `today >= visibility_start` dan (`visibility_end` null atau `today <= visibility_end`).

Tidak ada field `is_published` terpisah pada v1; visibilitas tanggal + soft delete menjadi kontrol utama.

## 6. API

Format respons tetap `utils.SuccessResponse` / `utils.ErrorResponse`.

### 6.1 Publik (tanpa JWT)

- `GET /api/v1/sponsors` — semua sponsor **layak publik**, urut `sort_order ASC`, tie-break `created_at ASC`. Body **tanpa** `contract_start` / `contract_end`.
- `GET /api/v1/sponsors?for_landing=1` — sama, ditambah filter `show_on_landing = true`.

### 6.2 Admin (JWT + izin; lihat §7)

- `GET /api/v1/admin/sponsors`
- `POST /api/v1/admin/sponsors`
- `PUT /api/v1/admin/sponsors/:id`
- `DELETE /api/v1/admin/sponsors/:id`
- `PUT /api/v1/admin/sponsors/reorder` — body seperti `ReorderHeroSlides`: `{ "items": [ { "id", "sort_order" } ] }`

**Upload:** Tambahkan modul allowlist upload (mis. `sponsors` atau `sponsor`) agar folder penyimpanan jelas, mengikuti pola galeri/hero.

## 7. RBAC

- Tambah katalog permission **menu**, mis. key `access_sponsors` (nama UI: “Akses Mitra & Sponsor” atau setara), di `DefaultPermissionsCatalog()` dan seed/migrasi permission seperti modul lain.
- Daftarkan route admin dengan middleware yang sama dengan resource konten yang memerlukan izin menu terkait.
- v1: **satu** izin akses modul (tanpa pisah read/write) kecuali kebutuhan audit memaksa lain.

## 8. Frontend

### 8.1 Publik

- **Landing:** Komponen baru atau ekstensi landing; fetch `GET .../sponsors?for_landing=1`; grid/strip logo; `href` eksternal dengan `target="_blank"` dan `rel="noopener noreferrer"` jika ada `website_url`; CTA ke halaman daftar penuh.
- **Halaman daftar:** Route di grup publik (path implementasi: mis. `/mitra`); fetch `GET .../sponsors`; kartu dengan logo, nama, deskripsi singkat, tautan.

Jika respons kosong: **sembunyikan** blok beranda (tanpa placeholder mencolok); halaman daftar boleh menampilkan empty state singkat.

### 8.2 Dashboard

- Halaman manajemen: daftar, form tambah/ubah (kedua pasang tanggal, toggle beranda, upload logo), hapus, reorder (drag atau kontrol setara hero/galeri).
- Invalidasi query TanStack Query setelah mutasi; toast selaras dashboard.

## 9. Edge cases & timezone

- **Hari kalender “today”:** Gunakan **Asia/Jakarta** untuk menentukan tanggal banding terhadap kolom `date` (dokumentasikan di kode; jika backend sudah punya `TZ` global, gunakan konsisten).
- Tautan eksternal: validasi format ringan saat disimpan jika pola repo sudah ada.

## 10. Pengujian

- **Unit test (Go):** Fungsi kelayakan publik — sebelum start, di dalam rentang, setelah end, `visibility_end` null, `visibility_start` null (tidak publik).
- **Manual QA:** CRUD admin, reorder, filter beranda, halaman penuh, soft delete tidak muncul di publik.

## 11. Alternatif yang sengaja tidak dipilih

- **Satu GET tanpa query:** Klien memfilter `show_on_landing`; lebih sederhana API tetapi payload beranda lebih besar — tidak dipilih untuk v1.
- **Blob JSON di pengaturan:** Cepat tetapi lemah untuk validasi, RBAC, dan reorder — ditolak.

---

## 12. Persetujuan

Setelah spec ini disetujui, langkah berikutnya: dokumen **implementation plan** terpisah (alir `writing-plans`), lalu implementasi backend → API publik → dashboard → landing + halaman publik.
