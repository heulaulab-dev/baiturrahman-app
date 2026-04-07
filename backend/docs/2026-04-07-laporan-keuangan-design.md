# Design Spec: Modul Laporan Keuangan (Kas Besar & Kas Kecil)

**Date:** 2026-04-07
**Branch:** `feature/laporan-keuangan`
**Status:** Draft — awaiting user review

---

## 1. Latar Belakang

Masjid Baiturrahman mengelola keuangan dalam dua kas terpisah:

- **Kas Besar** — dana di tabungan Bank DKI (ATM). Dipegang oleh Papah (bendahara utama). Format pelaporan mengikuti format Excel yang sudah ada.
- **Kas Kecil** — dana cashflow harian dari kotak amal Jumat dan kotak amal luar masjid. Dipegang oleh Pak Toro. Diumumkan setiap Jumat.

Jika dana kas kecil tidak cukup untuk operasional, dilakukan pengambilan dana dari kas besar. Laporan keuangan dicetak rangkap 2: satu untuk arsip bendahara, satu untuk ditempel di mading masjid. Periode laporan utama adalah **bulanan**.

---

## 2. Keputusan Desain

| Keputusan | Pilihan |
|---|---|
| Arsitektur data | Ledger terpusat: 1 tabel transaksi dengan `fund_type` (kas_besar / kas_kecil) |
| Approval transfer | Fleksibel via RBAC — role yang boleh approve diatur dari halaman RBAC |
| Output laporan | PDF rangkap 2 (arsip bendahara + mading) + Excel/CSV |
| Periode laporan | Bulanan |
| Saldo awal | Otomatis carry forward saldo akhir bulan sebelumnya, bisa koreksi manual |
| Format PDF | Mengikuti format kertas yang sudah dipakai (lihat referensi foto) |
| Item khusus (mis. Anak yatim & duafa) | Pemasukan biasa, tapi ditampilkan terpisah di bawah saldo akhir di laporan (`display_below = true`) |
| Hubungan dengan modul donasi | Terpisah — modul donasi (yang sudah ada) tidak berubah |

---

## 3. Arsitektur Data

### 3.1 Model: `FinanceTransaction`

```
FinanceTransaction
├── id                  uuid, PK
├── fund_type           enum: kas_besar, kas_kecil
├── tx_type             enum: pemasukan, pengeluaran, transfer_out, transfer_in, opening_balance, adjustment
├── tx_date             date
├── amount              float64, selalu positif
├── category            string (mis. "kotak_jumat", "bisaroh_khotib", "listrik", "anak_yatim_duafa")
├── description         text
├── reference_no        string, opsional
├── display_below       bool, default false
│                       Jika true, item muncul terpisah di bawah saldo akhir di laporan PDF
├── approval_status     enum: approved, pending, rejected (default: approved untuk non-transfer)
├── linked_transfer_id  uuid, nullable — menghubungkan pasangan transfer_out ↔ transfer_in
├── created_by          uuid, FK → users
├── approved_by         uuid, nullable, FK → users
├── approved_at         timestamp, nullable
├── created_at          timestamp (gorm.Model)
├── updated_at          timestamp (gorm.Model)
├── deleted_at          timestamp, nullable (gorm.Model, soft delete)
```

### 3.2 Aturan Bisnis Data

- **Saldo** dihitung secara derived (bukan stored): `SUM(pemasukan + transfer_in + opening_balance positif) - SUM(pengeluaran + transfer_out)`, difilter per `fund_type` dan hanya transaksi `approval_status = approved`.
- **Saldo awal bulan** = saldo akhir bulan sebelumnya. Jika user perlu koreksi, buat transaksi `opening_balance` atau `adjustment`.
- **Transfer** selalu satu arah (versi awal): `kas_besar → kas_kecil`. Satu event transfer menghasilkan 2 record terhubung via `linked_transfer_id`.
- **Pengeluaran/transfer_out** tidak boleh membuat saldo kas negatif (validasi di backend).
- **Transaksi approved** tidak bisa di-edit. Koreksi dilakukan via transaksi `adjustment` baru.

---

## 4. RBAC — Permission Baru

Permission baru yang ditambahkan ke tabel permission seeding (tidak mengubah struktur RBAC yang ada):

| Permission Key | Nama | Deskripsi | Modul |
|---|---|---|---|
| `finance.view_reports` | Lihat Laporan Keuangan | Melihat transaksi dan laporan keuangan | finance |
| `finance.create_transaction` | Buat Transaksi | Input pemasukan/pengeluaran kas | finance |
| `finance.request_transfer` | Ajukan Transfer Kas | Membuat permintaan transfer kas besar → kas kecil | finance |
| `finance.approve_transfer` | Setujui Transfer Kas | Approve/reject permintaan transfer | finance |
| `finance.export_reports` | Export Laporan | Download PDF/CSV laporan keuangan | finance |
| `finance.adjust_opening_balance` | Koreksi Saldo | Buat penyesuaian saldo awal/koreksi | finance |

---

## 5. API Endpoints

Base path: `/api/v1/admin/finance/`

### 5.1 Transaksi

