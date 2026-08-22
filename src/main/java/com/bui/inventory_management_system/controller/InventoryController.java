package com.bui.inventory_management_system.controller;

import com.bui.inventory_management_system.model.InventoryItem;
import com.bui.inventory_management_system.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryService inventoryService;

    @Autowired
    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<List<InventoryItem>> getAllItems() {
        return ResponseEntity.ok(inventoryService.getAllItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryItem> getItemById(@PathVariable Long id) {
        return inventoryService.getItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<InventoryItem> createItem(@RequestBody InventoryItem item) {
        InventoryItem created = inventoryService.saveItem(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryItem> updateItem(@PathVariable Long id, @RequestBody InventoryItem itemDetails) {
        return inventoryService.updateItem(id, itemDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        if (inventoryService.deleteItem(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/adjust-stock")
    public ResponseEntity<InventoryItem> adjustStock(@PathVariable Long id, @RequestBody Map<String, Integer> payload) {
        Integer delta = payload.getOrDefault("delta", 0);
        return inventoryService.adjustStock(id, delta)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
