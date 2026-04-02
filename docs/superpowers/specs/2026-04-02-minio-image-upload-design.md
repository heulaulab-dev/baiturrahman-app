## Desain: Integrasi MinIO untuk Upload Gambar (Bucket `uploads`)

### Ringkasan
Saat ini backend menyimpan file upload gambar ke filesystem lokal (`./uploads`) dan mengembalikan URL relatif `"/uploads/<filename>"`. Kita ingin mengganti storage tersebut menjadi MinIO supaya gambar tersimpan sebagai object storage (bucket `uploads`), tetapi API frontend tetap memakai endpoint:
- `POST /api/v1/admin/upload`
- `DELETE /api/v1/admin/upload`

UI menyimpan nilai `image_url` di DB. Nilai ini kemudian dipakai frontend untuk memrender gambar (dengan `next/image` melalui helper `resolveBackendAssetUrl`).

### Keputusan yang Disepakati
1. Bucket MinIO bernama `uploads`.
2. Object key di MinIO mengikuti format: `<uuid><ext>` (tanpa folder), sehingga parsing `DELETE` tetap mudah.
3. `image_url` yang disimpan di DB adalah URL absolut yang bisa dijangkau oleh server Next.js untuk keperluan `next/image`.
   - Saat running dengan Docker Compose: `http://minio:9000/uploads/<uuid><ext>`
   - Saat running tanpa Docker (opsional untuk dev lokal): dapat di-set ke `http://localhost:9000/uploads/<uuid><ext>`

### Perubahan Bagian 1 (Dev Ops): MinIO untuk Dev (Compose Root + Backend)
Di repo ini, dev “full stack” biasanya jalan lewat `docker-compose.yml` di root (frontend + backend dalam container). Karena itu service `minio` **harus** ada di root `docker-compose.yml` juga agar hostname `minio` bisa di-resolve dari container frontend/Next.js.

Tambahkan service `minio` (di root `docker-compose.yml`; `backend/docker-compose.yml` bisa ikut dipakai bila kamu menjalankan compose dari folder `backend`):
- Image: `minio/minio`
- Command: `server /data --console-address ":9001"`
- Volume: `minio_data:/data`
- Env:
  - `MINIO_ROOT_USER` (default dev: `minioadmin`)
  - `MINIO_ROOT_PASSWORD` (default dev: `minioadmin123`)
- Port mapping dev (opsional, untuk debug dari host):
  - `127.0.0.1:9000:9000` (S3 endpoint)
  - `127.0.0.1:9001:9001` (console; opsional)
- Koneksi ke network yang sama dengan service `backend`.

Bucket `uploads` akan dipastikan ada + dibuat readable dari publik melalui pengaturan bucket policy saat backend startup (lihat Bagian Backend).

Selain menambahkan service `minio`, pastikan service `backend` (di root `docker-compose.yml`) juga diberi env untuk MinIO, misalnya:
- `MINIO_ENDPOINT=http://minio:9000`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_BUCKET=uploads`
- `MINIO_OBJECT_URL=http://minio:9000`

### Perubahan Bagian 2 (Backend): Upload/Delete pakai MinIO

#### Env & Config
Tambah config/env backend:
- `MINIO_ENDPOINT`  
  - internal untuk container backend ke service MinIO, mis. `http://minio:9000`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_BUCKET` (ditetapkan `uploads`)
- `MINIO_OBJECT_URL`  
  - untuk membangun URL absolut yang disimpan di DB (yang dipakai `next/image`)
  - contoh Docker Compose: `http://minio:9000`

Catatan wiring kode:
- Tambahkan field MinIO di `backend/config/config.go` (struct `Config` + `Load()`).
- Tambahkan inisialisasi MinIO (client + ensure bucket/policy) di `backend/cmd/server/main.go` sebelum request handling.
- Tambahkan dependency MinIO SDK untuk Go (mis. `github.com/minio/minio-go/v7`) di `backend/go.mod`.

#### Startup Initialization
Pada start server, setelah DB migrate/seed:
1. Initialize MinIO client menggunakan env di atas.
2. Pastikan bucket `uploads` ada (create if not exists).
3. Terapkan bucket policy agar object dalam bucket readable publik (minimal untuk `s3:GetObject` pada prefix `*`).
   - target: `bucket=uploads`, `object key = uploads/*` (secara praktik cukup `uploads` + key object)

Catatan implementasi kebijakan:
- Bucket pada MinIO default biasanya privat. Kita perlu mengatur policy (bisa lewat MinIO SDK atau mekanisme lain yang tetap berada dalam backend).

#### Upload: `POST /api/v1/admin/upload`
Flow baru:
1. Terima multipart form `file` (tetap, nama field `file`).
Catatan implementasi: ganti logic `UploadImage` di `backend/internal/handlers/upload_handler.go` dari filesystem lokal (`./uploads`) menjadi upload object ke bucket MinIO, serta pastikan response `{ "url": ... }` berisi URL absolut (`MINIO_OBJECT_URL + "/uploads/" + objectKey`).
2. Validasi:
   - ukuran <= 5MB
   - ekstensi termasuk `jpg|jpeg|png|gif|webp`
