# Design Spec: Revamp semua export CSV → Excel (.xlsx)

**Date:** 2026-04-13  
**Branch:** `revamp/csv-report` (working context)  
**Status:** Ready for review  
**Relates to:** `donation_handler.go`, `finance_handler.go`, halaman Laporan/Konten/Inventaris, RBAC `permission.go`.

---

## 1. Masalah

Seluruh fitur unduhan saat ini memakai **CSV** (beberapa dari backend, beberapa dibangun di browser). Stakeholder membutuhkan berkas **Excel** yang:

- Untuk **laporan kas bulanan**, mengikuti format formal **LAPORAN KEUANGAN KAS** (referensi: tata letak header, enam kolom ledger, pemformatan Rupiah, baris sorot, logo).
- Untuk export lainnya, tetap tersedia sebagai **.xlsx** dengan tabel rapi (bukan menyalin layout kas DKI).

CSV sulit memuat **gabungan sel, gambar, lebar kolom, dan format angka** yang konsisten dengan contoh Excel.

## 2. Tujuan

1. **Menghapus** jalur export **CSV** yang terpapar ke pengguna untuk lima area berikut; menggantinya dengan **`.xlsx`**.
2. **Laporan kas bulanan** (`kas_besar` / `kas_kecil`): workbook mengikuti **layout referensi DKI** (§5).
3. **Donasi (baris lengkap)**, **ringkasan donasi di halaman Laporan**, **ringkasan Konten**, **Inventaris**: masing-masing workbook **tabular** profesional (§6).
4. **Satu stack** pembuatan berkas di **backend Go** (§7) agar MIME type, izin, dan pengujian terpusat.
5. Memperbarui **UI** dan **teks izin** agar menyebut Excel / `.xlsx`, bukan CSV.

## 3. Ruang lingkup (inventori saat ini)

| Sumber | Lokasi / perilaku saat ini | Target |
|--------|---------------------------|--------|
| Donasi | `GET /api/v1/admin/donations/export` — CSV di `donation_handler.go` | `.xlsx`, route baru atau pengganti eksplisit (§8) |
| Kas bulanan | `GET /api/v1/admin/finance/reports/monthly/csv` — CSV di `finance_handler.go` | `.xlsx` + layout DKI (§5) |
| Ringkasan donasi (Laporan) | `frontend/src/lib/laporan-csv.ts` — klien | `GET` admin baru → blob `.xlsx` (§6.1) |
| Konten | `frontend/src/lib/konten-csv.ts` — klien | `GET` admin baru → blob `.xlsx` (§6.2) |
| Inventaris | `frontend/src/lib/inventaris-csv.ts` — klien | `GET` admin baru → blob `.xlsx` (§6.3) |

Dokumentasi bantuan (`bantuan/page.tsx`) yang menyebut export CSV diperbarui agar konsisten.

## 4. Bukan tujuan (v1)

- Rentang periode **multi-bulan** di judul kas (contoh referensi: "JUNI 2025 S/D MARET 2026") sementara API tetap **satu bulan kalender**; judul v1 memakai **satu bulan** yang dipilih (mis. `PERIODE APRIL 2026`). Perluasan query bisa ditambahkan kemudian.
- Mengubah isi **PDF** laporan kas yang sudah ada.
- Template Excel terpisah untuk donasi/konten/inventaris kecuali nanti ada permintaan eksplisit.

## 5. Workbook laporan kas bulanan (format DKI)

### 5.1 Sumber data

Sama dengan logika `ExportFinanceMonthlyCSV` hari ini: `fund_type`, `year`, `month`; saldo awal dari transaksi disetujui sebelum awal bulan; baris transaksi disetujui dalam bulan; saldo berjalan; field `display_below` pada model transaksi keuangan.

### 5.2 Judul dan header dokumen

- **Nama kas** di judul: teks bervariasi menurut `fund_type`, mis. `KAS BESAR` / `KAS KECIL` (bukan hardcode hanya "ATM DKI" kecuali produk memutuskan menyamakan label; implementasi mengikuti label yang disepakati di plan).
- **Periode** satu bulan: `PERIODE <BULAN BAHASA INDONESIA> <TAHUN>`.
- **Identitas masjid:** dari baris tunggal `MosqueInfo` (nama, alamat, kota/provinsi gabung sesuai format yang dipilih di implementasi).
- **Logo:** gambar disematkan di workbook. Prioritas: (1) unduh dari `MosqueInfo.LogoURL` jika ada dan valid; (2) fallback ke aset statis di repo (`embed` backend) jika URL kosong atau gagal di-fetch. Ukuran proporsional agar tidak merusak merge area header.
- **Baris rekening bank:** tidak ada field khusus di `MosqueInfo` v1. Isi baris rekening/bank: **konstanta konfigurasi** (mis. variabel lingkungan atau struct config) yang bisa diisi deployer; jika kosong, baris boleh kosong atau dihilangkan tanpa gagal export.

### 5.3 Tabel utama (enam kolom)

| Kolom | Isi |
|-------|-----|
| NO | Urutan baris transaksi mulai 1 |
| TGL | Tanggal transaksi; format tampilan **dd/MM/yyyy** (hindari lebar kolom yang memicu `########`) |
| RINCIAN KEGIATAN | Teks gabungan tetap urutan: **`Description`** sebagai inti; tambahkan **`Category`** dan/atau **`TxType`** (label manusiawi Indonesia) jika membantu audit, dipisah baris atau pemisah konsisten (mis. baris baru atau ` — `). Mendukung **wrap text**. |
| PEMASUKAN | Nominal jika tipe masuk (sama aturan dengan CSV: pemasukan, transfer masuk, pembukaan, penyesuaian positif) |
| PENGELUARAN | Nominal jika tipe keluar |
| SALDO | Saldo berjalan setelah baris tersebut |

