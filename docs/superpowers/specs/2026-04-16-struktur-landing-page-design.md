# Design Spec: Halaman Publik Struktur (`/struktur`) dari Modul Anggota

**Date:** 2026-04-16  
**Branch:** `revamp/laporan-keuangan`  
**Status:** Approved (Brainstorming)

---

## 1. Latar Belakang

Modul struktur di dashboard sudah memungkinkan admin menambahkan anggota kepengurusan. Kebutuhan revamp selanjutnya adalah menampilkan data anggota tersebut pada halaman publik khusus di landing domain, bukan hanya sebagai section internal home.

Keputusan utama dari user:

- Tambah halaman publik baru: `/struktur`
- Data publik hanya anggota aktif (`is_active = true`)
- Kartu anggota menampilkan: foto, nama, jabatan/role, departemen
- Landing home tetap menampilkan semua anggota aktif (tanpa limit)
- Tidak menambah menu baru di header publik

---

## 2. Tujuan dan Non-Tujuan

### 2.1 Tujuan

1. Menyediakan halaman publik `/struktur` untuk menampilkan seluruh anggota aktif.
2. Menjaga konsistensi tampilan data struktur antara landing home dan halaman `/struktur`.
3. Menambahkan jalur navigasi dari section landing ke halaman `/struktur`.

### 2.2 Non-Tujuan

1. Tidak menambah endpoint backend baru.
2. Tidak mengubah alur CRUD admin modul struktur.
3. Tidak menambah filter, pagination, atau pencarian pada `/struktur` untuk fase ini.
4. Tidak menambah menu header publik baru.

---

## 3. Keputusan Desain

| Area | Keputusan |
|---|---|
| URL halaman publik | `/struktur` |
| Sumber data | Endpoint publik existing struktur (aktif saja) |
| Scope data | Hanya `is_active = true` |
| Konten kartu publik | Foto, nama, role, departemen |
| Landing section | Tetap tampil semua anggota aktif |
| Navigasi | CTA/link dari section landing ke `/struktur` (tanpa menu header baru) |
| Arsitektur komponen | Reuse komponen struktur existing dengan mode/variant |

---

## 4. Arsitektur Frontend

### 4.1 Reuse Komponen

Komponen `StrukturSection` akan direfaktor menjadi reusable untuk dua konteks:

- `landing` mode: dipakai di halaman home
- `page` mode: dipakai di halaman `/struktur`

Tujuan:

- menghindari duplikasi mapping role badge, fallback foto, dan struktur kartu
- menjaga visual dan data behavior tetap sinkron antar tampilan

### 4.2 Route Baru

Tambahkan route publik baru:

- `frontend/src/app/.../struktur/page.tsx` (mengikuti route group publik aktual di repo)

Halaman ini:

- menampilkan judul/subjudul halaman struktur
- menampilkan grid anggota aktif dengan komponen reuse
- menambahkan metadata SEO dasar (`title`, `description`)

### 4.3 Landing Integration

Section struktur pada landing tetap dipertahankan (tanpa limit), lalu ditambah CTA:

- label contoh: `Lihat Struktur Lengkap`
- target: `/struktur`

---

## 5. Data & Mapping Rules

### 5.1 Field yang Ditampilkan

Untuk semua tampilan publik (landing + `/struktur`), field kartu dibatasi ke:

1. `photo_url` (dengan fallback avatar)
2. `name`
3. `role` (badge label/warna)
4. `department` (opsional)

Field sensitif/non-prioritas yang **tidak** ditampilkan:

- email
- phone
- social media
- bio

### 5.2 Status Aktif

Halaman publik hanya menampilkan data aktif. Karena endpoint publik existing sudah memfilter aktif, frontend cukup mengonsumsi data tersebut tanpa membuka opsi tampil nonaktif.

---

## 6. Error Handling & Empty State

1. **Loading state**: tampilkan skeleton/placeholder agar transisi halus.
2. **Empty state**: tampilkan pesan jelas jika tidak ada anggota aktif.
3. **API error state**: tampilkan fallback message ringan, tanpa crash UI.
4. **Invalid image URL**: fallback ke avatar default agar layout tetap stabil.

---

## 7. Dampak Teknis

### 7.1 Backend

Tidak ada perubahan backend yang wajib untuk fitur ini, karena:

- endpoint publik struktur sudah tersedia
- filter anggota aktif sudah ditangani query endpoint publik

### 7.2 Frontend (Perkiraan File)

- Modify: `frontend/src/components/landing/StrukturSection.tsx`
- Create: `frontend/src/app/.../struktur/page.tsx` (route group publik aktual)
- Modify: file landing/home yang menggunakan `StrukturSection` (jika perlu pass mode/props)
- Optional: `frontend/src/types/index.ts` jika butuh penyesuaian type ringan

---

## 8. Testing Strategy

### 8.1 Component/Unit (jika test setup tersedia)

1. Render kartu hanya berisi foto/nama/role/departemen.
2. Mode `landing` menampilkan CTA ke `/struktur`.
3. Mode `page` tidak menampilkan CTA khusus landing.

### 8.2 Manual Smoke

1. Buat dua anggota di dashboard: satu aktif, satu nonaktif.
2. Verifikasi landing hanya menampilkan anggota aktif.
3. Klik CTA dari landing menuju `/struktur`.
4. Verifikasi `/struktur` hanya menampilkan anggota aktif.
5. Verifikasi fallback avatar ketika foto kosong/rusak.
6. Verifikasi responsive mobile/desktop.

---

## 9. Risiko dan Mitigasi

1. **Risiko drift tampilan landing vs page**  
   **Mitigasi:** satu komponen reuse dengan mode.

2. **Risiko data yang ditampilkan berlebih (kontak pribadi)**  
   **Mitigasi:** batasi field publik ke empat field yang disetujui.

3. **Risiko UX landing terlalu padat**  
   **Mitigasi:** tetap tanpa limit sesuai kebutuhan, namun pertahankan spacing/grid agar terbaca.

---

## 10. Definition of Done

1. Route publik `/struktur` aktif dan dapat diakses.
2. Halaman `/struktur` menampilkan semua anggota aktif.
3. Landing tetap menampilkan semua anggota aktif.
4. Kartu publik hanya memuat foto, nama, role, departemen.
5. CTA dari section landing ke `/struktur` berfungsi.
6. Tidak ada regresi pada alur admin modul struktur.
