package com.bui.inventory_management_system.config;

import com.bui.inventory_management_system.model.InventoryItem;
import com.bui.inventory_management_system.model.Order;
import com.bui.inventory_management_system.model.Warehouse;
import com.bui.inventory_management_system.repository.InventoryItemRepository;
import com.bui.inventory_management_system.repository.OrderRepository;
import com.bui.inventory_management_system.repository.WarehouseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDatabase(InventoryItemRepository itemRepo,
                                          OrderRepository orderRepo,
                                          WarehouseRepository warehouseRepo) {
        return args -> {
            if (warehouseRepo.count() == 0) {
                Warehouse w1 = new Warehouse("Main Central Hub", "WH-001", "Building A - Chicago, IL", 10000, 3420);
                Warehouse w2 = new Warehouse("West Coast Depot", "WH-002", "Dock 4 - Seattle, WA", 7500, 2150);
                Warehouse w3 = new Warehouse("East Regional Center", "WH-003", "Aisle 12 - Newark, NJ", 5000, 1890);
                warehouseRepo.saveAll(Arrays.asList(w1, w2, w3));
            }

            if (itemRepo.count() == 0) {
                InventoryItem item1 = new InventoryItem("High-Performance Server Blade", "SKU-SRV-901", "Hardware", "WH-001 / Shelf A3", 14, "Express Freight", 10, 50, 1299.99);
                InventoryItem item2 = new InventoryItem("Ultra-Wide 4K Monitor", "SKU-MON-402", "Electronics", "WH-002 / Shelf B1", 45, "Standard Ground", 15, 100, 449.50);
                InventoryItem item3 = new InventoryItem("Ergonomic Mesh Task Chair", "SKU-CHR-105", "Furniture", "WH-001 / Bay 9", 8, "Supplier Direct", 12, 40, 289.00); // Low stock!
                InventoryItem item4 = new InventoryItem("Wireless Mechanical Keyboard", "SKU-KBD-303", "Accessories", "WH-003 / Rack C4", 120, "Express Freight", 25, 150, 89.99);
                InventoryItem item5 = new InventoryItem("Fiber Optic Cable 50m", "SKU-CBL-088", "Networking", "WH-002 / Shelf D2", 3, "Standard Ground", 20, 80, 34.75); // Critical stock!
                InventoryItem item6 = new InventoryItem("USB-C Docking Hub 11-in-1", "SKU-DCK-771", "Electronics", "WH-001 / Shelf B5", 62, "Express Freight", 30, 120, 119.00);

                itemRepo.saveAll(Arrays.asList(item1, item2, item3, item4, item5, item6));
            }

            if (orderRepo.count() == 0) {
                Order o1 = new Order("ORD-8921-A", "Ergonomic Mesh Task Chair", 32, "Apex Seating Co.", "PENDING", 9248.00);
                Order o2 = new Order("ORD-7742-B", "Fiber Optic Cable 50m", 77, "Nexus Wire Labs", "SHIPPED", 2675.75);
                Order o3 = new Order("ORD-6109-C", "Ultra-Wide 4K Monitor", 20, "Vivid Displays Corp", "DELIVERED", 8990.00);
                orderRepo.saveAll(Arrays.asList(o1, o2, o3));
            }
        };
    }
}
