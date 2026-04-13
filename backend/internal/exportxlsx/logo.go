package exportxlsx

import (
	"context"
	"io"
	"net/http"
	"time"
)

// minimal 1×1 transparent PNG (valid) for embedding when no remote logo works.
var minimalPNG = []byte{
	0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
	0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
	0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
	0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89,
	0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78,
	0x9c, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01,
	0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
	0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
}

// FetchLogoBytes downloads logo image bytes from url (http/https). Empty or error returns nil, nil.
func FetchLogoBytes(ctx context.Context, url string) ([]byte, error) {
	if url == "" {
		return nil, nil
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, nil
	}
	client := &http.Client{Timeout: 12 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, nil
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, nil
	}
	const max = 5 << 20
	b, err := io.ReadAll(io.LimitReader(resp.Body, max))
	if err != nil || len(b) == 0 {
		return nil, nil
	}
	return b, nil
}

// FallbackLogoPNG returns a tiny valid PNG for Excel embedding.
func FallbackLogoPNG() []byte {
	b := make([]byte, len(minimalPNG))
	copy(b, minimalPNG)
	return b
}
