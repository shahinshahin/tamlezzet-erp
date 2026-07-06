package com.tamlezzet.erp.module.crm.repository;

import com.tamlezzet.erp.module.crm.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long>, JpaSpecificationExecutor<Customer> {
    Optional<Customer> findByCustomerCode(String code);
    boolean existsByCustomerCode(String code);
    List<Customer> findByStage(Customer.CustomerStage stage);
    List<Customer> findByCountry(String country);

    @Query("SELECT c.country, COUNT(c) FROM Customer c GROUP BY c.country ORDER BY COUNT(c) DESC")
    List<Object[]> countByCountry();
}
