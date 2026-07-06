package com.tamlezzet.erp.module.export.controller;

import com.tamlezzet.erp.common.dto.ApiResponse;
import com.tamlezzet.erp.common.dto.PageResponseDTO;
import com.tamlezzet.erp.module.export.dto.ShipmentDTO;
import com.tamlezzet.erp.module.export.entity.Shipment;
import com.tamlezzet.erp.module.export.service.ShipmentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shipments")
@RequiredArgsConstructor
@Tag(name = "Export Module")
public class ShipmentController {

    private final ShipmentService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ShipmentDTO>> create(@Valid @RequestBody ShipmentDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(service.create(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ShipmentDTO>> update(@PathVariable Long id, @Valid @RequestBody ShipmentDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(service.update(id, dto)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShipmentDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(service.getById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponseDTO<ShipmentDTO>>> list(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(service.list(pageable)));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<ShipmentDTO>>> byStatus(@PathVariable Shipment.ShipmentStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(service.listByStatus(status)));
    }

    @GetMapping("/upcoming-arrivals")
    public ResponseEntity<ApiResponse<List<ShipmentDTO>>> upcomingArrivals(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ApiResponse.ok(service.listUpcomingArrivals(days)));
    }
}
