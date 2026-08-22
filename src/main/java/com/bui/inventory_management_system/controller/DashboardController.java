package com.bui.inventory_management_system.controller;

import com.bui.inventory_management_system.model.InventoryItem;
import com.bui.inventory_management_system.repository.InventoryItemRepository;
import com.bui.inventory_management_system.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final InventoryItemRepository inventoryItemRepository;
    private final OrderRepository orderRepository;

    @Autowired
    public DashboardController(InventoryItemRepository inventoryItemRepository, OrderRepository orderRepository) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.orderRepository = orderRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<InventoryItem> items = inventoryItemRepository.findAll();
        long totalProducts = items.size();
        
        long lowStockCount = items.stream()
                .filter(i -> i.getOnHand() != null && i.getMinStock() != null && i.getOnHand() <= i.getMinStock())
                .count();
        
        int totalUnitsOnHand = items.stream()
                .mapToInt(i -> i.getOnHand() != null ? i.getOnHand() : 0)
                .sum();
                
        int totalUnitsToOrder = items.stream()
                .mapToInt(i -> i.getToOrder() != null ? i.getToOrder() : 0)
                .sum();

        double totalValuation = items.stream()
                .mapToDouble(i -> (i.getOnHand() != null ? i.getOnHand() : 0) * (i.getUnitPrice() != null ? i.getUnitPrice() : 0.0))
                .sum();

        long pendingOrdersCount = orderRepository.findByStatus("PENDING").size();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", totalProducts);
        stats.put("lowStockCount", lowStockCount);
        stats.put("totalUnitsOnHand", totalUnitsOnHand);
        stats.put("totalUnitsToOrder", totalUnitsToOrder);
        stats.put("totalValuation", totalValuation);
        stats.put("pendingOrdersCount", pendingOrdersCount);

        return ResponseEntity.ok(stats);
    }
}
