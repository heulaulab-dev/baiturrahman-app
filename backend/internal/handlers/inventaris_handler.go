package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	"masjid-baiturrahim-backend/internal/exportxlsx"
	"masjid-baiturrahim-backend/internal/models"
	"masjid-baiturrahim-backend/internal/services"
	"masjid-baiturrahim-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

const invalidIDFormatMessage = "Invalid ID format"

func (h *Handler) GetAsetTetap(c *gin.Context) {
	service := services.NewInventarisService(h.DB)
	items, err := service.GetAsetTetap()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to get aset tetap")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, items, "")
}

func (h *Handler) CreateAsetTetap(c *gin.Context) {
	var payload models.AsetTetap
	if err := c.ShouldBindJSON(&payload); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	service := services.NewInventarisService(h.DB)
	if err := service.CreateAsetTetap(&payload); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create aset tetap")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, payload, "Aset tetap created successfully")
}

func (h *Handler) UpdateAsetTetap(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, invalidIDFormatMessage)
		return
	}

	var payload models.AsetTetap
	if err := c.ShouldBindJSON(&payload); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	service := services.NewInventarisService(h.DB)
	item, err := service.UpdateAsetTetap(id, &payload)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.ErrorResponse(c, http.StatusNotFound, "Aset tetap not found")
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update aset tetap")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, item, "Aset tetap updated successfully")
}

func (h *Handler) DeleteAsetTetap(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, invalidIDFormatMessage)
		return
	}

	service := services.NewInventarisService(h.DB)
	if err := service.DeleteAsetTetap(id); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete aset tetap")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, nil, "Aset tetap deleted successfully")
}

func (h *Handler) GetBarangTidakTetap(c *gin.Context) {
	kategori := c.Query("kategori")

	service := services.NewInventarisService(h.DB)
	items, err := service.GetBarangTidakTetap(kategori)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to get barang tidak tetap")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, items, "")
}

func (h *Handler) CreateBarangTidakTetap(c *gin.Context) {
	var payload models.BarangTidakTetap
	if err := c.ShouldBindJSON(&payload); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	service := services.NewInventarisService(h.DB)
	if err := service.CreateBarangTidakTetap(&payload); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create barang tidak tetap")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, payload, "Barang tidak tetap created successfully")
}

func (h *Handler) UpdateBarangTidakTetap(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, invalidIDFormatMessage)
		return
	}

	var payload models.BarangTidakTetap
	if err := c.ShouldBindJSON(&payload); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	service := services.NewInventarisService(h.DB)
	item, err := service.UpdateBarangTidakTetap(id, &payload)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.ErrorResponse(c, http.StatusNotFound, "Barang tidak tetap not found")
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update barang tidak tetap")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, item, "Barang tidak tetap updated successfully")
}

func (h *Handler) DeleteBarangTidakTetap(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, invalidIDFormatMessage)
		return
	}

	service := services.NewInventarisService(h.DB)
	if err := service.DeleteBarangTidakTetap(id); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete barang tidak tetap")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, nil, "Barang tidak tetap deleted successfully")
}

func (h *Handler) ExportInventarisXLSX(c *gin.Context) {
	svc := services.NewInventarisService(h.DB)
	aset, err := svc.GetAsetTetap()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load aset tetap")
		return
	}
	barang, err := svc.GetBarangTidakTetap("")
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load barang tidak tetap")
		return
	}

	buf, err := exportxlsx.BuildInventarisXLSX(aset, barang)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	now := time.Now()
	filename := fmt.Sprintf("inventaris-%04d-%02d-%02d.xlsx", now.Year(), now.Month(), now.Day())
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	c.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buf)
}
