package models

import (
	"slices"

	"gorm.io/gorm"
)

const (
	PermissionAccessDashboard    = "access_dashboard"
	PermissionAccessJamaah       = "access_jamaah"
	PermissionAccessReservasi    = "access_reservasi"
	PermissionAccessDonasiMenu   = "access_donasi_menu"
	PermissionAccessInventaris   = "access_inventaris"
	PermissionAccessLaporanMenu  = "access_laporan_menu"
	PermissionAccessKonten       = "access_konten"
	PermissionAccessSponsors     = "access_sponsors"
	PermissionAccessPengaturan   = "access_pengaturan"
	PermissionAccessRbacSettings = "access_rbac_settings"

	PermissionViewDonationReports    = "view_donation_reports"
	PermissionViewDonationStats      = "view_donation_stats"
	PermissionExportDonations        = "export_donations"
	PermissionFinanceViewReports     = "finance.view_reports"
	PermissionFinanceCreateTx        = "finance.create_transaction"
	PermissionFinanceRequestTransfer = "finance.request_transfer"
	PermissionFinanceApproveTransfer = "finance.approve_transfer"
	PermissionFinanceExportReports   = "finance.export_reports"
	PermissionFinanceAdjustOpening   = "finance.adjust_opening_balance"
)

type Permission struct {
	Key         string `gorm:"type:varchar(100);primaryKey" json:"key"`
	Name        string `gorm:"type:varchar(100);not null" json:"name"`
	Description string `gorm:"type:text" json:"description"`
	Module      string `gorm:"type:varchar(50);not null;index" json:"module"`
	IsActive    bool   `gorm:"default:true;not null;index" json:"is_active"`
}

func DefaultPermissionsCatalog() []Permission {
	return []Permission{
		{
			Key:         PermissionAccessDashboard,
			Name:        "Akses Dashboard",
			Description: "Dapat mengakses menu Dashboard",
			Module:      "menu",
			IsActive:    true,
		},
		{
			Key:         PermissionAccessJamaah,
			Name:        "Akses Jamaah",
			Description: "Dapat mengakses menu Jamaah",
			Module:      "menu",
			IsActive:    true,
		},
		{
			Key:         PermissionAccessReservasi,
			Name:        "Akses Reservasi",
			Description: "Dapat mengakses menu Reservasi",
			Module:      "menu",
			IsActive:    true,
		},
		{
			Key:         PermissionAccessDonasiMenu,
			Name:        "Akses Menu Donasi",
			Description: "Dapat melihat menu Donasi",
			Module:      "menu",
			IsActive:    true,
		},
		{
			Key:         PermissionAccessInventaris,
			Name:        "Akses Inventaris",
			Description: "Dapat mengakses menu Inventaris",
			Module:      "menu",
			IsActive:    true,
		},
		{
			Key:         PermissionAccessLaporanMenu,
			Name:        "Akses Menu Laporan",
			Description: "Dapat melihat menu Laporan",
			Module:      "menu",
			IsActive:    true,
		},
		{
			Key:         PermissionAccessKonten,
			Name:        "Akses Konten",
			Description: "Dapat mengakses menu Konten",
			Module:      "menu",
			IsActive:    true,
		},
		{
			Key:         PermissionAccessSponsors,
			Name:        "Akses Mitra & Sponsor",
			Description: "Dapat mengelola mitra dan sponsor di menu Konten",
			Module:      "menu",
			IsActive:    true,
		},
		{
			Key:         PermissionAccessPengaturan,
			Name:        "Akses Pengaturan",
			Description: "Dapat mengakses menu Pengaturan",
			Module:      "menu",
			IsActive:    true,
		},
		{
			Key:         PermissionAccessRbacSettings,
			Name:        "Akses Pengaturan RBAC",
			Description: "Dapat mengakses halaman Akses & RBAC",
			Module:      "menu",
			IsActive:    true,
		},
		{
			Key:         PermissionViewDonationReports,
			Name:        "Lihat Laporan Donasi",
			Description: "Dapat melihat daftar laporan donasi",
			Module:      "donations",
			IsActive:    true,
		},
		{
			Key:         PermissionViewDonationStats,
			Name:        "Lihat Statistik Donasi",
			Description: "Dapat melihat statistik donasi",
			Module:      "donations",
			IsActive:    true,
		},
		{
			Key:         PermissionExportDonations,
			Name:        "Ekspor Donasi",
			Description: "Dapat mengekspor data donasi ke Excel (.xlsx)",
			Module:      "donations",
			IsActive:    true,
		},
		{
			Key:         PermissionFinanceViewReports,
			Name:        "Lihat Laporan Keuangan",
			Description: "Dapat melihat transaksi dan laporan keuangan",
			Module:      "finance",
			IsActive:    true,
		},
		{
			Key:         PermissionFinanceCreateTx,
			Name:        "Buat Transaksi Keuangan",
			Description: "Dapat membuat transaksi pemasukan dan pengeluaran kas",
			Module:      "finance",
			IsActive:    true,
		},
		{
			Key:         PermissionFinanceRequestTransfer,
			Name:        "Ajukan Transfer Kas",
			Description: "Dapat membuat permintaan transfer kas besar ke kas kecil",
			Module:      "finance",
			IsActive:    true,
		},
		{
			Key:         PermissionFinanceApproveTransfer,
			Name:        "Setujui Transfer Kas",
			Description: "Dapat menyetujui atau menolak permintaan transfer kas",
			Module:      "finance",
			IsActive:    true,
		},
		{
			Key:         PermissionFinanceExportReports,
			Name:        "Ekspor Laporan Keuangan",
			Description: "Dapat mengunduh laporan keuangan PDF dan Excel (.xlsx)",
			Module:      "finance",
			IsActive:    true,
		},
		{
			Key:         PermissionFinanceAdjustOpening,
			Name:        "Koreksi Saldo Awal",
			Description: "Dapat membuat penyesuaian saldo awal dan koreksi kas",
			Module:      "finance",
			IsActive:    true,
		},
	}
}

