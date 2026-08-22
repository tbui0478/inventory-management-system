package com.bui.inventory_management_system.repository;

import com.bui.inventory_management_system.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByOrderByCreatedAtDesc();
    List<Order> findByStatus(String status);
}
