# MinIO Image Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
 
**Goal:** Mengganti upload gambar dari filesystem lokal (`./uploads`) menjadi MinIO bucket `uploads`, termasuk delete object, dan memastikan `next/image` dapat memuat gambar dari MinIO di dev.

**Architecture:** Backend menambahkan wrapper MinIO client untuk upload/delete dan inisialisasi bucket saat startup. Handler `UploadImage`/`DeleteImage` dipindah ke MinIO dan menyimpan `image_url` absolut ke DB. Frontend hanya perlu update `next.config.js` untuk mengizinkan remote images dari `http://minio:9000`.

**Tech Stack:** Go 1.21 + Gin, MinIO Go SDK (`github.com/minio/minio-go/v7`), PostgreSQL, Next.js 16 + `next/image`.

---

### Task 1: Tambahkan service MinIO ke `docker-compose.yml` root

**Files:**
- Modify: `/home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/docker-compose.yml`
- (Opsional/Paralel) Modify: `/home/kiyaya/kiyaya/kiyadev/baiturrahman/baiturrahman-app/backend/docker-compose.yml`

- [ ] Step 1: Update `docker-compose.yml` root

Tambahkan service berikut (nama service `minio`):
- image: `minio/minio`
- command: `server /data --console-address ":9001"`
- volume: `minio_data:/data`
- env: `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`
- ports: `127.0.0.1:9000:9000` (S3 endpoint), `127.0.0.1:9001:9001` (console; opsional)

Pastikan service `backend` dan `frontend` bisa resolve hostname `minio` (dalam default network docker compose).

- [ ] Step 2: Beri env MinIO ke service `backend` (di root compose)

Tambahkan env pada service `backend`:
- `MINIO_ENDPOINT=http://minio:9000`
- `MINIO_ACCESS_KEY` (isi sama dengan `MINIO_ROOT_USER`)
- `MINIO_SECRET_KEY` (isi sama dengan `MINIO_ROOT_PASSWORD`)
- `MINIO_BUCKET=uploads`
- `MINIO_OBJECT_URL=http://minio:9000`

- [ ] Step 3: Tambahkan volume untuk MinIO

Tambahkan `minio_data:` di bagian `volumes:` jika belum ada.

- [ ] Step 4: Verifikasi service start

Run:
```bash
docker compose up -d
docker compose ps
```

Expected:
- service `minio` `Up` / healthy (minimal “Up”).

- [ ] Step 5: Commit

Commit message (conventional):
```bash
git add docker-compose.yml && git commit -m "devops: add MinIO to docker compose"
```

---

### Task 2: Tambahkan env/config MinIO di backend

**Files:**
- Modify: `/home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/backend/config/config.go`
- Modify: `/home/kiyaya/kiyaya/kiyadev/baiturrahman/baiturrahman-app/backend/.env.example`

- [ ] Step 1: Extend struct `Config`

Tambahkan field:
- `MinioEndpoint string`
- `MinioAccessKey string`
- `MinioSecretKey string`
- `MinioBucket string`
- `MinioObjectURL string`

- [ ] Step 2: Extend `Load()` to read env vars

Tambahkan `getEnv(...)` mapping untuk keys di atas.

Defaults minimal:
- `MINIO_ENDPOINT`: `http://minio:9000`
- `MINIO_BUCKET`: `uploads`
- `MINIO_OBJECT_URL`: `http://minio:9000`

- [ ] Step 3: Update `backend/.env.example`

Tambahkan placeholder env untuk MinIO.

- [ ] Step 4: Verifikasi build

Run:
```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/backend
go test ./...
```

Expected:
- build/compilation sukses.

- [ ] Step 5: Commit

```bash
git add backend/config/config.go backend/.env.example && git commit -m "config: add MinIO env settings"
```

---

### Task 3: Buat wrapper service MinIO + inisialisasi bucket

**Files:**
- Create: `/home/kiyaya/kiyaya/kiyadev/baiturrahman/baiturrahman-app/backend/internal/services/minio_service.go`
- Modify: `/home/kiyaya/kiyaya/kiyadev/baiturrahman/baiturrahman-app/backend/cmd/server/main.go`
- Modify: `/home/kiyaya/kiyaya/kiyadev/baiturrahman/baiturrahman-app/backend/internal/handlers/handler.go`

- [ ] Step 1: Tambahkan dependency MinIO SDK

Modifikasi `backend/go.mod` dengan menambahkan dependency:
- `github.com/minio/minio-go/v7`

Jika implementer menggunakan `go get`, pastikan versi di-lock oleh `go mod tidy`.

- [ ] Step 2: Create `minio_service.go`

Implement:
- `type MinioService struct { client *minio.Client; bucket string }`
- `func NewMinioService(cfg *config.Config) (*MinioService, error)`
- `func (s *MinioService) EnsureBucketAndPolicy(ctx context.Context) error`

Bucket creation:
- `MakeBucket(ctx, s.bucket, minio.MakeBucketOptions{})` (handle “already exists”/error).

Policy public read:
- set bucket policy yang mengizinkan `s3:GetObject` pada `uploads/*` atau set dengan prinsip “minimum viable public read”.

- [ ] Step 3: Wire into startup

Di `backend/cmd/server/main.go`:
1. Setelah `database.Initialize/Migrate/Seed`, buat MinIO service dari cfg.
2. Panggil `EnsureBucketAndPolicy()`.
3. Pass MinIO service ke `handlers.New(...)` (butuh modifikasi handler constructor).

