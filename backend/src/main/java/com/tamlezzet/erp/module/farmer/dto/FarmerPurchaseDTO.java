package com.tamlezzet.erp.module.farmer.dto;

import com.tamlezzet.erp.module.farmer.entity.FarmerPurchase;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
public class FarmerPurchaseDTO {
    private Long id;
    private Long farmerId;

    @NotNull
    private LocalDate purchaseDate;

    @NotNull
    private String cropName;

    private String cropVariety;

    @NotNull @Positive
    private BigDecimal quantityKg;

    @NotNull @Positive
    private BigDecimal pricePerKg;

    private BigDecimal totalAmount;
    private String batchNumber;
    private FarmerPurchase.PaymentStatus paymentStatus;
    private String notes;
}
