package utils

import "time"

// AsiaJakarta is used for sponsor public visibility (calendar date).
var AsiaJakarta = func() *time.Location {
	loc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		return time.FixedZone("WIB", 7*3600)
	}
	return loc
}()

// JakartaCalendarDate returns the calendar date of t in Asia/Jakarta (time at 00:00:00 in that zone).
func JakartaCalendarDate(t time.Time) time.Time {
	t = t.In(AsiaJakarta)
	y, m, d := t.Date()
	return time.Date(y, m, d, 0, 0, 0, 0, AsiaJakarta)
}

// PublicSponsorVisible returns whether a sponsor should appear on public APIs.
// visibilityStart must be non-nil; visibilityEnd nil means open-ended.
func PublicSponsorVisible(visibilityStart, visibilityEnd *time.Time, now time.Time) bool {
	if visibilityStart == nil {
		return false
	}
	today := JakartaCalendarDate(now)
	start := JakartaCalendarDate(*visibilityStart)
	if today.Before(start) {
		return false
	}
	if visibilityEnd == nil {
		return true
	}
	end := JakartaCalendarDate(*visibilityEnd)
	return !today.After(end)
}