| Method | Path | Deskripsi | Permission |
|---|---|---|---|
| GET | `/transactions` | List transaksi (filter: fund_type, tx_type, date range, category) | `finance.view_reports` |
| POST | `/transactions` | Buat transaksi pemasukan/pengeluaran | `finance.create_transaction` |
| PUT | `/transactions/:id` | Edit transaksi (sebelum approved saja) | `finance.create_transaction` |
| DELETE | `/transactions/:id` | Soft delete transaksi | `finance.create_transaction` |

### 5.2 Saldo

| Method | Path | Deskripsi | Permission |
|---|---|---|---|
| GET | `/balance` | Saldo real-time per kas (`?fund_type=kas_besar`) | `finance.view_reports` |
| GET | `/balance/monthly` | Saldo awal + akhir per bulan (`?year=2026&month=4`) | `finance.view_reports` |

### 5.3 Transfer

| Method | Path | Deskripsi | Permission |
|---|---|---|---|
| POST | `/transfers` | Buat permintaan transfer kas besar → kas kecil | `finance.request_transfer` |
| GET | `/transfers` | List semua transfer (filter: status, date range) | `finance.view_reports` |
| PUT | `/transfers/:id/approve` | Approve transfer (atomic: buat transfer_out + transfer_in) | `finance.approve_transfer` |
| PUT | `/transfers/:id/reject` | Reject transfer | `finance.approve_transfer` |

### 5.4 Penyesuaian

| Method | Path | Deskripsi | Permission |
|---|---|---|---|
| POST | `/adjustments` | Buat opening_balance atau adjustment | `finance.adjust_opening_balance` |

### 5.5 Laporan

| Method | Path | Deskripsi | Permission |
|---|---|---|---|
| GET | `/reports/monthly` | Data laporan bulanan (JSON) `?year=2026&month=4&fund_type=kas_kecil` | `finance.view_reports` |
| GET | `/reports/monthly/pdf` | Download PDF rangkap 2 `?year=2026&month=4&fund_type=kas_kecil` | `finance.export_reports` |
| GET | `/reports/monthly/csv` | Download CSV/Excel `?year=2026&month=4&fund_type=kas_kecil` | `finance.export_reports` |

---

## 6. Frontend — Halaman & Navigasi

### 6.1 Sidebar

Menu group baru **"Keuangan"** (visibility: `finance.view_reports`):
- Kas Besar
- Kas Kecil
- Transfer Kas
- Laporan Bulanan

### 6.2 Halaman Kas Besar / Kas Kecil

Dua halaman terpisah (`/keuangan/kas-besar`, `/keuangan/kas-kecil`) dengan UI identik:

- **Header:** Nama kas, saldo saat ini (badge), tombol "Tambah Transaksi"
- **Tabel utama:**
  - Kolom: Tanggal | No. Ref | Uraian Kegiatan | Kategori | Pemasukan | Pengeluaran | Saldo Berjalan
  - Filter: rentang tanggal, kategori, tipe transaksi
  - Pagination
- **Form input transaksi (dialog/modal):**
  - Field: tanggal, tipe (pemasukan/pengeluaran), kategori (dropdown), nominal, uraian kegiatan, no. referensi (opsional), display_below (checkbox: "Tampilkan terpisah di laporan")
  - Validasi: pengeluaran ≤ saldo kas

### 6.3 Halaman Transfer Kas

Path: `/keuangan/transfer`

- **Tab "Buat Permintaan":** form transfer (dari: kas besar, ke: kas kecil, nominal, alasan)
- **Tab "Daftar Transfer":**
  - Tabel: Tanggal | Dari | Ke | Nominal | Status | Dibuat oleh | Disetujui oleh
  - Tombol approve/reject: hanya muncul untuk user dengan `finance.approve_transfer`
  - Badge status: kuning (pending), hijau (approved), merah (rejected)

### 6.4 Halaman Laporan Bulanan

Path: `/keuangan/laporan`

- Dropdown pilih bulan + tahun
- Dropdown pilih jenis kas (Kas Besar / Kas Kecil / Keduanya)
- Preview laporan on-screen (tabel format seperti PDF)
- Tombol:
  - "Download PDF (Rangkap 2)"
  - "Download Excel/CSV"

---

## 7. Format PDF Laporan

PDF di-generate oleh backend (Go) menggunakan library `jung-kurt/gofpdf` atau `signintech/gopdf`. Format mengikuti format kertas yang sudah dipakai:

### 7.1 Layout per halaman

