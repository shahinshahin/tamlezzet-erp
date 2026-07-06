package com.tamlezzet.erp.module.expense.controller;

import com.tamlezzet.erp.common.dto.ApiResponse;
import com.tamlezzet.erp.common.dto.PageResponseDTO;
import com.tamlezzet.erp.module.expense.dto.ExpenseDTO;
import com.tamlezzet.erp.module.expense.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
@Tag(name = "Expense Management")
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTANT','MANAGER')")
    @Operation(summary = "Create expense")
    public ResponseEntity<ApiResponse<ExpenseDTO>> create(@Valid @RequestBody ExpenseDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.create(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTANT','MANAGER')")
    public ResponseEntity<ApiResponse<ExpenseDTO>> update(@PathVariable Long id, @Valid @RequestBody ExpenseDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTANT')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        expenseService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Expense deleted", null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.getById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponseDTO<ExpenseDTO>>> list(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.list(pageable)));
    }

    @GetMapping("/date-range")
    public ResponseEntity<ApiResponse<List<ExpenseDTO>>> byDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.listByDateRange(start, end)));
    }

    @PostMapping("/{id}/upload-invoice")
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTANT','MANAGER')")
    public ResponseEntity<ApiResponse<ExpenseDTO>> uploadInvoice(
            @PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.uploadInvoice(id, file)));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<ExpenseDTO>> approve(
            @PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.approve(id, user.getUsername())));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<ExpenseDTO>> reject(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.reject(id)));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, BigDecimal>>> summary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.summaryByCategory(start, end)));
    }

    @GetMapping("/today-total")
    public ResponseEntity<ApiResponse<BigDecimal>> todayTotal() {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.todayTotal()));
    }
}
