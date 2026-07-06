package com.tamlezzet.erp.module.inventory.controller;

import com.tamlezzet.erp.common.dto.ApiResponse;
import com.tamlezzet.erp.common.dto.PageResponseDTO;
import com.tamlezzet.erp.module.inventory.dto.InventoryItemDTO;
import com.tamlezzet.erp.module.inventory.entity.StockMovement;
import com.tamlezzet.erp.module.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory")
public class InventoryController {

    private final InventoryService service;

    @PostMapping
    public ResponseEntity<ApiResponse<InventoryItemDTO>> create(@Valid @RequestBody InventoryItemDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(service.create(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InventoryItemDTO>> update(@PathVariable Long id, @Valid @RequestBody InventoryItemDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(service.update(id, dto)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InventoryItemDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(service.getById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponseDTO<InventoryItemDTO>>> list(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(service.list(pageable)));
    }

    @PostMapping("/{id}/adjust")
    public ResponseEntity<ApiResponse<InventoryItemDTO>> adjust(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        BigDecimal qty = new BigDecimal(body.get("quantity"));
        StockMovement.MovementType type = StockMovement.MovementType.valueOf(body.get("type"));
        return ResponseEntity.ok(ApiResponse.ok(
                service.adjustStock(id, qty, type, body.get("reference"), body.get("remarks"))));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<InventoryItemDTO>>> lowStock() {
        return ResponseEntity.ok(ApiResponse.ok(service.getLowStock()));
    }

    @GetMapping("/expiring-soon")
    public ResponseEntity<ApiResponse<List<InventoryItemDTO>>> expiringSoon(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ApiResponse.ok(service.getExpiringSoon(days)));
    }
}
