package com.tamlezzet.erp.module.export.service;

import com.tamlezzet.erp.common.dto.PageResponseDTO;
import com.tamlezzet.erp.module.export.dto.ShipmentDTO;
import com.tamlezzet.erp.module.export.entity.Shipment;
import com.tamlezzet.erp.module.export.repository.ShipmentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;

    @Transactional
    public ShipmentDTO create(ShipmentDTO dto) {
        if (shipmentRepository.existsByShipmentNumber(dto.getShipmentNumber())) {
            throw new IllegalArgumentException("Shipment number already exists: " + dto.getShipmentNumber());
        }
        return toDTO(shipmentRepository.save(toEntity(dto)));
    }

    @Transactional
    public ShipmentDTO update(Long id, ShipmentDTO dto) {
        Shipment s = shipmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Shipment not found: " + id));
        s.setBuyerName(dto.getBuyerName());
        s.setBuyerCode(dto.getBuyerCode());
        s.setDestinationCountry(dto.getDestinationCountry());
        s.setDestinationPort(dto.getDestinationPort());
        s.setOriginPort(dto.getOriginPort());
        s.setContainerNumber(dto.getContainerNumber());
        s.setVesselName(dto.getVesselName());
        s.setVoyageNumber(dto.getVoyageNumber());
        s.setShipmentDate(dto.getShipmentDate());
        s.setEtd(dto.getEtd());
        s.setEta(dto.getEta());
        s.setActualArrival(dto.getActualArrival());
        s.setInvoiceNumber(dto.getInvoiceNumber());
        s.setShippingBillNumber(dto.getShippingBillNumber());
        s.setNetWeightKg(dto.getNetWeightKg());
        s.setGrossWeightKg(dto.getGrossWeightKg());
        s.setInvoiceValueUsd(dto.getInvoiceValueUsd());
        s.setFreightCost(dto.getFreightCost());
        if (dto.getStatus() != null) s.setStatus(dto.getStatus());
        if (dto.getPaymentStatus() != null) s.setPaymentStatus(dto.getPaymentStatus());
        s.setNotes(dto.getNotes());
        return toDTO(shipmentRepository.save(s));
    }

    public ShipmentDTO getById(Long id) {
        return shipmentRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Shipment not found: " + id));
    }

    public PageResponseDTO<ShipmentDTO> list(Pageable pageable) {
        Page<Shipment> page = shipmentRepository.findAll(pageable);
        return PageResponseDTO.<ShipmentDTO>builder()
                .content(page.getContent().stream().map(this::toDTO).toList())
                .page(page.getNumber()).size(page.getSize())
                .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
                .last(page.isLast()).build();
    }

    public List<ShipmentDTO> listByStatus(Shipment.ShipmentStatus status) {
        return shipmentRepository.findByStatus(status).stream().map(this::toDTO).toList();
    }

    public List<ShipmentDTO> listUpcomingArrivals(int days) {
        return shipmentRepository.findByEtaBetween(LocalDate.now(), LocalDate.now().plusDays(days))
                .stream().map(this::toDTO).toList();
    }

    private Shipment toEntity(ShipmentDTO dto) {
        return Shipment.builder()
                .shipmentNumber(dto.getShipmentNumber())
                .buyerName(dto.getBuyerName())
                .buyerCode(dto.getBuyerCode())
                .destinationCountry(dto.getDestinationCountry())
                .destinationPort(dto.getDestinationPort())
                .originPort(dto.getOriginPort())
                .containerNumber(dto.getContainerNumber())
                .vesselName(dto.getVesselName())
                .voyageNumber(dto.getVoyageNumber())
                .shipmentDate(dto.getShipmentDate())
                .etd(dto.getEtd())
                .eta(dto.getEta())
                .invoiceNumber(dto.getInvoiceNumber())
                .shippingBillNumber(dto.getShippingBillNumber())
                .netWeightKg(dto.getNetWeightKg())
                .grossWeightKg(dto.getGrossWeightKg())
                .invoiceValueUsd(dto.getInvoiceValueUsd())
                .freightCost(dto.getFreightCost())
                .notes(dto.getNotes())
                .build();
    }

    private ShipmentDTO toDTO(Shipment s) {
        return ShipmentDTO.builder()
                .id(s.getId())
                .shipmentNumber(s.getShipmentNumber())
                .buyerName(s.getBuyerName())
                .buyerCode(s.getBuyerCode())
                .destinationCountry(s.getDestinationCountry())
                .destinationPort(s.getDestinationPort())
                .originPort(s.getOriginPort())
                .containerNumber(s.getContainerNumber())
                .vesselName(s.getVesselName())
                .voyageNumber(s.getVoyageNumber())
                .shipmentDate(s.getShipmentDate())
                .etd(s.getEtd())
                .eta(s.getEta())
                .actualArrival(s.getActualArrival())
                .invoiceNumber(s.getInvoiceNumber())
                .shippingBillNumber(s.getShippingBillNumber())
                .netWeightKg(s.getNetWeightKg())
                .grossWeightKg(s.getGrossWeightKg())
                .invoiceValueUsd(s.getInvoiceValueUsd())
                .freightCost(s.getFreightCost())
                .status(s.getStatus())
                .paymentStatus(s.getPaymentStatus())
                .documentUrls(s.getDocumentUrls())
                .notes(s.getNotes())
                .build();
    }
}
