package com.tamlezzet.erp.module.expense.entity;

import com.tamlezzet.erp.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense extends BaseEntity {

    @Column(nullable = false)
    private LocalDate expenseDate;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal gstAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseCategory category;

    @Column(nullable = false)
    private String vendor;

    @Enumerated(EnumType.STRING)
    private PaymentMode paymentMode;

    private String referenceNumber;

    private String invoiceUrl;   // S3 key

    @Column(length = 1000)
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    private String approvedBy;

    @Column(name = "fiscal_year")
    private String fiscalYear;

    public enum ExpenseCategory {
        TRAVEL, FUEL, HOTEL, PACKAGING, FREIGHT,
        MANUFACTURER, FARMER, OFFICE, MARKETING,
        SALARY, CA, BANK_CHARGES, MISCELLANEOUS
    }

    public enum PaymentMode {
        CASH, BANK_TRANSFER, UPI, CHEQUE, CARD, CREDIT
    }

    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED
    }
}
