# Design Spec: Rename Menu Laporan Bulanan ke Laporan Keuangan

**Date:** 2026-04-23  
**Status:** Approved (Brainstorming)

---

## 1. Latar Belakang

Di modul `Keuangan`, submenu saat ini masih bertuliskan **"Laporan Bulanan"**, padahal halaman laporan sudah mendukung dua periode: **Bulanan** dan **Mingguan**.  
Label menu lama berpotensi menimbulkan ekspektasi bahwa halaman hanya berisi laporan bulanan.

---

## 2. Tujuan dan Non-Tujuan

### 2.1 Tujuan

1. Menyamakan label navigasi dengan cakupan fitur halaman laporan.
2. Menjaga flow pengguna tetap sama (route, tab, data, dan export tidak berubah).
3. Mengurangi kebingungan pengguna dengan copy yang lebih representatif.

### 2.2 Non-Tujuan

1. Tidak mengubah API backend, hook, atau struktur data laporan.
2. Tidak mengubah route halaman (`/keuangan/laporan` tetap).
3. Tidak mengubah label tab periode (`Bulanan | Mingguan` tetap).

---

## 3. Ruang Lingkup Perubahan

### 3.1 Sidebar

- File: `frontend/src/components/app-sidebar.tsx`
- Ubah label submenu:
  - Dari: `Laporan Bulanan`
  - Menjadi: `Laporan Keuangan`
- URL tetap: `/keuangan/laporan`

### 3.2 Header Halaman Laporan

- File: `frontend/src/app/(app)/keuangan/laporan/page.tsx`
- Ubah copy judul/deskripsi halaman agar netral terhadap multi-periode:
  - Judul tidak lagi spesifik "Laporan bulanan"
  - Deskripsi menegaskan halaman memuat ringkasan laporan keuangan dengan mode bulanan dan mingguan

---

## 4. Pendekatan yang Dipilih

Dipilih pendekatan **minimal copy update**:

1. Rename label menu sidebar.
2. Penyesuaian judul/deskripsi halaman laporan.
3. Tidak menyentuh logika bisnis, API, maupun komponen periode.

Alasan:

- Risiko paling rendah.
- Tepat sasaran sesuai permintaan user.
- Tidak menambah scope di luar kebutuhan saat ini.

---

## 5. Dampak Teknis

1. **Frontend-only** (copy update).
2. Tidak ada migration, tidak ada perubahan permission, tidak ada perubahan kontrak endpoint.
3. Regression surface kecil dan terlokalisasi di komponen navigasi + header halaman.

---

## 6. Validasi

Manual check setelah implementasi:

1. Sidebar `Keuangan` menampilkan submenu `Laporan Keuangan`.
2. Navigasi ke `/keuangan/laporan` tetap berjalan normal.
3. Header halaman tidak menyiratkan bulanan saja.
4. Toggle `Bulanan | Mingguan` tetap ada dan berfungsi seperti sebelumnya.
5. Tombol export/report behavior tidak berubah.

---

## 7. Risiko dan Mitigasi

1. **Risiko:** Inkonsistensi copy tersisa di area lain.  
   **Mitigasi:** Fokus cek pada halaman laporan dan navigasi terkait.

2. **Risiko:** Tidak ada (hampir) risiko fungsional karena tidak ubah logic.  
   **Mitigasi:** Smoke test singkat akses menu dan rendering halaman.

---

## 8. Definition of Done

1. Label submenu berubah menjadi `Laporan Keuangan`.
2. Judul/deskripsi halaman laporan sudah netral multi-periode.
3. Tab periode tetap `Bulanan | Mingguan`.
4. Tidak ada perubahan perilaku fitur laporan.
