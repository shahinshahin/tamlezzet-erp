package com.tamlezzet.erp.module.farmer.service;

import com.tamlezzet.erp.common.dto.PageResponseDTO;
import com.tamlezzet.erp.common.service.S3Service;
import com.tamlezzet.erp.module.farmer.dto.FarmerDTO;
import com.tamlezzet.erp.module.farmer.dto.FarmerPurchaseDTO;
import com.tamlezzet.erp.module.farmer.entity.Farmer;
import com.tamlezzet.erp.module.farmer.entity.FarmerPurchase;
import com.tamlezzet.erp.module.farmer.repository.FarmerPurchaseRepository;
import com.tamlezzet.erp.module.farmer.repository.FarmerRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FarmerService {

    private final FarmerRepository farmerRepository;
    private final FarmerPurchaseRepository purchaseRepository;
    private final S3Service s3Service;

    @Transactional
    public FarmerDTO create(FarmerDTO dto) {
        Farmer farmer = toEntity(dto);
        return toDTO(farmerRepository.save(farmer));
    }

    @Transactional
    public FarmerDTO update(Long id, FarmerDTO dto) {
        Farmer farmer = farmerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Farmer not found: " + id));
        farmer.setFullName(dto.getFullName());
        farmer.setVillage(dto.getVillage());
        farmer.setTaluka(dto.getTaluka());
        farmer.setDistrict(dto.getDistrict());
        farmer.setState(dto.getState());
        farmer.setMobile(dto.getMobile());
        farmer.setAlternateMobile(dto.getAlternateMobile());
        farmer.setCropName(dto.getCropName());
        farmer.setCropVariety(dto.getCropVariety());
        farmer.setHarvestMonth(dto.getHarvestMonth());
        farmer.setHarvestYear(dto.getHarvestYear());
        farmer.setQualityRating(dto.getQualityRating());
        farmer.setLatitude(dto.getLatitude());
        farmer.setLongitude(dto.getLongitude());
        farmer.setNotes(dto.getNotes());
        return toDTO(farmerRepository.save(farmer));
    }

    @Transactional
    public String uploadPhoto(Long id, MultipartFile file) {
        Farmer farmer = farmerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Farmer not found: " + id));
        String key = s3Service.uploadFile(file, "farmers/photos");
        farmer.getPhotoUrls().add(key);
        farmerRepository.save(farmer);
        return s3Service.generatePresignedUrl(key);
    }

    @Transactional
    public FarmerPurchaseDTO recordPurchase(Long farmerId, FarmerPurchaseDTO dto) {
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new EntityNotFoundException("Farmer not found: " + farmerId));
        FarmerPurchase purchase = FarmerPurchase.builder()
                .farmer(farmer)
                .purchaseDate(dto.getPurchaseDate())
                .cropName(dto.getCropName())
                .cropVariety(dto.getCropVariety())
                .quantityKg(dto.getQuantityKg())
                .pricePerKg(dto.getPricePerKg())
                .totalAmount(dto.getQuantityKg().multiply(dto.getPricePerKg()))
                .batchNumber(dto.getBatchNumber())
                .paymentStatus(dto.getPaymentStatus())
                .notes(dto.getNotes())
                .build();
        return toPurchaseDTO(purchaseRepository.save(purchase));
    }

    public FarmerDTO getById(Long id) {
        return farmerRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Farmer not found: " + id));
    }

    public PageResponseDTO<FarmerDTO> list(Pageable pageable) {
        Page<Farmer> page = farmerRepository.findAll(pageable);
        return PageResponseDTO.<FarmerDTO>builder()
                .content(page.getContent().stream().map(this::toDTO).toList())
                .page(page.getNumber()).size(page.getSize())
                .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
                .last(page.isLast()).build();
    }

    public List<FarmerPurchaseDTO> getPurchases(Long farmerId) {
        return purchaseRepository.findByFarmerId(farmerId).stream().map(this::toPurchaseDTO).toList();
    }

    // ---- helpers ----
    private Farmer toEntity(FarmerDTO dto) {
        return Farmer.builder()
                .fullName(dto.getFullName())
                .village(dto.getVillage())
                .taluka(dto.getTaluka())
                .district(dto.getDistrict())
                .state(dto.getState())
                .mobile(dto.getMobile())
                .alternateMobile(dto.getAlternateMobile())
                .cropName(dto.getCropName())
                .cropVariety(dto.getCropVariety())
                .harvestMonth(dto.getHarvestMonth())
                .harvestYear(dto.getHarvestYear())
                .qualityRating(dto.getQualityRating())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .notes(dto.getNotes())
                .build();
    }

    private FarmerDTO toDTO(Farmer f) {
        return FarmerDTO.builder()
                .id(f.getId())
                .fullName(f.getFullName())
                .village(f.getVillage())
                .taluka(f.getTaluka())
                .district(f.getDistrict())
                .state(f.getState())
                .mobile(f.getMobile())
                .alternateMobile(f.getAlternateMobile())
                .cropName(f.getCropName())
                .cropVariety(f.getCropVariety())
                .harvestMonth(f.getHarvestMonth())
                .harvestYear(f.getHarvestYear())
                .qualityRating(f.getQualityRating())
                .latitude(f.getLatitude())
                .longitude(f.getLongitude())
                .notes(f.getNotes())
                .active(f.isActive())
                .photoUrls(f.getPhotoUrls().stream()
                        .map(s3Service::generatePresignedUrl).toList())
                .build();
    }

    private FarmerPurchaseDTO toPurchaseDTO(FarmerPurchase p) {
        return FarmerPurchaseDTO.builder()
                .id(p.getId())
                .farmerId(p.getFarmer().getId())
                .purchaseDate(p.getPurchaseDate())
                .cropName(p.getCropName())
                .cropVariety(p.getCropVariety())
                .quantityKg(p.getQuantityKg())
                .pricePerKg(p.getPricePerKg())
                .totalAmount(p.getTotalAmount())
                .batchNumber(p.getBatchNumber())
                .paymentStatus(p.getPaymentStatus())
                .notes(p.getNotes())
                .build();
    }
}
