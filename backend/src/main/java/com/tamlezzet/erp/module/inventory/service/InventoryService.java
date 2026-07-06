package com.tamlezzet.erp.module.inventory.service;

import com.tamlezzet.erp.common.dto.PageResponseDTO;
import com.tamlezzet.erp.module.inventory.dto.InventoryItemDTO;
import com.tamlezzet.erp.module.inventory.entity.InventoryItem;
import com.tamlezzet.erp.module.inventory.entity.StockMovement;
import com.tamlezzet.erp.module.inventory.repository.InventoryItemRepository;
import com.tamlezzet.erp.module.inventory.repository.StockMovementRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryItemRepository itemRepository;
    private final StockMovementRepository movementRepository;

    @Transactional
    public InventoryItemDTO create(InventoryItemDTO dto) {
        InventoryItem item = toEntity(dto);
        return toDTO(itemRepository.save(item));
    }

    @Transactional
    public InventoryItemDTO update(Long id, InventoryItemDTO dto) {
        InventoryItem item = itemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Item not found: " + id));
        item.setItemName(dto.getItemName());
        item.setItemType(dto.getItemType());
        item.setSku(dto.getSku());
        item.setBatchNumber(dto.getBatchNumber());
        item.setWarehouse(dto.getWarehouse());
        item.setUnit(dto.getUnit());
        item.setReorderLevel(dto.getReorderLevel());
        item.setCostPerUnit(dto.getCostPerUnit());
        item.setExpiryDate(dto.getExpiryDate());
        item.setManufactureDate(dto.getManufactureDate());
        item.setNotes(dto.getNotes());
        return toDTO(itemRepository.save(item));
    }

    @Transactional
    public InventoryItemDTO adjustStock(Long id, BigDecimal quantity,
                                        StockMovement.MovementType type, String reference, String remarks) {
        InventoryItem item = itemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Item not found: " + id));

        BigDecimal newQty = switch (type) {
            case INWARD -> item.getQuantity().add(quantity);
            case OUTWARD -> item.getQuantity().subtract(quantity);
            case ADJUSTMENT -> quantity;
            default -> item.getQuantity();
        };
        item.setQuantity(newQty);
        itemRepository.save(item);

        StockMovement movement = StockMovement.builder()
                .item(item)
                .movementType(type)
                .quantity(quantity)
                .movementDate(LocalDateTime.now())
                .referenceNumber(reference)
                .remarks(remarks)
                .build();
        movementRepository.save(movement);
        return toDTO(item);
    }

    public InventoryItemDTO getById(Long id) {
        return itemRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Item not found: " + id));
    }

    public PageResponseDTO<InventoryItemDTO> list(Pageable pageable) {
        Page<InventoryItem> page = itemRepository.findAll(pageable);
        return PageResponseDTO.<InventoryItemDTO>builder()
                .content(page.getContent().stream().map(this::toDTO).toList())
                .page(page.getNumber()).size(page.getSize())
                .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
                .last(page.isLast()).build();
    }

    public List<InventoryItemDTO> getLowStock() {
        return itemRepository.findLowStockItems().stream().map(this::toDTO).toList();
    }

    public List<InventoryItemDTO> getExpiringSoon(int days) {
        return itemRepository.findExpiringSoon(LocalDate.now().plusDays(days))
                .stream().map(this::toDTO).toList();
    }

    private InventoryItem toEntity(InventoryItemDTO dto) {
        return InventoryItem.builder()
                .itemName(dto.getItemName())
                .itemType(dto.getItemType())
                .sku(dto.getSku())
                .batchNumber(dto.getBatchNumber())
                .warehouse(dto.getWarehouse())
                .quantity(dto.getQuantity() != null ? dto.getQuantity() : BigDecimal.ZERO)
                .unit(dto.getUnit())
                .reorderLevel(dto.getReorderLevel())
                .costPerUnit(dto.getCostPerUnit())
                .expiryDate(dto.getExpiryDate())
                .manufactureDate(dto.getManufactureDate())
                .notes(dto.getNotes())
                .build();
    }

    private InventoryItemDTO toDTO(InventoryItem i) {
        boolean lowStock = i.getReorderLevel() != null
                && i.getQuantity().compareTo(i.getReorderLevel()) <= 0;
        return InventoryItemDTO.builder()
                .id(i.getId())
                .itemName(i.getItemName())
                .itemType(i.getItemType())
                .sku(i.getSku())
                .batchNumber(i.getBatchNumber())
                .warehouse(i.getWarehouse())
                .quantity(i.getQuantity())
                .unit(i.getUnit())
                .reorderLevel(i.getReorderLevel())
                .costPerUnit(i.getCostPerUnit())
                .expiryDate(i.getExpiryDate())
                .manufactureDate(i.getManufactureDate())
                .notes(i.getNotes())
                .lowStock(lowStock)
                .build();
    }
}