- [ ] Step 4: Update `handlers/handler.go`

Tambahkan field pada `Handler`:
- `Minio *services.MinioService`

Ubah signature `New` agar menerima minio service:
- `func New(db *gorm.DB, minioSvc *services.MinioService) *Handler`

- [ ] Step 5: Verifikasi build

Run:
```bash
cd backend
go test ./...
```

- [ ] Step 6: Commit

```bash
git add backend/go.mod backend/internal/services/minio_service.go backend/cmd/server/main.go backend/internal/handlers/handler.go && git commit -m "backend: add MinIO service and bucket init"
```

---

### Task 4: Update upload handler: upload object ke MinIO + simpan `image_url` absolut

**Files:**
- Modify: `/home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/backend/internal/handlers/upload_handler.go`
- (Opsional) Modify: `/home/kiyaya/kiyaya/kiyadev/baiturrahman/baiturrahman-app/backend/internal/services/upload_service.go` jika perlu refactor optimasi

- [ ] Step 1: Update `UploadImage`

Ganti implementasi:
1. Simpan upload ke file temp (gunakan `os.CreateTemp` atau `os.MkdirTemp`).
2. Validasi size & extension tetap.
3. Optimize via existing `services.OptimizeImage(tempPath)`.
4. Generate object key: `<uuid><ext>` (tanpa folder).
5. Upload ke MinIO:
   - bucket: `uploads`
   - object key: `<uuid><ext>`
   - gunakan `PutObject` dengan reader + size
6. Bangun `image_url` untuk DB:
   - `image_url = cfg.MinioObjectURL + "/uploads/" + objectKey`
7. Return tetap bentuk:
```json
{"url":"<image_url>"}
```

- [ ] Step 2: Cleanup temp files

Pastikan file temp original (dan optimized rename result) dihapus setelah upload selesai.

- [ ] Step 3: Pastikan response kompatibel

Frontend `uploadAdminImage()` mengharapkan `data.data.url` string.

- [ ] Step 4: Verifikasi build

Run:
```bash
cd backend
go test ./...
```

- [ ] Step 5: Commit

```bash
git add backend/internal/handlers/upload_handler.go && git commit -m "feat: upload images to MinIO"
```

---

### Task 5: Update delete handler: delete object dari MinIO

**Files:**
- Modify: `/home/kiyaya/kiyaya/kiyadev/baiturrahman/baiturrahman-app/backend/internal/handlers/upload_handler.go`

- [ ] Step 1: Update `DeleteImage`

Implement parsing `objectKey` dari body `url`:
1. Parse URL string:
   - gunakan `net/url` untuk mengambil path
   - ambil `path.Base(u.Path)` sebagai `objectKey`
   - jika parse gagal, fallback ke `filepath.Base` setelah menghapus query (`strings.Split(url, "?")[0]`)
2. Panggil MinIO:
   - `RemoveObject(ctx, bucket, objectKey, ...)`
3. Return success/error via existing `utils.SuccessResponse` / `utils.ErrorResponse`.

- [ ] Step 2: Build check
```bash
cd backend
go test ./...
```

- [ ] Step 3: Commit

```bash
git add backend/internal/handlers/upload_handler.go && git commit -m "feat: delete MinIO uploaded images"
```

---

### Task 6: Update Next.js image allowlist for MinIO host/port

**Files:**
- Modify: `/home/kiyaya/kiyaya/kiyadev/baiturrahman/baiturrahman-app/frontend/next.config.js`

- [ ] Step 1: Update `images.remotePatterns`

Tambahkan:
- `protocol: 'http'`, `hostname: 'minio'`, `port: '9000'` (jika supported oleh Next pattern yang digunakan di config)

Jika config saat ini memakai pola `hostname: '**'` untuk https, pastikan untuk http juga ditambahkan block yang sesuai.

- [ ] Step 2: Verification (lint/build)

Run:
```bash
cd frontend
bun run lint
bun run build
```

Expected:
- lint pass
- build pass

- [ ] Step 3: Commit

```bash
git add frontend/next.config.js && git commit -m "frontend: allow MinIO remote images"
```

---

### Task 7: Manual end-to-end verification checklist

**Files:**
- None (verification only)

- [ ] Step 1: Start stack
```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app
docker compose up -d --build
```

- [ ] Step 2: Upload test via admin UI
Login sebagai admin.
Upload gambar di salah satu tempat yang pakai `uploadAdminImage()` (mis. GalleryManagement).

Expected:
- response `image_url` berupa `http://minio:9000/uploads/<uuid>.<ext>`
- gambar tampil di halaman publik yang menggunakan `resolveBackendAssetUrl`.

- [ ] Step 3: Delete test (manual API call)
Karena frontend belum memanggil DELETE:
- Ambil `image_url` dari DB / UI.
- Lakukan request:
```bash
curl -X DELETE "http://localhost:8080/api/v1/admin/upload" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"<image_url>\"}"
```

Expected:
- object hilang (akses via URL dari browser gagal/404)

- [ ] Step 4: Commit

Tidak perlu commit untuk langkah verifikasi.

---

## Plan complete

Plan selesai dan tersimpan. Dua eksekusi pilihan:

1. Subagent-Driven (recommended) - dispatch a fresh subagent per task, review between tasks.
2. Inline Execution - implement tasks in this session using executing-plans dengan checkpoints.

Which approach?

