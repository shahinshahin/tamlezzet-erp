package com.tamlezzet.erp.module.document.service;

import com.tamlezzet.erp.common.dto.PageResponseDTO;
import com.tamlezzet.erp.common.service.S3Service;
import com.tamlezzet.erp.module.document.dto.DocumentDTO;
import com.tamlezzet.erp.module.document.entity.Document;
import com.tamlezzet.erp.module.document.repository.DocumentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final S3Service s3Service;

    @Transactional
    public DocumentDTO upload(DocumentDTO meta, MultipartFile file) {
        String key = s3Service.uploadFile(file, "documents/" + meta.getCategory().name().toLowerCase());
        Document doc = Document.builder()
                .title(meta.getTitle())
                .category(meta.getCategory())
                .s3Key(key)
                .originalFileName(file.getOriginalFilename())
                .contentType(file.getContentType())
                .fileSizeBytes(file.getSize())
                .issueDate(meta.getIssueDate())
                .expiryDate(meta.getExpiryDate())
                .referenceNumber(meta.getReferenceNumber())
                .description(meta.getDescription())
                .build();
        return toDTO(documentRepository.save(doc));
    }

    @Transactional
    public DocumentDTO updateMeta(Long id, DocumentDTO meta) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Document not found: " + id));
        doc.setTitle(meta.getTitle());
        doc.setCategory(meta.getCategory());
        doc.setIssueDate(meta.getIssueDate());
        doc.setExpiryDate(meta.getExpiryDate());
        doc.setReferenceNumber(meta.getReferenceNumber());
        doc.setDescription(meta.getDescription());
        return toDTO(documentRepository.save(doc));
    }

    @Transactional
    public void delete(Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Document not found: " + id));
        s3Service.deleteFile(doc.getS3Key());
        doc.setActive(false);
        documentRepository.save(doc);
    }

    public DocumentDTO getById(Long id) {
        return documentRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Document not found: " + id));
    }

    public PageResponseDTO<DocumentDTO> list(Pageable pageable) {
        Page<Document> page = documentRepository.findAll(pageable);
        return PageResponseDTO.<DocumentDTO>builder()
                .content(page.getContent().stream().map(this::toDTO).toList())
                .page(page.getNumber()).size(page.getSize())
                .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
                .last(page.isLast()).build();
    }

    public List<DocumentDTO> listByCategory(Document.DocumentCategory category) {
        return documentRepository.findByCategory(category).stream().map(this::toDTO).toList();
    }

    public List<DocumentDTO> listExpiringSoon(int days) {
        return documentRepository.findExpiringSoon(LocalDate.now(), LocalDate.now().plusDays(days))
                .stream().map(this::toDTO).toList();
    }

    public List<DocumentDTO> search(String keyword) {
        return documentRepository.searchByKeyword(keyword).stream().map(this::toDTO).toList();
    }

    private DocumentDTO toDTO(Document d) {
        boolean expiringSoon = d.getExpiryDate() != null
                && d.getExpiryDate().isBefore(LocalDate.now().plusDays(30));
        return DocumentDTO.builder()
                .id(d.getId())
                .title(d.getTitle())
                .category(d.getCategory())
                .s3Key(d.getS3Key())
                .downloadUrl(s3Service.generatePresignedUrl(d.getS3Key()))
                .originalFileName(d.getOriginalFileName())
                .contentType(d.getContentType())
                .fileSizeBytes(d.getFileSizeBytes())
                .issueDate(d.getIssueDate())
                .expiryDate(d.getExpiryDate())
                .referenceNumber(d.getReferenceNumber())
                .description(d.getDescription())
                .active(d.isActive())
                .expiringSoon(expiringSoon)
                .createdAt(d.getCreatedAt())
                .createdBy(d.getCreatedBy())
                .build();
    }
}
