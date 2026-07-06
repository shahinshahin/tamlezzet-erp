package com.tamlezzet.erp.module.inventory.repository;

import com.tamlezzet.erp.module.inventory.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findByItemIdOrderByMovementDateDesc(Long itemId);
}
