package com.tamlezzet.erp.module.income.controller;

import com.tamlezzet.erp.common.dto.ApiResponse;
import com.tamlezzet.erp.common.dto.PageResponseDTO;
import com.tamlezzet.erp.module.income.dto.PaymentReceiptDTO;
import com.tamlezzet.erp.module.income.dto.SalesInvoiceDTO;
import com.tamlezzet.erp.module.income.service.SalesInvoiceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/sales-invoices")
@RequiredArgsConstructor
@Tag(name = "Income & Sales")
public class SalesInvoiceController {

    private final SalesInvoiceService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTANT','MANAGER')")
    public ResponseEntity<ApiResponse<SalesInvoiceDTO>> create(@Valid @RequestBody SalesInvoiceDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(service.create(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTANT','MANAGER')")
    public ResponseEntity<ApiResponse<SalesInvoiceDTO>> update(@PathVariable Long id, @Valid @RequestBody SalesInvoiceDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(service.update(id, dto)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SalesInvoiceDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(service.getById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponseDTO<SalesInvoiceDTO>>> list(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(service.list(pageable)));
    }

    @GetMapping("/overdue")
    public ResponseEntity<ApiResponse<List<SalesInvoiceDTO>>> overdue() {
        return ResponseEntity.ok(ApiResponse.ok(service.listOverdue()));
    }

    @PostMapping("/{id}/payments")
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTANT')")
    public ResponseEntity<ApiResponse<PaymentReceiptDTO>> addPayment(
            @PathVariable Long id, @Valid @RequestBody PaymentReceiptDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(service.addPayment(id, dto)));
    }

    @GetMapping("/outstanding-total")
    public ResponseEntity<ApiResponse<BigDecimal>> outstanding() {
        return ResponseEntity.ok(ApiResponse.ok(service.totalOutstanding()));
    }

    @GetMapping("/today-total")
    public ResponseEntity<ApiResponse<BigDecimal>> todayTotal() {
        return ResponseEntity.ok(ApiResponse.ok(service.todayTotal()));
    }
}
