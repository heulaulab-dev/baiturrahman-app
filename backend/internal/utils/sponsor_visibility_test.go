package utils

import (
	"testing"
	"time"
)

func TestPublicSponsorVisible(t *testing.T) {
	j := AsiaJakarta
	d := func(y int, m time.Month, day int) time.Time {
		return time.Date(y, m, day, 12, 0, 0, 0, j)
	}
	start := d(2026, time.April, 1)
	end := d(2026, time.April, 30)

	tests := []struct {
		name   string
		vs, ve *time.Time
		now    time.Time
		want   bool
	}{
		{"nil start", nil, nil, d(2026, time.April, 15), false},
		{"before range", &start, &end, d(2026, time.March, 31), false},
		{"on start", &start, &end, d(2026, time.April, 1), true},
		{"mid range", &start, &end, d(2026, time.April, 15), true},
		{"on end", &start, &end, d(2026, time.April, 30), true},
		{"after end", &start, &end, d(2026, time.May, 1), false},
		{"open end", &start, nil, d(2027, time.January, 1), true},
		{"open end before start", &start, nil, d(2026, time.March, 1), false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := PublicSponsorVisible(tt.vs, tt.ve, tt.now); got != tt.want {
				t.Fatalf("got %v want %v", got, tt.want)
			}
		})
	}
}
