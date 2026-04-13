# Design Spec: Landing Hero — Banner Carousel (Dashboard-Managed)

**Date:** 2026-04-11  
**Branch:** `feature/dashboard-ui` (asumsi)  
**Status:** Ready for review  
**Relates to:** `frontend/src/components/landing/HeroSection.tsx`, `frontend/src/app/(app)/konten/page.tsx` (tab Banner)

---

## 1. Masalah

Hero beranda saat ini tidak memakai foto latar; aset bersifat statis (tipografi, calligraphy, grain). Tab **Konten → Banner** sudah ada tetapi placeholder (“Pengelolaan banner hero akan ditambahkan…”). Pengurus perlu mengatur **beberapa gambar** untuk hero, **tanpa** mencampur dengan **Galeri** (bukan opsi “pakai foto galeri yang sama”).

## 2. Tujuan

1. **Backend:** Menyimpan slide hero sebagai entitas **terpisah** dari `GalleryItem`, dengan urutan, status aktif/publik, dan URL gambar (upload admin).
2. **API publik:** Mengembalikan daftar slide yang boleh ditampilkan di beranda, terurut, tanpa autentikasi.
3. **API admin:** CRUD + reorder untuk slide hero, konsisten pola dengan galeri.
4. **Dashboard:** Mengisi tab **Banner** dengan pengelolaan slide (tambah upload, urutkan, hapus, toggle publikasi jika dipakai).
5. **Landing:** Menampilkan **karusel latar** di belakang konten hero yang ada; jika tidak ada slide, **fallback** ke tampilan hero saat ini (tanpa foto).

## 3. Ruang lingkup luar (non-goals)

- Berbagi aset atau toggle dengan **Galeri** (diputuskan: **terpisah**).
- Mengedit headline / CTA hero dari Banner (tetap di kode atau sumber lain).
- Video background (hanya gambar pada v1).

## 4. Model data

Tabel baru, misalnya `hero_slides` (nama final bebas, konsisten dengan konvensi repo):

| Field | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID, PK | Default `gen_random_uuid()` |
| `image_url` | string, wajib | URL setelah upload (sama pola dengan galeri) |
| `alt_text` | string, opsional | Aksesibilitas; disarankan diisi |
| `sort_order` | int, indexed | Urutan tampil; reorder memperbarui nilai |
| `is_published` | bool, default false | Hanya yang `true` ikut API publik |
| `created_at` / `updated_at` | timestamp | Standar |

**Batasan v1:** maksimal jumlah slide aktif atau total (mis. **10** slide per sistem); validasi di create/reorder.

AutoMigrate GORM + registrasi di migrasi agregat yang sama dengan entitas lain.

## 5. API

**Konvensi respons:** Tetap memakai format sukses/error yang dipakai handler lain (`utils.SuccessResponse`, dll.).

### 5.1 Publik

- `GET /api/v1/hero/slides` — daftarkan di grup **public** yang sama dengan `GET /gallery/items` (lihat `backend/cmd/server/main.go`).
- Mengembalikan hanya slide dengan `is_published = true`, urut `sort_order ASC`, tanpa field internal yang tidak perlu.

### 5.2 Admin (JWT + peran admin seperti endpoint galeri)

- `GET /api/v1/admin/hero/slides` — semua slide (untuk UI konten).
- `POST /api/v1/admin/hero/slides` — body: `image_url`, opsional `alt_text`, `is_published`; `sort_order` bisa default ke akhir.
- `PUT /api/v1/admin/hero/slides/:id` — partial update.
- `DELETE /api/v1/admin/hero/slides/:id`.
- `PUT /api/v1/admin/hero/slides/reorder` — body mirip `ReorderGalleryItems` (array `{ id, sort_order }`).

### 5.3 Upload

- Menambahkan modul upload **`hero`** (atau `banner`) ke allowlist `allowedUploadModules` dan alias jika perlu, agar unggahan dari tab Banner disimpan di folder yang jelas terpisah dari `gallery`.

## 6. Frontend — beranda

- **Data:** Hook TanStack Query (pola `useGalleryItems`) memanggil GET publik hero slides.
- **Komponen:** Lapisan absolut `inset-0` di bawah konten; gambar `next/image` dengan `fill`, `object-cover`, `sizes` untuk viewport; URL melalui `resolveBackendAssetUrl` seperti galeri.
- **Karusel:** Crossfade atau slide ringan; **autoplay** interval tetap v1 (mis. 6–8 detik), jeda saat tab tidak terlihat (`IntersectionObserver`) dan saat hover/fokus kontrol.
- **Overlay:** Scrim gelap + gradien agar teks dan elemen UI tetap kontras pada foto apa pun (opacity tetap v1; bisa di-tokenkan kemudian).
- **Kontrol:** Indikator dot atau strip progres; opsional prev/next; fokus keyboard dapat diarahkan ke kontrol.
- **`prefers-reduced-motion`:** Nonaktifkan autoplay atau batasi ke satu slide statis + navigasi manual sesuai kebijakan implementasi.

## 7. Frontend — dashboard (Konten → Banner)

- Mengganti placeholder tab **Banner** dengan manajemen slide: daftar, pratinjau thumbnail, upload baru (modul `hero`), field alt, toggle publikasi, hapus, **drag reorder** mengikuti pola `GalleryManagement`.
- Invalidasi query setelah mutasi; pesan sukses/error dengan `toast` selaras dashboard.

## 8. Edge cases

- **Tidak ada slide publik atau gagal fetch:** Render hero **persis seperti sekarang** (tanpa layer foto), tanpa error yang mengganggu pengunjung.
- **URL gambar rusak:** Sembunyikan slide bermasalah atau fallback; idealnya log di konsol dev saja di v1.
- **Validasi admin:** Tolak create jika melebihi batas jumlah slide.

## 9. Uji penerimaan (manual)

1. Tanpa data: hero tampil seperti sekarang.
2. Satu slide: satu gambar full-bleed, konten hero terbaca.
3. Beberapa slide: rotasi autoplay; reorder di admin mengubah urutan di beranda.
4. Unpublish / hapus: slide hilang dari publik.
5. Reduced motion: tidak ada autoplay mengganggu atau perilaku sesuai pilihan implementasi.
6. Mobile: tidak ada overflow horizontal; kontrol dapat digunakan.

## 10. Risiko dan mitigasi

| Risiko | Mitigasi |
|--------|----------|
| Foto terlalu terang/mengganggu teks | Overlay kuat + uji dengan beberapa foto nyata |
| Bundle carousel | Pakai dependensi yang sudah ada di repo jika memungkinkan; jika tidak, pilih library ringan |

---

**Keputusan produk yang sudah dikunci:** Slide hero **bukan** bagian dari Galeri; dikelola hanya lewat **Konten → Banner** dengan tabel/backend terdedikasi.
