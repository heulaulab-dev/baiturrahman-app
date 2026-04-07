# RBAC Hybrid dengan Role Organisasi + Permission Config

## Latar Belakang

Saat ini akun login memakai role teknis (`super_admin`, `admin`, `editor`) dan belum punya model otorisasi granular per fitur.  
Di sisi lain, user lebih paham role organisasi (misalnya `bendahara`, `sekretaris`, dst) karena role tersebut sudah muncul di pengelolaan struktur.

Target awal:
- Dropdown peran organisasi digunakan untuk konteks user management.
- RBAC mulai diterapkan dari kasus nyata: `bendahara` hanya bisa akses laporan donasi.
- Hak akses harus configurable (default dari code, override dari DB).

## Tujuan

- Menambahkan role organisasi pada akun user agar mudah dipahami.
- Memisahkan identitas organisasi dari permission teknis.
- Menyediakan RBAC yang bisa dikelola bertahap tanpa memutus sistem existing.

## Non-Tujuan (Phase 1)

- Tidak menghapus role teknis lama (`super_admin/admin/editor`) di fase awal.
- Tidak membuat UI manajemen permission lengkap terlebih dulu (boleh via seed + DB).
- Tidak melakukan refactor besar pada semua route sekaligus.

## Opsi Pendekatan

### Opsi 1 - Role Organisasi sebagai Sumber Tunggal RBAC

User hanya pakai role organisasi untuk semua otorisasi.

**Kelebihan**
- Konsep sederhana di sisi produk.
- User non-teknis lebih cepat paham.

**Kekurangan**
- Migrasi berat dari model lama.
- Sulit menjaga kompatibilitas dengan guard existing.

### Opsi 2 - Role Teknis + Permission Granular Saja

Tetap pakai role lama sebagai identitas, lalu tambah permission per fitur.

**Kelebihan**
- Minim perubahan data model user.
- Aman untuk backend existing.

**Kekurangan**
- User tetap sulit memahami role akses.
- Tidak menjawab kebutuhan “bendahara, dll” di UI.

### Opsi 3 (Rekomendasi) - Hybrid

Pertahankan role teknis untuk kompatibilitas, tambah role organisasi untuk representasi bisnis, dan otorisasi fitur pakai permission map berdasarkan role organisasi.

**Kelebihan**
- Sesuai kebutuhan user dan tetap kompatibel.
- Bisa di-rollout bertahap.
- Mudah diperluas ke modul lain.

**Kekurangan**
- Ada kompleksitas ganda (role teknis + role organisasi).
- Butuh sinkronisasi dan validasi mapping.

## Desain Disepakati

Menggunakan **Opsi 3 (Hybrid)**.

### 1) Model Data

#### `users`
- Tambah `org_role` (string/enum): `ketua`, `sekretaris`, `bendahara`, `humas`, `imam_syah`, `muadzin`, `dai_amil`, `marbot`, `lainnya`.
- Tambah `struktur_id` (nullable UUID, relasi ke `struktur`) untuk link optional.

#### `permissions`
- `key` (unique), contoh: `view_donation_reports`, `export_donations`, `confirm_donations`.
- `name`, `description`, `module`, `is_active`.

#### `role_permissions`
- `org_role`
- `permission_key`
- `allowed` (default `true`)
- Unique composite: (`org_role`, `permission_key`).

### 2) Konfigurasi Default + Override DB (Hybrid Config)

- Default matrix permission disediakan di code (seed/initializer) supaya sistem tetap jalan meski tabel kosong.
- Saat startup:
  - Seed daftar permission standar.
  - Seed mapping default role organisasi -> permission.
- Saat runtime:
  - Cek mapping dari DB terlebih dulu.
  - Jika tidak ada data, fallback ke default in-code.

### 3) Otorisasi Backend

- Tambah helper/middleware permission-level:
  - `RequirePermission("view_donation_reports")`
- Alur:
  1. Ambil `userID` dari JWT (`AuthRequired` existing).
  2. Load user (`org_role` + metadata akses).
  3. Cek permission pada resolver (DB/fallback config).
  4. Jika tidak punya hak: return `403`.

### 4) Integrasi ke Route (Phase 1 Scope)

Kasus pertama yang diaktifkan:
- Endpoint laporan donasi dan fitur terkait:
  - view laporan donasi
  - statistik donasi
  - export donasi

Mapping awal minimum:
- `bendahara`:
  - `view_donation_reports`
  - `view_donation_stats`
  - `export_donations`
- Role lain: diset deny-by-default kecuali ditambahkan explicit mapping.

### 5) Integrasi Frontend

- Form user management:
  - Tambah field `org_role`.
  - Tambah opsi link ke data `struktur` (`struktur_id`) + override manual `org_role`.
- Session/auth payload:
  - Sertakan `org_role` dan `permissions` efektif.
- UI guard:
  - Sidebar dan page-level guard pakai `hasPermission(permissionKey)`.
- UX:
  - Jika tidak punya hak akses, tampilkan state `403` yang jelas.

### 6) Sinkronisasi dengan Struktur

- Jika user memilih anggota struktur:
  - `org_role` otomatis terisi dari `struktur.role`.
  - Admin tetap boleh override `org_role` manual.
- Jika struktur berubah setelah link:
  - Phase 1: tidak auto-sync paksa (menghindari side effect).
  - Arah lanjut: opsional flag “sync with struktur role”.

## Error Handling

- `401` untuk token invalid/expired (existing behavior).
- `403` untuk permission ditolak.
- Validasi create/update user:
  - `org_role` harus valid.
  - `struktur_id` (jika diisi) harus ada.

## Keamanan

- Tetap enforce di backend (frontend guard hanya UX).
- Audit-friendly: mudah ditambah logging akses ditolak per permission key.

## Rencana Uji (Phase 1)

- Unit test resolver permission:
  - default config fallback
  - DB override menang terhadap fallback
- API test:
  - `bendahara` bisa akses laporan donasi
  - role tanpa permission dapat `403`
- Frontend smoke:
  - menu laporan donasi muncul/hilang sesuai permission.

## Risiko dan Mitigasi

- Risiko mismatch role string antara frontend/backend.  
  Mitigasi: definisi konstanta role organisasi di shared contract (atau endpoint metadata).

- Risiko route belum semua terproteksi.  
  Mitigasi: rollout bertahap + checklist endpoint per modul.

- Risiko data legacy user belum punya `org_role`.  
  Mitigasi: default `lainnya` + migration script.

## Scope Implementasi Tahap Berikutnya

1. Tambah model dan migration field/tabel RBAC.
2. Seed default permission + role mapping.
3. Tambah middleware `RequirePermission`.
4. Proteksi endpoint donasi (laporan/stats/export) sebagai pilot.
5. Update frontend user management + auth context + sidebar guard.

## Catatan Keputusan

- Keputusan konsep: **Hybrid (role teknis + role organisasi + permission terpisah)**.
- Sumber role organisasi saat input user: **link struktur + bisa override manual**.
- Konfigurasi permission: **hybrid (default in-code + override DB)**.