### 5.4 Saldo awal

**Satu atau dua baris** di atas baris ber-`NO=1` (di luar atau di dalam tabel sesuai rapi layout): label **Saldo awal** dan nilai di kolom **SALDO** (PEMASUKAN/PENGELUARAN kosong). Spesifikasi sel pasti ditetapkan di plan implementasi agar konsisten dengan border tabel.

### 5.5 Sorot baris (`display_below`)

Jika `display_below == true`, terapkan **isi sel fill** kuning/emas lembut pada baris transaksi tersebut (selaras referensi visual).

### 5.6 Format angka dan lebar kolom

- Format tampilan **Rupiah** dengan pemisah ribuan (setara referensi `Rp 2,400,000`).
- Atur **lebar kolom** minimum agar tanggal dan nominal besar tidak menampilkan `########`.
- Header kolom: **tebal**, rata tengah untuk NO/TGL; rata kiri RINCIAN; rata kanan nominal dan saldo.
- Border: **tebal** di luar area tabel; grid tipis di dalam.

## 6. Workbook tabular (non-DKI)

Satu file `.xlsx` per fitur. Setidaknya satu sheet data dengan: baris judul kolom beku (freeze), **autofilter**, lebar kolom wajar, teks UTF-8. Opsional: baris metadata (tanggal export, filter aktif).

### 6.1 Ringkasan donasi (halaman Laporan)

- **Query** `period` dengan nilai sama seperti UI: `bulan-ini` | `3-bulan` | `tahun-ini` (server menghitung rentang bulan dari **waktu server** saat request, selaras perilaku `useMemo` klien saat ini).
- Isi sheet mencerminkan struktur ringkasan yang sekarang di `laporan-csv.ts`: judul, ringkasan agregat periode, tabel per bulan dalam periode, tabel per kategori (terkonfirmasi).
- **Izin:** `view_donation_reports` (sama dengan akses halaman Laporan untuk donasi).

### 6.2 Ringkasan Konten

- Gabungan tiga blok: Event, Berita/Pengumuman, Khutbah — kolom selaras dengan `konten-csv.ts` saat ini.
- **Izin:** `access_konten`.

### 6.3 Inventaris

- Dua blok (atau dua sheet): **Aset tetap** dan **Barang tidak tetap** dengan kolom selaras `inventaris-csv.ts`.
- **Izin:** `access_inventaris`.

### 6.4 Donasi (detail baris)

- Kolom dan label manusiawi selaras header CSV sekarang (kode, nama donatur, email, telepon, nominal, kategori, metode, status, catatan, URL bukti, tanggal dibuat/dikonfirmasi).
- **Izin:** `export_donations` (tetap).

## 7. Teknologi backend

- Tambah dependensi **excelize** (versi stabil terkini yang kompatibel dengan Go modul proyek) untuk menulis `.xlsx`.
- Hapus penggunaan `encoding/csv` pada handler yang diganti.
- Response sukses: `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `Content-Disposition: attachment; filename="..."` dengan ekstensi `.xlsx`.
- Response gagal: tetap JSON `utils.ErrorResponse` (bukan blob).

## 8. Rute API dan kompatibilitas

- **Disarankan:** rute baru eksplisit, mis.  
  - `GET /api/v1/admin/finance/reports/monthly/xlsx`  
  - `GET /api/v1/admin/donations/export.xlsx` atau `/donations/export?format=xlsx` — pilih satu gaya di plan; hindari mengirim `.xlsx` pada URL yang masih didokumentasikan sebagai CSV.
- **Baru:**  
  - `GET /api/v1/admin/reports/donations/summary/xlsx?period=...`  
  - `GET /api/v1/admin/content/summary/xlsx` (nama final mengikuti konvensi route repo)  
  - `GET /api/v1/admin/inventaris/export/xlsx` (nama final mengikuti konvensi route repo)
- **Deprecation:** Hapus atau nonaktifkan endpoint CSV lama setelah frontend dialihkan; jika perlu satu rilis transisi, dokumentasikan di plan (opsional).

Registrasi rute di `cmd/server/main.go` dengan `RequirePermission` yang sesuai §6.

## 9. Frontend

- Ganti pemanggilan CSV dengan **GET blob** + unduh `.xlsx` untuk kelima alur.
- Perbarui `financeApiService`, `adminApiService`, hook terkait, label tombol, toast, dan `aria-label` yang menyebut CSV.
- Hapus atau kosongkan modul `laporan-csv.ts`, `konten-csv.ts`, `inventaris-csv.ts` setelah tidak terpakai.

## 10. RBAC dan teks izin

- Perbarui **deskripsi** permission di `permission.go` yang masih menyebut "CSV" agar mencakup **Excel (.xlsx)**.
- Tidak menambah permission baru kecuali diperlukan untuk rute baru (ringkasan donasi memakai `view_donation_reports`).

## 11. Verifikasi

- Buka setiap `.xlsx` di Microsoft Excel dan LibreOffice Calc.
- Kas: tidak ada `########`; wrap pada RINCIAN; saldo awal dan saldo akhir konsisten dengan UI bulan yang sama.
- Donasi detail: jumlah baris sama dengan export sebelumnya untuk filter default.
- Izin: pengguna tanpa hak tidak mendapat 200 pada rute baru.

## 12. Referensi visual

Cuplikan layout kas DKI disediakan pengguna (screenshot); aset logo final untuk `embed` disimpan di dalam repo pada path yang ditentukan saat implementasi.

---

**Persetujuan desain percakapan:** opsi **C** (semua export menjadi Excel), layout DKI untuk **kas bulanan** saja; export lain tabular. Pendekatan: **backend-only** dengan **excelize**, judul kas **satu bulan** v1.
