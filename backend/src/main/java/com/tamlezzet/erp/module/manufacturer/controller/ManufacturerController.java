package com.tamlezzet.erp.module.manufacturer.controller;

import com.tamlezzet.erp.common.dto.ApiResponse;
import com.tamlezzet.erp.common.dto.PageResponseDTO;
import com.tamlezzet.erp.module.manufacturer.dto.ManufacturerDTO;
import com.tamlezzet.erp.module.manufacturer.service.ManufacturerService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/manufacturers")
@RequiredArgsConstructor
@Tag(name = "Manufacturer Module")
public class ManufacturerController {

    private final ManufacturerService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ManufacturerDTO>> create(@Valid @RequestBody ManufacturerDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(service.create(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ManufacturerDTO>> update(@PathVariable Long id, @Valid @RequestBody ManufacturerDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(service.update(id, dto)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ManufacturerDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(service.getById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponseDTO<ManufacturerDTO>>> list(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(service.list(pageable)));
    }
}
