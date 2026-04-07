package services

import (
	"context"
	"fmt"
	"net/url"
	"os"
	"strings"

	"masjid-baiturrahim-backend/config"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

// MinioService wraps the MinIO client for uploads and bucket setup.
type MinioService struct {
	client        *minio.Client
	bucket        string
	ObjectBaseURL string
}

// NewMinioService builds a client from config and normalizes the public object base URL (no trailing slash).
func NewMinioService(cfg *config.Config) (*MinioService, error) {
	endpointURL, err := url.Parse(strings.TrimSpace(cfg.MinioEndpoint))
	if err != nil || endpointURL.Host == "" {
		return nil, fmt.Errorf("invalid MINIO_ENDPOINT: %q", cfg.MinioEndpoint)
	}

	secure := endpointURL.Scheme == "https"
	client, err := minio.New(endpointURL.Host, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.MinioAccessKey, cfg.MinioSecretKey, ""),
		Secure: secure,
	})
	if err != nil {
		return nil, fmt.Errorf("minio client: %w", err)
	}

	base := strings.TrimRight(strings.TrimSpace(cfg.MinioObjectURL), "/")
	if base == "" {
		return nil, fmt.Errorf("MINIO_OBJECT_URL is required")
	}

	return &MinioService{
		client:        client,
		bucket:        cfg.MinioBucket,
		ObjectBaseURL: base,
	}, nil
}

// PublicObjectURL returns the browser-accessible URL for an object key (bucket name is uploads in path).
func (s *MinioService) PublicObjectURL(objectKey string) string {
	return fmt.Sprintf("%s/%s/%s", s.ObjectBaseURL, s.bucket, objectKey)
}

// EnsureBucketAndPolicy creates the bucket if missing and sets a public read policy for GetObject.
func (s *MinioService) EnsureBucketAndPolicy(ctx context.Context) error {
	exists, err := s.client.BucketExists(ctx, s.bucket)
	if err != nil {
		return fmt.Errorf("bucket exists check: %w", err)
	}
	if !exists {
		if err := s.client.MakeBucket(ctx, s.bucket, minio.MakeBucketOptions{}); err != nil {
			return fmt.Errorf("make bucket %q: %w", s.bucket, err)
		}
	}

	policy := fmt.Sprintf(`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": ["*"]},
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::%s/*"]
    }
  ]
}`, s.bucket)

	if err := s.client.SetBucketPolicy(ctx, s.bucket, policy); err != nil {
		return fmt.Errorf("set bucket policy: %w", err)
	}
	return nil
}

// PutObject uploads a file from disk to the bucket.
func (s *MinioService) PutObject(ctx context.Context, objectKey, filePath, contentType string) error {
	f, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer f.Close()

	stat, err := f.Stat()
	if err != nil {
		return err
	}

	opts := minio.PutObjectOptions{}
	if contentType != "" {
		opts.ContentType = contentType
	}

	_, err = s.client.PutObject(ctx, s.bucket, objectKey, f, stat.Size(), opts)
	return err
}

// RemoveObject deletes an object by key.
func (s *MinioService) RemoveObject(ctx context.Context, objectKey string) error {
	return s.client.RemoveObject(ctx, s.bucket, objectKey, minio.RemoveObjectOptions{})
}
