package com.tamlezzet.erp.module.expense.service;

import com.tamlezzet.erp.common.dto.PageResponseDTO;
import com.tamlezzet.erp.common.service.S3Service;
import com.tamlezzet.erp.module.expense.dto.ExpenseDTO;
import com.tamlezzet.erp.module.expense.entity.Expense;
import com.tamlezzet.erp.module.expense.repository.ExpenseRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final S3Service s3Service;

    @Transactional
    public ExpenseDTO create(ExpenseDTO dto) {
        Expense expense = toEntity(dto);
        expense.setFiscalYear(fiscalYear(dto.getExpenseDate()));
        return toDTO(expenseRepository.save(expense));
    }

    @Transactional
    public ExpenseDTO update(Long id, ExpenseDTO dto) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found: " + id));
        expense.setExpenseDate(dto.getExpenseDate());
        expense.setAmount(dto.getAmount());
        expense.setGstAmount(dto.getGstAmount() != null ? dto.getGstAmount() : BigDecimal.ZERO);
        expense.setCategory(dto.getCategory());
        expense.setVendor(dto.getVendor());
        expense.setPaymentMode(dto.getPaymentMode());
        expense.setReferenceNumber(dto.getReferenceNumber());
        expense.setNotes(dto.getNotes());
        if (dto.getApprovalStatus() != null) expense.setApprovalStatus(dto.getApprovalStatus());
        return toDTO(expenseRepository.save(expense));
    }

    @Transactional
    public void delete(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found: " + id));
        if (expense.getInvoiceUrl() != null) s3Service.deleteFile(expense.getInvoiceUrl());
        expenseRepository.delete(expense);
    }

    @Transactional
    public ExpenseDTO uploadInvoice(Long id, MultipartFile file) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found: " + id));
        if (expense.getInvoiceUrl() != null) s3Service.deleteFile(expense.getInvoiceUrl());
        String key = s3Service.uploadFile(file, "expenses");
        expense.setInvoiceUrl(key);
        return toDTO(expenseRepository.save(expense));
    }

    @Transactional
    public ExpenseDTO approve(Long id, String approvedBy) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found: " + id));
        expense.setApprovalStatus(Expense.ApprovalStatus.APPROVED);
        expense.setApprovedBy(approvedBy);
        return toDTO(expenseRepository.save(expense));
    }

    @Transactional
    public ExpenseDTO reject(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found: " + id));
        expense.setApprovalStatus(Expense.ApprovalStatus.REJECTED);
        return toDTO(expenseRepository.save(expense));
    }

    public ExpenseDTO getById(Long id) {
        return expenseRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found: " + id));
    }

    public PageResponseDTO<ExpenseDTO> list(Pageable pageable) {
        Page<Expense> page = expenseRepository.findAll(pageable);
        return PageResponseDTO.<ExpenseDTO>builder()
                .content(page.getContent().stream().map(this::toDTO).toList())
                .page(page.getNumber()).size(page.getSize())
                .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
                .last(page.isLast()).build();
    }

    public List<ExpenseDTO> listByDateRange(LocalDate start, LocalDate end) {
        return expenseRepository.findByExpenseDateBetween(start, end)
                .stream().map(this::toDTO).toList();
    }

    public Map<String, BigDecimal> summaryByCategory(LocalDate start, LocalDate end) {
        return expenseRepository.sumByCategory(start, end).stream()
                .collect(Collectors.toMap(
                        row -> ((Expense.ExpenseCategory) row[0]).name(),
                        row -> (BigDecimal) row[1]));
    }

    public BigDecimal todayTotal() {
        BigDecimal t = expenseRepository.sumToday();
        return t != null ? t : BigDecimal.ZERO;
    }

    // ---- helpers ----
    private Expense toEntity(ExpenseDTO dto) {
        return Expense.builder()
                .expenseDate(dto.getExpenseDate())
                .amount(dto.getAmount())
                .gstAmount(dto.getGstAmount() != null ? dto.getGstAmount() : BigDecimal.ZERO)
                .category(dto.getCategory())
                .vendor(dto.getVendor())
                .paymentMode(dto.getPaymentMode())
                .referenceNumber(dto.getReferenceNumber())
                .notes(dto.getNotes())
                .approvalStatus(dto.getApprovalStatus() != null
                        ? dto.getApprovalStatus() : Expense.ApprovalStatus.PENDING)
                .build();
    }

    private ExpenseDTO toDTO(Expense e) {
        return ExpenseDTO.builder()
                .id(e.getId())
                .expenseDate(e.getExpenseDate())
                .amount(e.getAmount())
                .gstAmount(e.getGstAmount())
                .category(e.getCategory())
                .vendor(e.getVendor())
                .paymentMode(e.getPaymentMode())
                .referenceNumber(e.getReferenceNumber())
                .invoiceUrl(e.getInvoiceUrl() != null ? s3Service.generatePresignedUrl(e.getInvoiceUrl()) : null)
                .notes(e.getNotes())
                .approvalStatus(e.getApprovalStatus())
                .approvedBy(e.getApprovedBy())
                .fiscalYear(e.getFiscalYear())
                .createdAt(e.getCreatedAt())
                .createdBy(e.getCreatedBy())
                .build();
    }

    private String fiscalYear(LocalDate date) {
        int year = date.getMonthValue() >= 4 ? date.getYear() : date.getYear() - 1;
        return "FY" + year + "-" + (year + 1);
    }
}
