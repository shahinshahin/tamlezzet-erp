package com.tamlezzet.erp.module.farmer.repository;

import com.tamlezzet.erp.module.farmer.entity.FarmerPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FarmerPurchaseRepository extends JpaRepository<FarmerPurchase, Long> {
    List<FarmerPurchase> findByFarmerId(Long farmerId);

    @Query("SELECT SUM(fp.totalAmount) FROM FarmerPurchase fp WHERE fp.purchaseDate BETWEEN :start AND :end")
    BigDecimal sumTotalBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT SUM(fp.totalAmount) FROM FarmerPurchase fp WHERE CAST(fp.purchaseDate AS date) = CURRENT_DATE")
    BigDecimal sumToday();
}
