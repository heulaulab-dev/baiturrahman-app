# Design Spec: Fitur Kantong Qurban dengan Kapasitas Dinamis

**Date:** 2026-04-16  
**Branch:** `feature/idul-adha`  
**Status:** Approved (Brainstorming)

---

## 1. Latar Belakang

Panitia membutuhkan fitur "kantong qurban" untuk mengelola peserta patungan per hewan qurban. Kebutuhan utama adalah menampilkan daftar hewan (contoh: Sapi 1, Sapi 2) beserta jumlah slot terisi dan daftar nama peserta.

Kapasitas patungan tidak boleh hardcoded (contoh 7), karena dapat berubah sesuai kebijakan panitia. Oleh karena itu, kapasitas harus bersifat dinamis dan dapat diatur dari dashboard admin.

Keputusan utama:

- Kapasitas patungan per jenis hewan diatur dari dashboard admin.
- Tetap ada fleksibilitas override kapasitas untuk hewan tertentu.
- Validasi slot wajib menggunakan kapasitas efektif (default atau override).

---

## 2. Tujuan dan Non-Tujuan

### 2.1 Tujuan

1. Menyediakan pengelolaan peserta patungan per hewan qurban secara terstruktur.
2. Menyediakan konfigurasi kapasitas dinamis untuk `sapi` dan `kambing` via dashboard admin.
3. Menampilkan status slot yang jelas (`terisi X/Y`, `Open`, `Full`) untuk operasional panitia.
4. Mencegah over-capacity dan duplikasi data peserta dalam hewan yang sama.

### 2.2 Non-Tujuan

1. Tidak mencakup pembayaran online otomatis pada fase awal.
2. Tidak mencakup pendaftaran publik mandiri jamaah pada fase awal.
3. Tidak mencakup otomasi distribusi daging/kupon pada fase ini.

---

## 3. Pendekatan yang Dipilih

Pendekatan final: **Global Config + Override per Hewan**.

1. Admin menetapkan default kapasitas patungan per jenis hewan di halaman pengaturan qurban:
   - `default_max_participants_sapi`
   - `default_max_participants_kambing`
2. Saat admin membuat hewan baru, sistem memakai default sesuai jenis hewan.
3. Jika diperlukan, admin dapat override kapasitas di level hewan individual.

Alasan pemilihan:

- Tetap sederhana untuk penggunaan harian (cukup set default sekali).
- Tetap fleksibel untuk kondisi khusus lapangan tanpa ubah konfigurasi global.

---

## 4. Arsitektur Data

### 4.1 Entitas

**QurbanSettings**
- `id`
- `default_max_participants_sapi` (integer, > 0)
- `default_max_participants_kambing` (integer, > 0)
- `updated_at`

**QurbanAnimal**
- `id`
- `label` (contoh: `Sapi 1`)
- `animal_type` (`sapi` | `kambing`)
- `max_participants_override` (nullable integer, > 0)
- `created_at`, `updated_at`

**QurbanParticipant**
- `id`
- `qurban_animal_id` (FK ke QurbanAnimal)
- `name`
- `phone` (opsional)
- `notes` (opsional)
- `created_at`, `updated_at`

### 4.2 Aturan Kapasitas Efektif

`effective_max_participants` ditentukan dengan urutan:

1. Gunakan `QurbanAnimal.max_participants_override` jika terisi.
2. Jika `null`, gunakan default dari `QurbanSettings` sesuai `animal_type`.

---

## 5. Admin UI dan Alur Operasional

### 5.1 Halaman Pengaturan Qurban

Admin dapat mengatur:

- Default kapasitas `sapi`
- Default kapasitas `kambing`

Catatan UI:

- Tampilkan helper text bahwa default hanya diterapkan ke hewan baru.
- Simpan perubahan dengan feedback sukses/gagal yang jelas.

### 5.2 Halaman Kantong Qurban

Daftar hewan menampilkan:

- Label hewan (`Sapi 1`, `Kambing 1`, dll)
- Jenis hewan
- Kapasitas efektif
- Jumlah peserta terisi
- Status (`Open` jika belum penuh, `Full` jika penuh)

Aksi admin per hewan:

