package com.tamlezzet.erp.module.farmer.entity;

import com.tamlezzet.erp.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "farmer_purchases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmerPurchase extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @Column(nullable = false)
    private LocalDate purchaseDate;

    @Column(nullable = false)
    private String cropName;

    private String cropVariety;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantityKg;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerKg;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal totalAmount;

    private String batchNumber;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    private String notes;

    public enum PaymentStatus {
        PENDING, PAID, PARTIAL
    }
}
