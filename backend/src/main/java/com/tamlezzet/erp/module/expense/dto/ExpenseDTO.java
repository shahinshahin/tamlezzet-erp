package com.tamlezzet.erp.module.expense.dto;

import com.tamlezzet.erp.module.expense.entity.Expense;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseDTO {
    private Long id;

    @NotNull
    private LocalDate expenseDate;

    @NotNull @Positive
    private BigDecimal amount;

    @Builder.Default
    private BigDecimal gstAmount = BigDecimal.ZERO;

    @NotNull
    private Expense.ExpenseCategory category;

    @NotBlank
    private String vendor;

    private Expense.PaymentMode paymentMode;
    private String referenceNumber;
    private String invoiceUrl;
    private String notes;
    private Expense.ApprovalStatus approvalStatus;
    private String approvedBy;
    private String fiscalYear;
    private LocalDateTime createdAt;
    private String createdBy;
}
