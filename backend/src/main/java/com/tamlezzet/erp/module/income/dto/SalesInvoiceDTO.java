package com.tamlezzet.erp.module.income.dto;

import com.tamlezzet.erp.module.income.entity.SalesInvoice;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesInvoiceDTO {
    private Long id;

    @NotBlank
    private String invoiceNumber;

    @NotBlank
    private String customerName;

    private String customerCode;

    @NotNull
    private LocalDate invoiceDate;

    @NotNull
    private LocalDate dueDate;

    @NotBlank
    private String currency;

    @NotNull @Positive
    private BigDecimal exchangeRate;

    @NotNull @Positive
    private BigDecimal amountForeign;

    private BigDecimal amountInr;
    private BigDecimal receivedAmount;
    private BigDecimal outstandingAmount;
    private SalesInvoice.InvoiceStatus status;
    private String invoiceDocUrl;
    private String notes;
    private List<PaymentReceiptDTO> receipts;
}