```
┌──────────────────────────────────────────────────────────────────┐
│  LAPORAN KEUANGAN MASJID BAITURRAHMAN                           │
│  PERIODE : [BULAN] [TAHUN]                                      │
│  Salinan: [1/2] dari 2 — [Arsip Bendahara / Tempel Mading]     │
├────┬────────────┬─────────────────────┬──────────┬──────────┬──────────┤
│ No │ Tanggal    │ Uraian Kegiatan     │Pemasukan │Pengeluaran│ Jumlah  │
├────┼────────────┼─────────────────────┼──────────┼──────────┼──────────┤
│    │ [tgl]      │ Saldo Bulan [prev]  │          │          │[saldo]   │
│  1 │ [tgl]      │ [deskripsi]         │ [amount] │          │          │
│  2 │ [tgl]      │ [deskripsi]         │          │ [amount] │          │
│ .. │ ...        │ ...                 │   ...    │   ...    │          │
├────┴────────────┼─────────────────────┼──────────┼──────────┼──────────┤
│                 │ Saldo Akhir [tgl]   │          │          │[saldo]   │
│                 │ [item display_below]│          │          │[amount]  │
│                 │ TOTAL KAS           │          │          │[total]   │
├─────────────────┴─────────────────────┴──────────┴──────────┴──────────┤
│                                                                        │
│  Jakarta, [tanggal cetak]                                              │
│                                                                        │
│  Ketua DKM Baiturrahim              Bendahara                          │
│                                                                        │
│  ________________________           ________________________            │
│  [nama dari tabel strukturs]        [nama dari tabel strukturs]         │
└────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Aturan PDF

- Satu file PDF berisi 2 halaman identik (salinan 1: Arsip Bendahara, salinan 2: Tempel Mading)
- Jika user pilih "Keduanya" (kas besar + kas kecil), PDF berisi 4 halaman (2 × 2)
- Kolom "Jumlah" menampilkan saldo berjalan (running balance)
- Item dengan `display_below = true` ditampilkan di bawah saldo akhir, sebelum TOTAL KAS
- TOTAL KAS = saldo akhir + semua item display_below
- Nama penandatangan diambil dari tabel `strukturs` (role: ketua & bendahara). Jika kosong, tetap print garis kosong

---

## 8. Error Handling & Edge Cases

| Situasi | Penanganan |
|---|---|
| Pengeluaran > saldo kas | Tolak, error: "Saldo kas tidak cukup (saldo: Rp X, pengeluaran: Rp Y)" |
| Transfer > saldo kas besar | Tolak saat approval (bukan saat request) — saldo bisa berubah antara request dan approval |
| Bulan tanpa transaksi | Laporan tetap bisa di-generate: saldo awal = saldo akhir, tabel kosong |
| Belum ada data sama sekali | Wajib input `opening_balance` sebelum membuat transaksi lain |
| Edit transaksi approved | Tidak diizinkan — buat `adjustment` baru |
| Hapus transaksi | Soft delete. Transaksi yang sudah masuk laporan bulan sebelumnya tidak bisa dihapus |
| Transfer di-reject setelah pending lama | Tidak ada efek saldo, hanya status berubah |
| Concurrent transfer approval | Database transaction lock (SELECT FOR UPDATE) |
| Nama penandatangan kosong | Print garis kosong di PDF |

---

## 9. Integrasi dengan Sistem yang Ada

- **RBAC:** Insert 6 permission baru ke seeding. Tidak ubah struktur RBAC.
- **Sidebar:** Tambah menu group "Keuangan" dengan 4 sub-menu. Visibility via `finance.view_reports`.
- **Modul Donasi:** Tetap terpisah, tidak diubah. Halaman laporan donasi yang sudah ada tidak diganggu.
- **Strukturs:** Nama penandatangan PDF diambil dari tabel strukturs (filter role ketua & bendahara).
- **PDF library:** Tambah dependency Go: `jung-kurt/gofpdf` atau `signintech/gopdf` (server-side generation).

---

## 10. Testing Strategy

### Backend (Go)

- **Service layer:** hitung saldo benar, validasi saldo negatif, atomic transfer (2 record terhubung), opening balance enforcement
- **Handler layer:** validasi input, response format, permission check (mock RBAC)
- **PDF generation:** output valid PDF, teks header/footer/konten sesuai template

### Frontend

- Form validation: nominal > 0, tanggal wajib, required fields
- Conditional UI: tombol approve hanya muncul untuk user berizin
- Export trigger: download PDF/CSV berfungsi

### Integration (manual)

- Flow lengkap: input saldo awal → catat pemasukan harian → catat pengeluaran → request transfer → approve → generate laporan bulanan → download PDF rangkap 2 → verifikasi format sesuai foto referensi

---

## 11. File Baru yang Diperkirakan

### Backend
- `internal/models/finance_transaction.go`
- `internal/handlers/finance_handler.go`
- `internal/services/finance_service.go`
- `internal/services/finance_pdf.go`

### Frontend
- `src/app/(app)/keuangan/kas-besar/page.tsx`
- `src/app/(app)/keuangan/kas-kecil/page.tsx`
- `src/app/(app)/keuangan/transfer/page.tsx`
- `src/app/(app)/keuangan/laporan/page.tsx`
- `src/services/financeApiService.ts`
- `src/services/financeHooks.ts`
- `src/types/finance.ts` (atau tambah ke `src/types/index.ts`)

### Modifikasi file yang ada
- `internal/models/permission.go` — tambah seed permission finance.*
- `cmd/server/main.go` — register route group finance
- `src/components/app-sidebar.tsx` — tambah menu Keuangan

---

## Referensi

- Foto format laporan kertas kas kecil: `assets/image-b8d2ff46-ba44-4323-82f9-b30abad2140b.png`
