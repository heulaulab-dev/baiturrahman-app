# Design Spec: Aksi UI Modul Keuangan (Input Transaksi & Transfer)

**Date:** 2026-04-11  
**Branch:** `feature/laporan-keuangan` (asumsi)  
**Status:** Approved  
**Relates to:** `docs/superpowers/specs/2026-04-07-laporan-keuangan-design.md`

---

## 1. Masalah

Backend dan klien API untuk keuangan sudah tersedia (`POST /v1/admin/finance/transactions`, `POST /v1/admin/finance/transfers`, approve/reject, hooks TanStack Query). Halaman `kas-besar`, `kas-kecil`, dan `transfer` hanya menampilkan ringkasan (saldo / jumlah rekaman) tanpa **tombol atau form** untuk menambah pemasukan, pengeluaran, penyesuaian saldo, mengajukan transfer, atau menyetujui/menolak transfer.

## 2. Tujuan

Memberi pengguna berhak akses yang sesuai kemampuan untuk:

1. **A** — Mencatat **pemasukan** dan **pengeluaran** per kas (Kas Besar / Kas Kecil).
2. **B** — **Mengajukan transfer** kas besar → kas kecil dan **menyetujui / menolak** permintaan yang masih `pending`.
3. **C** — Mencatat **saldo awal** (`opening_balance`) dan **penyesuaian** (`adjustment`) dengan kontrol izin terpisah dari transaksi rutin.

UX: form utama dalam **dialog** (shadcn `Dialog`) dari tombol di area header tabel, bukan halaman terpisah, agar entri cepat dan konsisten dengan pola dashboard.

## 3. Arsitektur Frontend

### 3.1 Komponen bersama (disarankan)

Satu komponen ledger parametrik **`fund_type: 'kas_besar' | 'kas_kecil'`** (nama bebas, mis. `FinanceFundLedgerPanel`) berisi:

- Header: judul kas, saldo saat ini (`useFinanceBalance`).
- Toolbar: filter rentang tanggal (`from` / `to` query ke API), paginasi.
- Tabel: hasil `useFinanceTransactions` dengan kolom tanggal, jenis, kategori, deskripsi, nominal, status approval (jika relevan).
- Tombol aksi (tergantung `hasPermission`):
  - `finance.create_transaction` → **Pemasukan**, **Pengeluaran**.
  - `finance.adjust_opening_balance` → **Saldo awal / penyesuaian** (satu dialog dengan pemilih jenis `opening_balance` | `adjustment`).

Halaman `kas-besar/page.tsx` dan `kas-kecil/page.tsx` hanya merender panel dengan `fund_type` yang sesuai.

### 3.2 Halaman Transfer

- Form ajuan: tanggal, jumlah (> 0), keterangan wajib; `useCreateFinanceTransfer`; izin `finance.request_transfer`.
- Tabel: `useFinanceTransfers` (endpoint mengembalikan baris `transfer_out` per permintaan; identifier approve/reject = **`linked_transfer_id`** dari respons API, konsisten dengan `PUT .../transfers/:id/approve|reject` di mana `:id` adalah UUID tautan).
- Filter status (`pending` / `approved` / `rejected`) dan rentang tanggal jika API mendukung (sudah ada query `status`, `from`, `to`).
- Tombol **Setujui** / **Tolak** pada baris `pending` untuk pengguna dengan `finance.approve_transfer`.
- Setelah mutasi sukses: invalidate query `admin/finance/transactions`, `admin/finance/balance` (kedua kas), `admin/finance/transfers` (perlu ditambahkan di hook jika belum).

### 3.3 Field form transaksi (dialog)

Selaras dengan `createFinanceTransactionRequest` backend:

| Field | Aturan |
|-------|--------|
| `fund_type` | Diisi otomatis dari halaman (tidak diedit user). |
| `tx_type` | Dari konteks tombol / pilihan dialog. |
| `tx_date` | Format `YYYY-MM-DD` (date picker → string). |
| `amount` | > 0 (backend menolak nol/negatif). |
| `category` | Wajib; mulai dengan input teks atau select sederhana — nilai string bebas sesuai model. |
| `description` | Wajib. |
| `reference_no` | Opsional. |
| `display_below` | Opsional, checkbox; untuk pemasukan yang harus tampil terpisah di laporan (mis. anak yatim/duafa). |

**Saldo awal vs penyesuaian:** label UI jelas; keduanya memakai alur yang sama dengan pemisahan `tx_type`. Deskripsi wajib untuk jejak audit.

### 3.4 Error & loading

