package com.tamlezzet.erp.module.farmer.controller;

import com.tamlezzet.erp.common.dto.ApiResponse;
import com.tamlezzet.erp.common.dto.PageResponseDTO;
import com.tamlezzet.erp.module.farmer.dto.FarmerDTO;
import com.tamlezzet.erp.module.farmer.dto.FarmerPurchaseDTO;
import com.tamlezzet.erp.module.farmer.service.FarmerService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/farmers")
@RequiredArgsConstructor
@Tag(name = "Farmer Database")
public class FarmerController {

    private final FarmerService farmerService;

    @PostMapping
    public ResponseEntity<ApiResponse<FarmerDTO>> create(@Valid @RequestBody FarmerDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(farmerService.create(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FarmerDTO>> update(@PathVariable Long id, @Valid @RequestBody FarmerDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(farmerService.update(id, dto)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FarmerDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(farmerService.getById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponseDTO<FarmerDTO>>> list(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(farmerService.list(pageable)));
    }

    @PostMapping("/{id}/photos")
    public ResponseEntity<ApiResponse<String>> uploadPhoto(
            @PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.ok(farmerService.uploadPhoto(id, file)));
    }

    @GetMapping("/{id}/purchases")
    public ResponseEntity<ApiResponse<List<FarmerPurchaseDTO>>> getPurchases(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(farmerService.getPurchases(id)));
    }

    @PostMapping("/{id}/purchases")
    public ResponseEntity<ApiResponse<FarmerPurchaseDTO>> recordPurchase(
            @PathVariable Long id, @Valid @RequestBody FarmerPurchaseDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(farmerService.recordPurchase(id, dto)));
    }
}
