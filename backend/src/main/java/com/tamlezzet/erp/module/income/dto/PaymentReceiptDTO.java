package com.tamlezzet.erp.module.income.dto;

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
public class PaymentReceiptDTO {
    private Long id;
    private Long invoiceId;

    @NotNull
    private LocalDate receiptDate;

    @NotNull @Positive
    private BigDecimal amountForeign;

    private BigDecimal amountInr;

    @NotNull @Positive
    private BigDecimal exchangeRate;

    private String bankReference;
    private String notes;
}
