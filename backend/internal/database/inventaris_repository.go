package database

import (
	"masjid-baiturrahim-backend/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

const whereIDEquals = "id = ?"

type InventarisRepository struct {
	db *gorm.DB
}

func NewInventarisRepository(db *gorm.DB) *InventarisRepository {
	return &InventarisRepository{db: db}
}

func (r *InventarisRepository) GetAsetTetap() ([]models.AsetTetap, error) {
	var items []models.AsetTetap
	if err := r.db.Order("created_at DESC").Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *InventarisRepository) CreateAsetTetap(item *models.AsetTetap) error {
	return r.db.Create(item).Error
}

func (r *InventarisRepository) GetAsetTetapByID(id uuid.UUID) (*models.AsetTetap, error) {
	var item models.AsetTetap
	if err := r.db.First(&item, whereIDEquals, id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *InventarisRepository) UpdateAsetTetap(item *models.AsetTetap) error {
	return r.db.Save(item).Error
}

func (r *InventarisRepository) DeleteAsetTetap(id uuid.UUID) error {
	return r.db.Delete(&models.AsetTetap{}, whereIDEquals, id).Error
}

func (r *InventarisRepository) GetBarangTidakTetap(kategori string) ([]models.BarangTidakTetap, error) {
	var items []models.BarangTidakTetap
	query := r.db.Model(&models.BarangTidakTetap{})
	if kategori != "" {
		query = query.Where("kategori = ?", kategori)
	}
	if err := query.Order("kategori ASC, created_at DESC").Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *InventarisRepository) CreateBarangTidakTetap(item *models.BarangTidakTetap) error {
	return r.db.Create(item).Error
}

func (r *InventarisRepository) GetBarangTidakTetapByID(id uuid.UUID) (*models.BarangTidakTetap, error) {
	var item models.BarangTidakTetap
	if err := r.db.First(&item, whereIDEquals, id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *InventarisRepository) UpdateBarangTidakTetap(item *models.BarangTidakTetap) error {
	return r.db.Save(item).Error
}

func (r *InventarisRepository) DeleteBarangTidakTetap(id uuid.UUID) error {
	return r.db.Delete(&models.BarangTidakTetap{}, whereIDEquals, id).Error
}