type RolePermission struct {
	ID            uint         `gorm:"primaryKey" json:"id"`
	OrgRole       StrukturRole `gorm:"type:varchar(50);not null;index:idx_org_role_permission,unique" json:"org_role"`
	PermissionKey string       `gorm:"type:varchar(100);not null;index:idx_org_role_permission,unique" json:"permission_key"`
	Allowed       bool         `gorm:"default:true;not null" json:"allowed"`

	Permission Permission `gorm:"foreignKey:PermissionKey;references:Key;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"permission,omitempty"`
}

func IsValidOrgRole(role StrukturRole) bool {
	switch role {
	case StrukturRoleKetua,
		StrukturRoleSekretaris,
		StrukturRoleBendahara,
		StrukturRoleHumas,
		StrukturRoleImamSyah,
		StrukturRoleMuadzin,
		StrukturRoleDaiAmil,
		StrukturRoleMarbot,
		StrukturRoleLainnya:
		return true
	default:
		return false
	}
}

func AllOrgRoles() []StrukturRole {
	return []StrukturRole{
		StrukturRoleKetua,
		StrukturRoleSekretaris,
		StrukturRoleBendahara,
		StrukturRoleHumas,
		StrukturRoleImamSyah,
		StrukturRoleMuadzin,
		StrukturRoleDaiAmil,
		StrukturRoleMarbot,
		StrukturRoleLainnya,
	}
}

