package com.tamlezzet.erp.module.document.entity;

import com.tamlezzet.erp.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentCategory category;

    @Column(name = "s3key", nullable = false)
    private String s3Key;

    private String originalFileName;
    private String contentType;
    private Long fileSizeBytes;

    private LocalDate issueDate;
    private LocalDate expiryDate;

    private String referenceNumber;   // registration number, licence number etc.

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    public enum DocumentCategory {
        LLP, GST, FSSAI, IEC, TRADEMARK, CONTRACT,
        INVOICE, LAB_REPORT, BANK, INSURANCE, OTHER
    }
}
