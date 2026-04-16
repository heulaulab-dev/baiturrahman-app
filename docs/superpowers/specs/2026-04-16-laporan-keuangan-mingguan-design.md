# Design Spec: Laporan Keuangan Mingguan (Parity dengan Bulanan)

**Date:** 2026-04-16  
**Branch:** `revamp/laporan-keuangan`  
**Status:** Approved (Brainstorming)

---

## 1. Latar Belakang

Saat ini modul laporan keuangan hanya menyediakan periode **bulanan**. Kebutuhan operasional baru adalah menyediakan laporan **mingguan** untuk dibacakan setiap Jumat, tanpa mengubah perilaku laporan bulanan yang sudah berjalan.

Kebutuhan utama user:

- Mingguan memakai definisi minggu **Senin-Minggu**
- Data laporan mingguan adalah **gabungan kas besar + kas kecil**
- Output mingguan harus **sama persis** seperti bulanan (preview, PDF, CSV, struktur data, perilaku perhitungan), hanya berbeda pada periode
- UI tetap satu halaman laporan dengan toggle mode Bulanan/Mingguan
- Default minggu saat membuka halaman: **minggu berjalan**

---

## 2. Tujuan dan Non-Tujuan

### 2.1 Tujuan

1. Menambahkan mode laporan mingguan dengan output parity terhadap bulanan.
2. Menjaga backward compatibility endpoint bulanan yang sudah dipakai frontend saat ini.
3. Meminimalkan duplikasi logika perhitungan laporan dengan satu engine layanan laporan.

### 2.2 Non-Tujuan

1. Tidak mengubah aturan approval transaksi (tetap hanya `approved` yang memengaruhi laporan/saldo).
2. Tidak menambah migrasi schema database.
3. Tidak mengubah permission model yang sudah ada.
4. Tidak membuat halaman laporan terpisah untuk mingguan.

---

## 3. Keputusan Desain

| Area | Keputusan |
|---|---|
| Arsitektur service laporan | Satu engine laporan generik untuk bulanan dan mingguan |
| Kontrak endpoint bulanan | Tetap dipertahankan (backward compatible) |
| Endpoint mingguan | Ditambah endpoint khusus weekly untuk preview/PDF/CSV |
| Definisi minggu | Senin 00:00:00 sampai Minggu 23:59:59 |
| Cakupan kas mingguan | Gabungan `kas_besar` dan `kas_kecil` (fund scope `all`) |
| UX halaman | Toggle `Bulanan | Mingguan` dalam satu halaman laporan |
| Default mode mingguan | Minggu berjalan berdasarkan tanggal hari ini |

---

## 4. Arsitektur Backend

### 4.1 Service Layer

Tambahkan/rapikan service laporan agar memakai parameter periode generik:

- `period_type`: `monthly | weekly`
- `anchor_date`: tanggal acuan (wajib untuk weekly)
- `fund_scope`: `kas_besar | kas_kecil | all`

Semua formatter output (JSON preview, PDF, CSV) menggunakan hasil agregasi dari engine yang sama agar parity bulanan/mingguan terjaga.

### 4.2 Endpoint API

Endpoint existing (tetap):

- `GET /api/v1/admin/finance/reports/monthly`
- `GET /api/v1/admin/finance/reports/monthly/pdf`
- `GET /api/v1/admin/finance/reports/monthly/csv`

Endpoint baru weekly:

- `GET /api/v1/admin/finance/reports/weekly`
- `GET /api/v1/admin/finance/reports/weekly/pdf`
- `GET /api/v1/admin/finance/reports/weekly/csv`

Permission tetap:

- Preview: `finance.view_reports`
- Export PDF/CSV: `finance.export_reports`

### 4.3 Perhitungan Periode Mingguan

Input weekly menggunakan `anchor_date` dari query, lalu service menghitung:

- `week_start`: Senin pada minggu `anchor_date`
- `week_end`: Minggu pada minggu `anchor_date`

Range ini menjadi dasar query transaksi mingguan.

---

## 5. Aturan Perhitungan Laporan Mingguan

Mengikuti aturan bulanan saat ini:

1. Hanya transaksi `approval_status = approved` yang dihitung.
2. `opening_balance` = saldo approved sebelum `week_start`.
3. `total_income` menjumlah tipe pemasukan sesuai konvensi existing (`pemasukan`, `transfer_in`, `opening_balance`, `adjustment`).
4. `total_expense` menjumlah tipe pengeluaran sesuai konvensi existing (`pengeluaran`, `transfer_out`).
5. `closing_balance = opening_balance + total_income - total_expense`.
6. `display_below` tetap didukung pada mode mingguan dengan perilaku sama seperti mode bulanan.

