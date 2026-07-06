package com.tamlezzet.erp.module.export.repository;

import com.tamlezzet.erp.module.export.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long>, JpaSpecificationExecutor<Shipment> {
    boolean existsByShipmentNumber(String number);
    List<Shipment> findByStatus(Shipment.ShipmentStatus status);
    List<Shipment> findByBuyerCode(String code);

    @Query("SELECT s FROM Shipment s WHERE s.eta BETWEEN :start AND :end ORDER BY s.eta")
    List<Shipment> findByEtaBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT SUM(s.invoiceValueUsd) FROM Shipment s WHERE s.shipmentDate BETWEEN :start AND :end")
    BigDecimal sumInvoiceValueBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT s.destinationCountry, SUM(s.invoiceValueUsd) FROM Shipment s WHERE s.shipmentDate BETWEEN :start AND :end GROUP BY s.destinationCountry")
    List<Object[]> sumByCountry(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