func defaultOrgRolePermissions() map[StrukturRole]map[string]bool {
	baseMenuPermissions := map[string]bool{
		PermissionAccessDashboard:    true,
		PermissionAccessJamaah:       true,
		PermissionAccessReservasi:    true,
		PermissionAccessDonasiMenu:   true,
		PermissionAccessInventaris:   true,
		PermissionAccessLaporanMenu:  true,
		PermissionAccessKonten:       true,
		PermissionAccessSponsors:     true,
		PermissionAccessPengaturan:   true,
		PermissionAccessRbacSettings: false,
	}

	return map[StrukturRole]map[string]bool{
		StrukturRoleBendahara: {
			PermissionAccessDashboard:        baseMenuPermissions[PermissionAccessDashboard],
			PermissionAccessJamaah:           baseMenuPermissions[PermissionAccessJamaah],
			PermissionAccessReservasi:        baseMenuPermissions[PermissionAccessReservasi],
			PermissionAccessDonasiMenu:       baseMenuPermissions[PermissionAccessDonasiMenu],
			PermissionAccessInventaris:       baseMenuPermissions[PermissionAccessInventaris],
			PermissionAccessLaporanMenu:      baseMenuPermissions[PermissionAccessLaporanMenu],
			PermissionAccessKonten:           baseMenuPermissions[PermissionAccessKonten],
			PermissionAccessSponsors:           baseMenuPermissions[PermissionAccessSponsors],
			PermissionAccessPengaturan:       baseMenuPermissions[PermissionAccessPengaturan],
			PermissionAccessRbacSettings:     baseMenuPermissions[PermissionAccessRbacSettings],
			PermissionViewDonationReports:    true,
			PermissionViewDonationStats:      true,
			PermissionExportDonations:        true,
			PermissionFinanceViewReports:     true,
			PermissionFinanceCreateTx:        true,
			PermissionFinanceRequestTransfer: true,
			PermissionFinanceApproveTransfer: true,
			PermissionFinanceExportReports:   true,
			PermissionFinanceAdjustOpening:   true,
		},
		StrukturRoleKetua: {
			PermissionAccessDashboard:      baseMenuPermissions[PermissionAccessDashboard],
			PermissionAccessJamaah:         baseMenuPermissions[PermissionAccessJamaah],
			PermissionAccessReservasi:      baseMenuPermissions[PermissionAccessReservasi],
			PermissionAccessDonasiMenu:     baseMenuPermissions[PermissionAccessDonasiMenu],
			PermissionAccessInventaris:     baseMenuPermissions[PermissionAccessInventaris],
			PermissionAccessLaporanMenu:    baseMenuPermissions[PermissionAccessLaporanMenu],
			PermissionAccessKonten:         baseMenuPermissions[PermissionAccessKonten],
			PermissionAccessSponsors:       baseMenuPermissions[PermissionAccessSponsors],
			PermissionAccessPengaturan:     baseMenuPermissions[PermissionAccessPengaturan],
			PermissionAccessRbacSettings:   true,
			PermissionFinanceViewReports:   true,
			PermissionFinanceExportReports: true,
		},
		StrukturRoleSekretaris: {
			PermissionAccessDashboard:    baseMenuPermissions[PermissionAccessDashboard],
			PermissionAccessJamaah:       baseMenuPermissions[PermissionAccessJamaah],
			PermissionAccessReservasi:    baseMenuPermissions[PermissionAccessReservasi],
			PermissionAccessDonasiMenu:   baseMenuPermissions[PermissionAccessDonasiMenu],
			PermissionAccessInventaris:   baseMenuPermissions[PermissionAccessInventaris],
			PermissionAccessLaporanMenu:  baseMenuPermissions[PermissionAccessLaporanMenu],
			PermissionAccessKonten:       baseMenuPermissions[PermissionAccessKonten],
			PermissionAccessSponsors:     baseMenuPermissions[PermissionAccessSponsors],
			PermissionAccessPengaturan:   baseMenuPermissions[PermissionAccessPengaturan],
			PermissionAccessRbacSettings: baseMenuPermissions[PermissionAccessRbacSettings],
		},
		StrukturRoleHumas: {
			PermissionAccessDashboard:    baseMenuPermissions[PermissionAccessDashboard],
			PermissionAccessJamaah:       baseMenuPermissions[PermissionAccessJamaah],
			PermissionAccessReservasi:    baseMenuPermissions[PermissionAccessReservasi],
			PermissionAccessDonasiMenu:   baseMenuPermissions[PermissionAccessDonasiMenu],
			PermissionAccessInventaris:   baseMenuPermissions[PermissionAccessInventaris],
			PermissionAccessLaporanMenu:  baseMenuPermissions[PermissionAccessLaporanMenu],
			PermissionAccessKonten:       baseMenuPermissions[PermissionAccessKonten],
			PermissionAccessSponsors:     baseMenuPermissions[PermissionAccessSponsors],
			PermissionAccessPengaturan:   baseMenuPermissions[PermissionAccessPengaturan],
			PermissionAccessRbacSettings: baseMenuPermissions[PermissionAccessRbacSettings],
		},
		StrukturRoleImamSyah: {
			PermissionAccessDashboard:    baseMenuPermissions[PermissionAccessDashboard],
			PermissionAccessJamaah:       baseMenuPermissions[PermissionAccessJamaah],
			PermissionAccessReservasi:    baseMenuPermissions[PermissionAccessReservasi],
			PermissionAccessDonasiMenu:   baseMenuPermissions[PermissionAccessDonasiMenu],
			PermissionAccessInventaris:   baseMenuPermissions[PermissionAccessInventaris],
			PermissionAccessLaporanMenu:  baseMenuPermissions[PermissionAccessLaporanMenu],
			PermissionAccessKonten:       baseMenuPermissions[PermissionAccessKonten],
			PermissionAccessSponsors:     baseMenuPermissions[PermissionAccessSponsors],
			PermissionAccessPengaturan:   baseMenuPermissions[PermissionAccessPengaturan],
			PermissionAccessRbacSettings: baseMenuPermissions[PermissionAccessRbacSettings],
		},
		StrukturRoleMuadzin: {
			PermissionAccessDashboard:    baseMenuPermissions[PermissionAccessDashboard],
			PermissionAccessJamaah:       baseMenuPermissions[PermissionAccessJamaah],
			PermissionAccessReservasi:    baseMenuPermissions[PermissionAccessReservasi],
			PermissionAccessDonasiMenu:   baseMenuPermissions[PermissionAccessDonasiMenu],
			PermissionAccessInventaris:   baseMenuPermissions[PermissionAccessInventaris],
			PermissionAccessLaporanMenu:  baseMenuPermissions[PermissionAccessLaporanMenu],
			PermissionAccessKonten:       baseMenuPermissions[PermissionAccessKonten],
			PermissionAccessSponsors:     baseMenuPermissions[PermissionAccessSponsors],
			PermissionAccessPengaturan:   baseMenuPermissions[PermissionAccessPengaturan],
			PermissionAccessRbacSettings: baseMenuPermissions[PermissionAccessRbacSettings],
		},
		StrukturRoleDaiAmil: {
			PermissionAccessDashboard:    baseMenuPermissions[PermissionAccessDashboard],
			PermissionAccessJamaah:       baseMenuPermissions[PermissionAccessJamaah],
			PermissionAccessReservasi:    baseMenuPermissions[PermissionAccessReservasi],
			PermissionAccessDonasiMenu:   baseMenuPermissions[PermissionAccessDonasiMenu],
			PermissionAccessInventaris:   baseMenuPermissions[PermissionAccessInventaris],
			PermissionAccessLaporanMenu:  baseMenuPermissions[PermissionAccessLaporanMenu],
			PermissionAccessKonten:       baseMenuPermissions[PermissionAccessKonten],
			PermissionAccessSponsors:     baseMenuPermissions[PermissionAccessSponsors],
			PermissionAccessPengaturan:   baseMenuPermissions[PermissionAccessPengaturan],
			PermissionAccessRbacSettings: baseMenuPermissions[PermissionAccessRbacSettings],
		},
		StrukturRoleMarbot: {
			PermissionAccessDashboard:    baseMenuPermissions[PermissionAccessDashboard],
			PermissionAccessJamaah:       baseMenuPermissions[PermissionAccessJamaah],
			PermissionAccessReservasi:    baseMenuPermissions[PermissionAccessReservasi],
			PermissionAccessDonasiMenu:   baseMenuPermissions[PermissionAccessDonasiMenu],
			PermissionAccessInventaris:   baseMenuPermissions[PermissionAccessInventaris],
			PermissionAccessLaporanMenu:  baseMenuPermissions[PermissionAccessLaporanMenu],
			PermissionAccessKonten:       baseMenuPermissions[PermissionAccessKonten],
			PermissionAccessSponsors:     baseMenuPermissions[PermissionAccessSponsors],
			PermissionAccessPengaturan:   baseMenuPermissions[PermissionAccessPengaturan],
			PermissionAccessRbacSettings: baseMenuPermissions[PermissionAccessRbacSettings],
		},
		StrukturRoleLainnya: {
			PermissionAccessDashboard:    baseMenuPermissions[PermissionAccessDashboard],
			PermissionAccessJamaah:       baseMenuPermissions[PermissionAccessJamaah],
			PermissionAccessReservasi:    baseMenuPermissions[PermissionAccessReservasi],
			PermissionAccessDonasiMenu:   baseMenuPermissions[PermissionAccessDonasiMenu],
			PermissionAccessInventaris:   baseMenuPermissions[PermissionAccessInventaris],
			PermissionAccessLaporanMenu:  baseMenuPermissions[PermissionAccessLaporanMenu],
			PermissionAccessKonten:       baseMenuPermissions[PermissionAccessKonten],
			PermissionAccessSponsors:     baseMenuPermissions[PermissionAccessSponsors],
			PermissionAccessPengaturan:   baseMenuPermissions[PermissionAccessPengaturan],
			PermissionAccessRbacSettings: baseMenuPermissions[PermissionAccessRbacSettings],
		},
	}
}

func ResolvePermissionMapForOrgRole(db *gorm.DB, role StrukturRole) (map[string]bool, error) {
	resolved := map[string]bool{}
	defaults := defaultOrgRolePermissions()[role]
	for key, allowed := range defaults {
		resolved[key] = allowed
	}

	var records []RolePermission
	if err := db.Where("org_role = ?", role).Find(&records).Error; err != nil {
		return nil, err
	}
	for _, rp := range records {
		resolved[rp.PermissionKey] = rp.Allowed
	}

	return resolved, nil
}

func PermissionListFromMap(permissionMap map[string]bool) []string {
	keys := make([]string, 0, len(permissionMap))
	for key, allowed := range permissionMap {
		if allowed {
			keys = append(keys, key)
		}
	}
	slices.Sort(keys)
	return keys
}
