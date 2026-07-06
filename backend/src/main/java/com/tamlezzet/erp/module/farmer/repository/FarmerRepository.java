package com.tamlezzet.erp.module.farmer.repository;

import com.tamlezzet.erp.module.farmer.entity.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FarmerRepository extends JpaRepository<Farmer, Long>, JpaSpecificationExecutor<Farmer> {
    List<Farmer> findByVillage(String village);
    List<Farmer> findByCropName(String cropName);
    List<Farmer> findByActive(boolean active);
    boolean existsByMobile(String mobile);
}
