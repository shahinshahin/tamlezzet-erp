package com.tamlezzet.erp.module.manufacturer.service;

import com.tamlezzet.erp.common.dto.PageResponseDTO;
import com.tamlezzet.erp.module.manufacturer.dto.ManufacturerDTO;
import com.tamlezzet.erp.module.manufacturer.entity.Manufacturer;
import com.tamlezzet.erp.module.manufacturer.repository.ManufacturerRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ManufacturerService {

    private final ManufacturerRepository manufacturerRepository;

    @Transactional
    public ManufacturerDTO create(ManufacturerDTO dto) {
        Manufacturer m = toEntity(dto);
        return toDTO(manufacturerRepository.save(m));
    }

    @Transactional
    public ManufacturerDTO update(Long id, ManufacturerDTO dto) {
        Manufacturer m = manufacturerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Manufacturer not found: " + id));
        m.setCompanyName(dto.getCompanyName());
        m.setContactPerson(dto.getContactPerson());
        m.setEmail(dto.getEmail());
        m.setPhone(dto.getPhone());
        m.setAddress(dto.getAddress());
        m.setCity(dto.getCity());
        m.setState(dto.getState());
        m.setGstNumber(dto.getGstNumber());
        m.setPricePerKg(dto.getPricePerKg());
        m.setMoqKg(dto.getMoqKg());
        m.setLeadTimeDays(dto.getLeadTimeDays());
        m.setQualityScore(dto.getQualityScore());
        m.setNotes(dto.getNotes());
        if (dto.getCertifications() != null) m.setCertifications(dto.getCertifications());
        return toDTO(manufacturerRepository.save(m));
    }

    public ManufacturerDTO getById(Long id) {
        return manufacturerRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Manufacturer not found: " + id));
    }

    public PageResponseDTO<ManufacturerDTO> list(Pageable pageable) {
        Page<Manufacturer> page = manufacturerRepository.findAll(pageable);
        return PageResponseDTO.<ManufacturerDTO>builder()
                .content(page.getContent().stream().map(this::toDTO).toList())
                .page(page.getNumber()).size(page.getSize())
                .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
                .last(page.isLast()).build();
    }

    private Manufacturer toEntity(ManufacturerDTO dto) {
        return Manufacturer.builder()
                .companyName(dto.getCompanyName())
                .contactPerson(dto.getContactPerson())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .city(dto.getCity())
                .state(dto.getState())
                .gstNumber(dto.getGstNumber())
                .pricePerKg(dto.getPricePerKg())
                .moqKg(dto.getMoqKg())
                .leadTimeDays(dto.getLeadTimeDays())
                .qualityScore(dto.getQualityScore())
                .notes(dto.getNotes())
                .certifications(dto.getCertifications())
                .build();
    }

    private ManufacturerDTO toDTO(Manufacturer m) {
        return ManufacturerDTO.builder()
                .id(m.getId())
                .companyName(m.getCompanyName())
                .contactPerson(m.getContactPerson())
                .email(m.getEmail())
                .phone(m.getPhone())
                .address(m.getAddress())
                .city(m.getCity())
                .state(m.getState())
                .gstNumber(m.getGstNumber())
                .pricePerKg(m.getPricePerKg())
                .moqKg(m.getMoqKg())
                .leadTimeDays(m.getLeadTimeDays())
                .qualityScore(m.getQualityScore())
                .notes(m.getNotes())
                .active(m.isActive())
                .certifications(m.getCertifications())
                .agreementUrls(m.getAgreementUrls())
                .build();
    }
}
