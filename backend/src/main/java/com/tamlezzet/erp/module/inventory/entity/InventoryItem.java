package com.tamlezzet.erp.module.inventory.entity;

import com.tamlezzet.erp.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "inventory_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem extends BaseEntity {

    @Column(nullable = false)
    private String itemName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemType itemType;

    private String sku;
    private String batchNumber;
    private String warehouse;

    @Column(nullable = false, precision = 14, scale = 3)
    private BigDecimal quantity;

    @Column(nullable = false)
    private String unit;  // KG, GRAM, PIECES, BOX

    @Column(precision = 10, scale = 2)
    private BigDecimal reorderLevel;

    @Column(precision = 10, scale = 2)
    private BigDecimal costPerUnit;

    private LocalDate expiryDate;
    private LocalDate manufactureDate;

    @Column(length = 1000)
    private String notes;

    public enum ItemType {
        RAW_MATERIAL, FINISHED_GOODS, PACKAGING, SEMI_FINISHED
    }
}
