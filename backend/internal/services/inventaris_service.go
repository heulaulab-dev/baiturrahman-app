package services

import (
	"masjid-baiturrahim-backend/internal/database"
	"masjid-baiturrahim-backend/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type InventarisService struct {
	repository *database.InventarisRepository
}

func NewInventarisService(db *gorm.DB) *InventarisService {
	return &InventarisService{
		repository: database.NewInventarisRepository(db),
	}
}

func (s *InventarisService) GetAsetTetap() ([]models.AsetTetap, error) {
	return s.repository.GetAsetTetap()
}

func (s *InventarisService) CreateAsetTetap(item *models.AsetTetap) error {
	return s.repository.CreateAsetTetap(item)
}

func (s *InventarisService) UpdateAsetTetap(id uuid.UUID, payload *models.AsetTetap) (*models.AsetTetap, error) {
	item, err := s.repository.GetAsetTetapByID(id)
	if err != nil {
		return nil, err
	}

	item.NamaAset = payload.NamaAset
	item.Luas = payload.Luas

	if err := s.repository.UpdateAsetTetap(item); err != nil {
		return nil, err
	}

	return item, nil
}

func (s *InventarisService) DeleteAsetTetap(id uuid.UUID) error {
	return s.repository.DeleteAsetTetap(id)
}

func (s *InventarisService) GetBarangTidakTetap(kategori string) ([]models.BarangTidakTetap, error) {
	return s.repository.GetBarangTidakTetap(kategori)
}

func (s *InventarisService) CreateBarangTidakTetap(item *models.BarangTidakTetap) error {
	return s.repository.CreateBarangTidakTetap(item)
}

func (s *InventarisService) UpdateBarangTidakTetap(id uuid.UUID, payload *models.BarangTidakTetap) (*models.BarangTidakTetap, error) {
	item, err := s.repository.GetBarangTidakTetapByID(id)
	if err != nil {
		return nil, err
	}

	item.Kategori = payload.Kategori
	item.NamaBarang = payload.NamaBarang
	item.Jumlah = payload.Jumlah
	item.Satuan = payload.Satuan
	item.KondisiBaik = payload.KondisiBaik
	item.Keterangan = payload.Keterangan

	if err := s.repository.UpdateBarangTidakTetap(item); err != nil {
		return nil, err
	}

	return item, nil
}

func (s *InventarisService) DeleteBarangTidakTetap(id uuid.UUID) error {
	return s.repository.DeleteBarangTidakTetap(id)
}
