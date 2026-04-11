# Modul Keuangan — Dokumentasi

Dokumen ini menjelaskan **fungsi**, **alur bisnis**, **izin akses**, dan **titik integrasi API/UI** untuk modul keuangan Masjid Baiturrahim (kas besar, kas kecil, transfer, laporan).

---

## 1. Gambaran umum

Modul keuangan mencatat mutasi kas dalam dua buku: **kas besar** (`kas_besar`) dan **kas kecil** (`kas_kecil`). Setiap baris adalah **transaksi** dengan jenis (`tx_type`), tanggal, nominal, kategori, keterangan, dan status persetujuan.

**Prinsip penting:**

- **Saldo** dan **laporan bulanan** hanya memakai transaksi berstatus **`approved`**. Transaksi **`pending`** atau **`rejected`** tidak mempengaruhi saldo.
- **Pengeluaran** manual dicek agar tidak melebihi saldo **approved** fund yang bersangkutan.
- **Transfer** dari kas besar ke kas kecil memakai sepasang transaksi (`transfer_out` + `transfer_in`) yang dihubungkan dengan **`linked_transfer_id`**; keduanya **`pending`** sampai disetujui.

---

## 2. Jenis transaksi (`tx_type`)

| Nilai API | Arti | Dampak saldo (jika approved) |
|-----------|------|------------------------------|
| `pemasukan` | Pemasukan kas | Menambah saldo |
| `pengeluaran` | Pengeluaran kas | Mengurangi saldo |
| `opening_balance` | Saldo awal | Menambah saldo |
| `adjustment` | Penyesuaian / koreksi | Menambah saldo (nilai bisa positif; konvensi bisnis di level input) |
| `transfer_out` | Transfer keluar (kas besar) | Mengurangi saldo kas besar |
| `transfer_in` | Transfer masuk (kas kecil) | Menambah saldo kas kecil |

Transfer internal dibuat oleh sistem berpasangan; pengguna tidak membuat `transfer_out` / `transfer_in` lewat form transaksi manual.

**Perhitungan saldo** (ringkas, dari `internal/services/finance_service.go`):

- Menambah: `pemasukan`, `transfer_in`, `opening_balance`, `adjustment`
- Mengurangi: `pengeluaran`, `transfer_out`

---

## 3. Alur pengguna (frontend)

### 3.1 Menu dan halaman

| Rute | Fungsi |
|------|--------|
| `/keuangan/kas-besar` | Buku kas besar: saldo, filter tanggal, daftar transaksi, tambah transaksi (sesuai izin) |
| `/keuangan/kas-kecil` | Buku kas kecil: sama seperti di atas |
| `/keuangan/transfer` | Daftar permintaan transfer; formulir ajuan; aksi setujui/tolak (sesuai izin) |
| `/keuangan/laporan` | Ringkasan bulanan + unduh CSV/PDF |

Menu sisi **Keuangan** ditampilkan jika pengguna punya akses laporan keuangan (`finance.view_reports`). Komponen terkait utama:

- `FinanceFundLedgerPanel` — ledger per fund
- `FinanceTransactionDialog` — pemasukan / pengeluaran / saldo awal / penyesuaian
- `FinanceTransferSection` — transfer + tabel
- `FinanceFormDatePicker` — pemilih tanggal (format `YYYY-MM-DD` ke API)
- `FinanceBalanceSummary` — ringkasan di dashboard (kas besar + kecil + tautan)

### 3.2 Alur transaksi manual

1. Pengguna membuka **Kas besar** atau **Kas kecil**.
2. Jika punya `finance.create_transaction`, menu **Tambah transaksi** menawarkan **Pemasukan** dan **Pengeluaran**.
3. Jika punya `finance.adjust_opening_balance`, menu yang sama menawarkan **Saldo awal** dan **Penyesuaian**.
4. Setelah submit, backend membuat transaksi dengan **`approval_status: approved`** (transaksi manual langsung dianggap disetujui).
5. Untuk **pengeluaran**, backend menolak jika saldo approved tidak cukup.

### 3.3 Alur transfer kas

1. Pengguna dengan `finance.request_transfer` mengisi **tanggal**, **nominal**, **keterangan**, lalu mengirim permintaan.
2. Backend dalam satu transaksi DB membuat:
   - satu baris **`transfer_out`** pada **kas besar**
   - satu baris **`transfer_in`** pada **kas kecil**
   - keduanya **`pending`**, berbagi **`linked_transfer_id`** (UUID sama).
3. Daftar transfer di UI memuat baris **`transfer_out`** (endpoint daftar memfilter `tx_type = transfer_out`).
4. Pengguna dengan `finance.approve_transfer` dapat **Setujui** atau **Tolak** (menggunakan **`linked_transfer_id`** di path API).
5. **Setujui**: sistem memastikan saldo **kas besar** (approved) cukup; lalu kedua baris di-update ke **`approved`** (dengan `approved_by`, `approved_at`).
6. **Tolak**: kedua baris **`rejected`** — tidak mengubah saldo efektif.

### 3.4 Alur laporan bulanan

1. Pengguna memilih **kas**, **bulan**, **tahun**.
2. **Saldo awal** periode = saldo dari semua transaksi **approved** dengan `tx_date` **sebelum** tanggal 1 bulan tersebut.
3. **Total pemasukan / pengeluaran** dihitung dari mutasi **approved** di bulan tersebut (logika agregasi mengikuti handler laporan: pemasukan termasuk `pemasukan`, `transfer_in`, `opening`, `adjustment`; pengeluaran termasuk `pengeluaran`, `transfer_out`).
4. **Unduh CSV/PDF** memerlukan izin `finance.export_reports`.