3. Generate object key:
   - `<uuid><ext>`
4. (Tetap) optimize gambar seperti flow sekarang:
   - optimize melalui pipeline file temp ke disk
5. Upload ke MinIO bucket `uploads`:
   - method: `PutObject`
   - object key: `<uuid><ext>`
6. Bangun URL absolut untuk DB:
   - `image_url = MINIO_OBJECT_URL + "/uploads/" + objectKey`
7. Return response sesuai kontrak saat ini:
   - `{ "url": "<image_url>" }`

Kontrak ini tetap kompatibel dengan frontend `uploadAdminImage()`, karena frontend hanya berharap `data.data.url` berupa string.

#### Delete: `DELETE /api/v1/admin/upload`
Flow baru (tetap kontrak body):
1. Frontend mengirim JSON: `{ "url": "<image_url>" }`.
2. Catatan: saat ini UI frontend belum memanggil endpoint DELETE (yang sudah ada hanya upload/POST via `uploadAdminImage`). Endpoint DELETE tetap didesain untuk kesiapan admin actions / fitur lanjutan; verifikasi bisa dilakukan lewat manual API call sampai tombol/hook delete diimplementasikan.
Catatan implementasi: ganti logic `DeleteImage` di `backend/internal/handlers/upload_handler.go` dari `os.Remove("uploads/<filename>")` menjadi `RemoveObject` ke bucket MinIO (`uploads`, key=`objectKey`).
3. Backend mengambil `objectKey` dari URL:
    - backend parsing URL terlebih dahulu (mengabaikan query/fragment), lalu ambil basename dari path terakhir sebagai `objectKey`
4. Hapus object:
   - method: `RemoveObject` pada bucket `uploads` dengan key `objectKey`.
5. Return success/error response sesuai pola `utils.SuccessResponse` / `utils.ErrorResponse`.

#### Static `/uploads` di Gin
`r.Static("/uploads", "./uploads")` dapat:
- tetap dibiarkan sebagai fallback (agar gambar lama yang sudah ada di disk tetap terlayani), atau
- dihapus setelah migrasi penuh (tidak termasuk dalam ruang lingkup desain ini).

### Dampak ke Frontend
Karena `image_url` sekarang adalah URL absolut MinIO via `http`, `next/image` perlu menerima source dari host yang benar (yang dijangkau oleh server Next.js):
- protocol: `http`
- host: `minio`
- port: `9000`

Untuk mode dev tanpa Docker (jika `MINIO_OBJECT_URL=http://localhost:9000`), host yang di-allow juga harus mencakup `localhost:9000`.

Perubahan yang diperlukan di `frontend/next.config.js`:
- saat ini konfigurasi remote images umumnya hanya mengizinkan `protocol: 'https'`, jadi `http://minio:9000/...` perlu ditambahkan agar `next/image` tidak memblok remote fetch
- Tambahkan `remotePatterns` yang mengizinkan:
  - `http://minio:9000/**`
  - `http://localhost:9000/**` (opsional, hanya jika env mengarah ke localhost)

Helper `resolveBackendAssetUrl()` saat ini:
- langsung mengembalikan jika string URL sudah `http://` / `https://`
- sehingga `image_url` absolut MinIO tidak akan “dibungkus” lagi.

### Dampak ke Data Model
Tidak perlu migrasi tabel saat ini karena:
- field seperti `image_url` pada beberapa model sudah bertipe `varchar`
- kita hanya mengisi nilai yang berbeda (MinIO absolute URL), bukan struktur data baru.

### Rencana Verifikasi (Manual)
1. `docker-compose up -d` (pastikan service `minio` ikut jalan).
2. Login admin, upload gambar via UI (mis. `GalleryManagement`).
3. Pastikan backend menyimpan `image_url` berbentuk `http://minio:9000/uploads/<uuid>.ext` (atau `http://localhost:9000/...` jika tidak pakai Docker).
4. Buka halaman publik yang menampilkan gambar (mis. galeri) dan verifikasi gambar tampil.
5. (Opsional) Verifikasi endpoint delete:
   - `DELETE /api/v1/admin/upload` menghapus object dari bucket
   - object di bucket tidak lagi bisa diakses.

### Risiko & Trade-offs
- `next/image` default hanya mengizinkan remote patterns tertentu, jadi kita harus menyesuaikan config untuk `http://minio:9000` (dan opsional `http://localhost:9000`).
- Bucket policy public read: nyaman untuk dev, tapi di produksi sebaiknya dipikirkan keamanan (mis. gunakan CDN atau presigned URL jika perlu).
- Delete membutuhkan format URL yang konsisten dengan parsing `objectKey`.

