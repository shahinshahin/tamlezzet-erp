package com.tamlezzet.erp.module.inventory.repository;

import com.tamlezzet.erp.module.inventory.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long>, JpaSpecificationExecutor<InventoryItem> {
    List<InventoryItem> findByItemType(InventoryItem.ItemType type);
    List<InventoryItem> findByWarehouse(String warehouse);

    @Query("SELECT i FROM InventoryItem i WHERE i.quantity <= i.reorderLevel")
    List<InventoryItem> findLowStockItems();

    @Query("SELECT i FROM InventoryItem i WHERE i.expiryDate <= :date")
    List<InventoryItem> findExpiringSoon(LocalDate date);
}
