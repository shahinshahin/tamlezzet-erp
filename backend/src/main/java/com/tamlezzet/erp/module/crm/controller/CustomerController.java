package com.tamlezzet.erp.module.crm.controller;

import com.tamlezzet.erp.common.dto.ApiResponse;
import com.tamlezzet.erp.common.dto.PageResponseDTO;
import com.tamlezzet.erp.module.crm.dto.CustomerDTO;
import com.tamlezzet.erp.module.crm.entity.Customer;
import com.tamlezzet.erp.module.crm.service.CustomerService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
@Tag(name = "Customer CRM")
public class CustomerController {

    private final CustomerService service;

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerDTO>> create(@Valid @RequestBody CustomerDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(service.create(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerDTO>> update(@PathVariable Long id, @Valid @RequestBody CustomerDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(service.update(id, dto)));
    }

    @PatchMapping("/{id}/stage")
    public ResponseEntity<ApiResponse<CustomerDTO>> updateStage(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok(
                service.updateStage(id, Customer.CustomerStage.valueOf(body.get("stage")))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(service.getById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponseDTO<CustomerDTO>>> list(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(service.list(pageable)));
    }

    @GetMapping("/by-stage/{stage}")
    public ResponseEntity<ApiResponse<List<CustomerDTO>>> byStage(@PathVariable Customer.CustomerStage stage) {
        return ResponseEntity.ok(ApiResponse.ok(service.listByStage(stage)));
    }
}
