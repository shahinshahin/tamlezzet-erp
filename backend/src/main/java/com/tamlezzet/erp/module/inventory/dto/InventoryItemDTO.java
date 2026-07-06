package com.tamlezzet.erp.module.inventory.dto;

import com.tamlezzet.erp.module.inventory.entity.InventoryItem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItemDTO {
    private Long id;

    @NotBlank
    private String itemName;

    @NotNull
    private InventoryItem.ItemType itemType;

    private String sku;
    private String batchNumber;
    private String warehouse;
    private BigDecimal quantity;

    @NotBlank
    private String unit;

    private BigDecimal reorderLevel;
    private BigDecimal costPerUnit;
    private LocalDate expiryDate;
    private LocalDate manufactureDate;
    private String notes;
    private boolean lowStock;
}
