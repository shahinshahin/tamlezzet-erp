package com.tamlezzet.erp.module.document.repository;

import com.tamlezzet.erp.module.document.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long>, JpaSpecificationExecutor<Document> {
    List<Document> findByCategory(Document.DocumentCategory category);
    List<Document> findByActiveTrue();

    @Query("SELECT d FROM Document d WHERE d.expiryDate BETWEEN :start AND :end AND d.active = true")
    List<Document> findExpiringSoon(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT d FROM Document d WHERE LOWER(d.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(d.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Document> searchByKeyword(@Param("keyword") String keyword);
}
