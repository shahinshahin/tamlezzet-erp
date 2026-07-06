package com.tamlezzet.erp.module.document.dto;

import com.tamlezzet.erp.module.document.entity.Document;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDTO {
    private Long id;

    @NotBlank
    private String title;

    @NotNull
    private Document.DocumentCategory category;

    private String s3Key;
    private String downloadUrl;    // pre-signed URL
    private String originalFileName;
    private String contentType;
    private Long fileSizeBytes;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String referenceNumber;
    private String description;
    private boolean active;
    private boolean expiringSoon;
    private LocalDateTime createdAt;
    private String createdBy;
}