- Tampilkan pesan error dari body respons API (axios).
- Loading state pada submit dialog dan pada tombol approve/reject.
- Kasus khusus: approve transfer gagal karena saldo kas besar tidak cukup → tampilkan pesan user-friendly (backend: `Insufficient kas besar balance`).

## 4. Backend — penyelarasan RBAC dan validasi

### 4.1 Masalah saat ini

- `POST /finance/transactions` memakai middleware tunggal `finance.create_transaction`, sehingga pengguna yang **hanya** punya `finance.adjust_opening_balance` tidak bisa mencapai handler untuk saldo awal/penyesuaian.
- Handler tidak membatasi `tx_type` yang boleh dibuat lewat API manual; secara teoritis klien bisa mengirim `transfer_out` / `transfer_in`, yang merusak integritas alur transfer.

### 4.2 Keputusan spesifikasi

1. **Middleware route:** Izinkan akses ke `POST /finance/transactions` jika pengguna memiliki **salah satu** dari `finance.create_transaction` atau `finance.adjust_opening_balance` (implementasi: middleware `RequireAnyPermission` atau ekuivalen; bypass tetap mengikuti aturan admin/super_admin yang ada).
2. **Di handler `CreateFinanceTransaction`**, setelah bind JSON:
   - **Whitelist `tx_type`:** hanya `pemasukan`, `pengeluaran`, `opening_balance`, `adjustment`. Tolak lainnya dengan 400.
   - **Pemetaan izin:**  
     - `pemasukan` / `pengeluaran` → wajib `finance.create_transaction`.  
     - `opening_balance` / `adjustment` → wajib `finance.adjust_opening_balance`.  
     Resolusi izin mengikuti pola yang sama dengan `RequirePermission` (peta peran organisasi dari DB), termasuk perilaku bypass untuk role teknis jika masih berlaku.
3. **Tidak** menambahkan route `POST /adjustments` terpisah kecuali ada kebutuhan dokumentasi eksternal; satu endpoint tetap cukup setelah aturan di atas.

### 4.3 Validasi saldo pengeluaran

Jika service/handler belum menolak pengeluaran yang membuat saldo negatif untuk transaksi langsung (bukan hanya saat approve transfer), implementasi harus mengikuti spesifikasi asli modul keuangan; jika belum ada, rekam sebagai tugas dalam rencana implementasi (cek `finance_service` / handler sebelum create).

## 5. Di luar cakupan

- Mengubah format PDF/CSV laporan.
- Mengedit atau menghapus transaksi yang sudah disetujui (tetap sesuai spec asli: koreksi lewat penyesuaian baru).
- Sinkronisasi otomatis dengan modul donasi.

## 6. Berkas yang diperkirakan disentuh

**Frontend**

- `frontend/src/app/(app)/keuangan/kas-besar/page.tsx`
- `frontend/src/app/(app)/keuangan/kas-kecil/page.tsx`
- `frontend/src/app/(app)/keuangan/transfer/page.tsx`
- Komponen baru di bawah `frontend/src/components/` (mis. `dashboard/finance/`): panel ledger, dialog transaksi, dialog/baris transfer.
- `frontend/src/services/financeHooks.ts` — invalidasi query transfer setelah approve/reject/create jika belum lengkap.

**Backend**

- `backend/cmd/server/main.go` — middleware untuk `POST /finance/transactions`.
- `backend/internal/middleware/auth.go` — helper `RequireAnyPermission` (atau pola setara).
- `backend/internal/handlers/finance_handler.go` — whitelist `tx_type` + pengecekan izin per jenis transaksi (reuse logika resolusi permission seperti middleware).

## 7. Uji verifikasi manual (setelah implementasi)

- Pengguna hanya `create_transaction`: bisa pemasukan/pengeluaran; tidak bisa submit opening/adjustment (403).
- Pengguna hanya `adjust_opening_balance`: bisa opening/adjustment; tidak bisa pemasukan/pengeluaran (403).
- Pengguna dengan keduanya: semua jenis diizinkan sesuai tombol.
- Transfer: ajuan muncul sebagai pending; approve memperbarui saldo; reject tidak mengubah saldo; saldo tidak cukup → pesan jelas.
- Dialog menutup dan daftar serta saldo ter-refresh setelah sukses.

---

## 8. Langkah berikutnya

Setelah spesifikasi ini direview dan disetujui di repo, buat **rencana implementasi** terpisah (skill writing-plans) dengan urutan: middleware + handler backend, lalu komponen ledger bersama, lalu halaman transfer, lalu invalidasi query dan polish UX.