- Lihat daftar peserta
- Tambah peserta
- Edit kapasitas override
- Pindahkan peserta ke hewan lain

### 5.3 Flow Harian Panitia

1. Set default kapasitas di `Pengaturan Qurban`.
2. Buat daftar hewan qurban.
3. Input peserta per hewan.
4. Pantau status slot (`X/Y`).
5. Export rekap peserta per hewan untuk kebutuhan operasional.

---

## 6. Validasi dan Error Handling

1. **Cek over-capacity**  
   Saat tambah peserta, backend harus menolak jika `current_count >= effective_max_participants`.

2. **Cegah duplikasi pada hewan sama**  
   Nama peserta yang sama tidak boleh didaftarkan dua kali dalam hewan yang sama.

3. **Override tidak boleh di bawah peserta aktif**  
   Update override ditolak jika nilai baru < jumlah peserta saat ini.

4. **Pindah peserta antar hewan**  
   Hanya boleh jika hewan target masih punya slot.

5. **Delete hewan**  
   Ditolak jika masih punya peserta aktif, kecuali ada alur pemindahan/hapus peserta terlebih dahulu.

6. **Race condition input simultan**  
   Validasi kapasitas wajib di backend dalam transaksi DB agar tidak terjadi slot overbook saat dua admin submit bersamaan.

---

## 7. Perilaku Saat Config Default Berubah

Perubahan default kapasitas **tidak mengubah otomatis** hewan yang sudah ada.

- Hewan existing mempertahankan kapasitas efektif yang sudah berlaku saat dibuat (atau override saat ini).
- Hewan baru menggunakan default terbaru.

Tujuan keputusan ini adalah menjaga stabilitas operasional agar data berjalan tidak berubah mendadak di tengah proses pendaftaran.

---

## 8. API dan Integrasi (High-Level)

Endpoint detail menyesuaikan pola backend yang sudah ada, namun secara high-level membutuhkan:

1. Endpoint read/update `QurbanSettings`.
2. CRUD `QurbanAnimal`.
3. CRUD `QurbanParticipant`.
4. Endpoint action untuk pindah peserta antar hewan (opsional dedicated endpoint).

Semua endpoint admin wajib mengikuti middleware auth + role admin existing.

---

## 9. Testing Strategy

### 9.1 Service/Unit

1. Hitung `effective_max_participants` dari default vs override.
2. Validasi tambah peserta gagal ketika slot penuh.
3. Validasi duplicate peserta di hewan yang sama.
4. Validasi override tidak boleh kurang dari peserta aktif.

### 9.2 Integration/API

1. Buat hewan baru lalu isi peserta sampai penuh; peserta ke-`N+1` harus gagal.
2. Pindahkan peserta ke hewan lain dengan slot penuh harus gagal.
3. Ubah default config, lalu verifikasi hewan baru pakai nilai terbaru.

### 9.3 Manual QA

1. Pastikan badge `Open/Full` akurat di daftar hewan.
2. Pastikan pesan error user-friendly untuk panitia non-teknis.
3. Pastikan daftar nama peserta per hewan terbaca jelas untuk operasional hari-H.

---

## 10. Risiko dan Mitigasi

1. **Risiko salah ubah konfigurasi kapasitas**  
   **Mitigasi:** validasi numeric > 0, helper text, konfirmasi sebelum simpan.

2. **Risiko data membengkak dan sulit dibaca**  
   **Mitigasi:** tampilkan ringkasan `X/Y`, filter `Open`, dan export rekap.

3. **Risiko konflik input oleh banyak admin**  
   **Mitigasi:** enforce transaksi backend + validation pada saat write.

---

## 11. Definition of Done

1. Admin dapat mengubah default kapasitas sapi/kambing dari dashboard.
2. Admin dapat membuat hewan qurban dan melihat kapasitas efektifnya.
3. Admin dapat menambah/mengelola peserta patungan per hewan.
4. Sistem mencegah over-capacity dan duplicate pada hewan yang sama.
5. Daftar hewan menampilkan status slot `X/Y` serta status `Open/Full`.
6. Tersedia rekap peserta per hewan yang siap dipakai panitia.
