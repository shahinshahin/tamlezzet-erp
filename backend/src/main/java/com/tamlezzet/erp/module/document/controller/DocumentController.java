package com.tamlezzet.erp.module.document.controller;

import com.tamlezzet.erp.common.dto.ApiResponse;
import com.tamlezzet.erp.common.dto.PageResponseDTO;
import com.tamlezzet.erp.module.document.dto.DocumentDTO;
import com.tamlezzet.erp.module.document.entity.Document;
import com.tamlezzet.erp.module.document.service.DocumentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
@Tag(name = "Document Vault")
public class DocumentController {

    private final DocumentService service;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<DocumentDTO>> upload(
            @RequestParam("title") String title,
            @RequestParam("category") Document.DocumentCategory category,
            @RequestParam(value = "issueDate", required = false) LocalDate issueDate,
            @RequestParam(value = "expiryDate", required = false) LocalDate expiryDate,
            @RequestParam(value = "referenceNumber", required = false) String referenceNumber,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("file") MultipartFile file) {

        DocumentDTO meta = DocumentDTO.builder()
                .title(title).category(category)
                .issueDate(issueDate).expiryDate(expiryDate)
                .referenceNumber(referenceNumber).description(description)
                .build();
        return ResponseEntity.ok(ApiResponse.ok(service.upload(meta, file)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentDTO>> updateMeta(
            @PathVariable Long id, @RequestBody DocumentDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(service.updateMeta(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Document deleted", null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(service.getById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponseDTO<DocumentDTO>>> list(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(service.list(pageable)));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<DocumentDTO>>> byCategory(
            @PathVariable Document.DocumentCategory category) {
        return ResponseEntity.ok(ApiResponse.ok(service.listByCategory(category)));
    }

    @GetMapping("/expiring-soon")
    public ResponseEntity<ApiResponse<List<DocumentDTO>>> expiringSoon(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ApiResponse.ok(service.listExpiringSoon(days)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<DocumentDTO>>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.ok(service.search(q)));
    }
}
