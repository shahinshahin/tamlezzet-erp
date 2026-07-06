package com.tamlezzet.erp.module.finance.controller;

import com.tamlezzet.erp.common.dto.ApiResponse;
import com.tamlezzet.erp.module.finance.dto.FinanceDashboardDTO;
import com.tamlezzet.erp.module.finance.service.FinanceDashboardService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/finance")
@RequiredArgsConstructor
@Tag(name = "Finance Dashboard")
public class FinanceDashboardController {

    private final FinanceDashboardService service;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<FinanceDashboardDTO>> getDashboard(
            @RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(ApiResponse.ok(service.getFinanceDashboard(months)));
    }
}
