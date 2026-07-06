package com.tamlezzet.erp.module.income.entity;

import com.tamlezzet.erp.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "payment_receipts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentReceipt extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private SalesInvoice invoice;

    @Column(nullable = false)
    private LocalDate receiptDate;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amountForeign;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amountInr;

    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal exchangeRate;

    private String bankReference;
    private String notes;
}