Untuk weekly, fund scope ditetapkan ke gabungan kas (all) sesuai kebutuhan user.

---

## 6. Kontrak Output

### 6.1 JSON Preview

Struktur respons weekly mengikuti struktur bulanan existing agar komponen frontend bisa reuse semaksimal mungkin.

Tambahkan metadata periode weekly:

- `period_type: "weekly"`
- `week_start`
- `week_end`
- `period_label` (mis. "Senin 13/04/2026 - Minggu 19/04/2026")

Field laporan lain (`rows`, `display_below`, summary) mempertahankan pola existing.

### 6.2 PDF

Format PDF weekly sama seperti bulanan:

- Tata letak tabel
- Blok tanda tangan
- Aturan item `display_below`

Perubahan hanya pada label periode yang menampilkan rentang Senin-Minggu.

### 6.3 CSV

Format kolom dan urutan data sama seperti export bulanan agar konsisten dengan alur operasional saat ini.

---

## 7. Desain Frontend

Halaman tetap: `/keuangan/laporan`.

Perubahan UX:

1. Tambah toggle mode: `Bulanan | Mingguan`.
2. Jika `Bulanan`: kontrol existing bulan+tahun dipakai.
3. Jika `Mingguan`: tampil date picker `anchor_date` lalu sistem menurunkan rentang Senin-Minggu.
4. Default saat user pindah ke `Mingguan` atau membuka halaman dengan mode mingguan adalah minggu berjalan.

### 7.1 Data Fetching dan Cache

- Query key dipisahkan untuk mode bulanan vs mingguan.
- Mode mingguan memanggil endpoint weekly.
- Tombol export (PDF/CSV) otomatis memilih endpoint sesuai mode aktif.

---

## 8. Error Handling dan Edge Cases

1. `anchor_date` tidak valid -> `400 Bad Request` dengan pesan validasi.
2. Periode mingguan valid tanpa transaksi -> respons sukses dengan nilai agregat nol/terkait opening.
3. Data penandatangan kosong -> fallback mengikuti perilaku existing PDF bulanan (tidak memblokir export).
4. Transaksi lintas batas minggu dipastikan hanya masuk range `week_start..week_end`.

---

## 9. Dampak ke Komponen/Files

Perkiraan area perubahan:

### Backend

- `backend/internal/handlers/finance_handler.go`
- `backend/internal/services/finance_service.go`
- modul PDF/CSV report existing pada domain finance
- `backend/cmd/server/main.go` (registrasi route weekly bila perlu)

### Frontend

- `frontend/src/app/(dashboard)/keuangan/laporan/page.tsx` (atau path aktual halaman laporan)
- `frontend/src/services/financeApiService.ts`
- `frontend/src/services/financeHooks.ts`
- komponen filter/periode laporan keuangan jika dipisahkan

Catatan: path final mengikuti struktur aktual file saat implementasi.

---

## 10. Strategi Pengujian

### 10.1 Backend

1. Unit test hitung `week_start/week_end` untuk beberapa tanggal (termasuk boundary Senin/Minggu).
2. Unit/integration test agregasi weekly:
   - opening/income/expense/closing benar
   - hanya `approved` yang dihitung
3. Handler test:
   - validasi query weekly
   - permission check preview/export

### 10.2 Frontend

1. Toggle mode menampilkan kontrol periode yang tepat.
2. Default weekly = minggu berjalan.
3. Export PDF/CSV memanggil endpoint weekly saat mode mingguan.

### 10.3 Manual Smoke Test

1. Seed data transaksi pada dua minggu berurutan.
2. Pastikan laporan weekly hanya mengambil rentang minggu terpilih.
3. Cocokkan nilai preview, PDF, dan CSV untuk minggu yang sama.

---

## 11. Risiko dan Mitigasi

1. **Risiko drift bulanan vs mingguan** jika logic terpisah  
   **Mitigasi:** satu engine service laporan generik.

2. **Risiko ambiguity timezone saat hitung batas minggu**  
   **Mitigasi:** samakan timezone dengan standar aplikasi/backend dan gunakan util tanggal terpusat.

3. **Risiko perubahan UI mengganggu flow bulanan existing**  
   **Mitigasi:** mode bulanan dipertahankan sebagai default existing behavior dan diverifikasi regression.

---

## 12. Kriteria Selesai (Definition of Done)

1. User dapat memilih mode `Mingguan` di halaman laporan.
2. Mingguan menghitung periode Senin-Minggu berdasarkan `anchor_date`.
3. Data mingguan menggabungkan kas besar + kas kecil.
4. Preview/PDF/CSV mingguan tersedia dengan format setara bulanan.
5. Endpoint bulanan tetap berjalan tanpa perubahan kontrak.
6. Pengujian utama backend/frontend untuk weekly lulus.