**Field `display_below`:** transaksi bisa ditandai untuk tampil di segmen terpisah di laporan (misalnya lampiran); API laporan mengembalikan `rows` lengkap dan `display_below` khusus baris yang ditandai. Ekspor CSV menyertakan kolom `display_below`; PDF memakai data tersebut untuk bagian tambahan di bawah tabel utama.

---

## 4. Izin RBAC (kunci permission)

Didefinisikan di backend (`internal/models/permission.go`) dan dicek di route admin + resolver untuk transaksi manual.

| Kunci | Nama (katalog) | Kegunaan |
|-------|----------------|----------|
| `finance.view_reports` | Lihat Laporan Keuangan | Ledger, saldo, daftar transfer, preview laporan; menu Keuangan |
| `finance.create_transaction` | Buat Transaksi Keuangan | Pemasukan & pengeluaran |
| `finance.adjust_opening_balance` | Koreksi Saldo Awal | Saldo awal & penyesuaian |
| `finance.request_transfer` | Ajukan Transfer Kas | POST transfer |
| `finance.approve_transfer` | Setujui Transfer Kas | Approve / reject transfer |
| `finance.export_reports` | Ekspor Laporan Keuangan | CSV & PDF bulanan |

**Catatan:** Route `POST /admin/finance/transactions` mengizinkan salah satu dari izin transaksi manual **atau** koreksi saldo (`RequireAnyPermission`). Di dalam handler, **jenis** `tx_type` dicek lagi terhadap map izin pengguna (admin/super admin dianggap punya keduanya lewat `resolveFinancePermissionMap`).

---

## 5. API (admin, prefiks umum)

Base URL frontend memakai axios dengan `/v1`; path efektif seperti di bawah (sesuai `cmd/server/main.go`).

| Metode | Path | Izin (ringkas) | Keterangan |
|--------|------|----------------|------------|
| GET | `/api/v1/admin/finance/transactions` | `finance.view_reports` | Query: `fund_type`, `from`, `to`, `page`, `limit`, dll. Mengembalikan **semua** status approval kecuali difilter lain di masa depan. |
| POST | `/api/v1/admin/finance/transactions` | create **atau** adjust | Body: `fund_type`, `tx_type`, `tx_date` (YYYY-MM-DD), `amount`, `category`, `description`, opsional `reference_no`, `display_below` |
| GET | `/api/v1/admin/finance/balance` | `finance.view_reports` | Query: `fund_type` — saldo **approved** saja |
| POST | `/api/v1/admin/finance/transfers` | `finance.request_transfer` | Body: `tx_date`, `amount`, `description` |
| GET | `/api/v1/admin/finance/transfers` | `finance.view_reports` | Daftar `transfer_out`; query `status`, `from`, `to` |
| PUT | `/api/v1/admin/finance/transfers/:id/approve` | `finance.approve_transfer` | `:id` = **linked_transfer_id** |
| PUT | `/api/v1/admin/finance/transfers/:id/reject` | `finance.approve_transfer` | `:id` = **linked_transfer_id** |
| GET | `/api/v1/admin/finance/reports/monthly` | `finance.view_reports` | Query: `fund_type`, `year`, `month` |
| GET | `/api/v1/admin/finance/reports/monthly/csv` | `finance.export_reports` | Query sama |
| GET | `/api/v1/admin/finance/reports/monthly/pdf` | `finance.export_reports` | Query sama; PDF bisa mengisi nama Ketua/Bendahara dari struktur organisasi aktif |

Format respons sukses mengikuti konvensi proyek: `{ success, data, ... }` atau paginasi `{ success, data, page, limit, total, total_pages }`.

---

## 6. Model data (ringkas)

Entitas utama: `FinanceTransaction` (`internal/models/finance_transaction.go`).

Field yang sering relevan untuk integrasi:

- `fund_type`: `kas_besar` | `kas_kecil`
- `tx_type`, `tx_date`, `amount`, `category`, `description`
- `approval_status`: `pending` | `approved` | `rejected`
- `linked_transfer_id`: UUID penghubung pasangan transfer
- `display_below`: boolean untuk penyajian laporan
- `reference_no`, `created_by`, `approved_by`, `approved_at`

---

## 7. Frontend — layanan & cache

- `frontend/src/services/financeApiService.ts` — pemanggilan HTTP.
- `frontend/src/services/financeHooks.ts` — TanStack Query: transaksi, saldo, transfer, laporan, ekspor; invalidasi query setelah mutasi (misalnya setelah approve transfer atau buat transaksi).

---

## 8. Dokumen desain / rencana terkait

Spesifikasi dan rencana implementasi historis ada di:

- `docs/superpowers/specs/` dan `docs/superpowers/plans/` (keuangan, laporan, RBAC).

Gunakan dokumen ini sebagai **referensi operasional**; detail desain UI lama mungkin sudah bergeser mengikuti implementasi terkini.

---

## 9. Glosar singkat

| Istilah | Makna |
|---------|--------|
| Fund / kas | `kas_besar` atau `kas_kecil` |
| Saldo efektif | Saldo dari transaksi **approved** saja |
| Linked transfer ID | ID yang sama pada sepasang baris transfer; dipakai di URL approve/reject |
| Ledger | Daftar transaksi per kas dengan filter tanggal |

---

*Terakhir diselaraskan dengan kode di repositori (handler, model, service, route admin, komponen frontend). Jika perilaku API berubah, perbarui bagian API dan alur di dokumen ini.*
