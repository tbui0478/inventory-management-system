package com.bui.inventory_management_system.service;

import com.bui.inventory_management_system.model.InventoryItem;
import com.bui.inventory_management_system.repository.InventoryItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;

    @Autowired
    public InventoryService(InventoryItemRepository inventoryItemRepository) {
        this.inventoryItemRepository = inventoryItemRepository;
    }

    public List<InventoryItem> getAllItems() {
        return inventoryItemRepository.findAll();
    }

    public Optional<InventoryItem> getItemById(Long id) {
        return inventoryItemRepository.findById(id);
    }

    public InventoryItem saveItem(InventoryItem item) {
        item.recalculateToOrder();
        return inventoryItemRepository.save(item);
    }

    public Optional<InventoryItem> updateItem(Long id, InventoryItem itemDetails) {
        return inventoryItemRepository.findById(id).map(existing -> {
            existing.setProductName(itemDetails.getProductName());
            existing.setSku(itemDetails.getSku());
            existing.setCategory(itemDetails.getCategory());
            existing.setLocation(itemDetails.getLocation());
            existing.setOnHand(itemDetails.getOnHand());
            existing.setRoute(itemDetails.getRoute());
            existing.setMinStock(itemDetails.getMinStock());
            existing.setMaxStock(itemDetails.getMaxStock());
            existing.setUnitPrice(itemDetails.getUnitPrice());
            existing.recalculateToOrder();
            return inventoryItemRepository.save(existing);
        });
    }

    public boolean deleteItem(Long id) {
        if (inventoryItemRepository.existsById(id)) {
            inventoryItemRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Optional<InventoryItem> adjustStock(Long id, int quantityDelta) {
        return inventoryItemRepository.findById(id).map(item -> {
            int newQty = Math.max(0, (item.getOnHand() != null ? item.getOnHand() : 0) + quantityDelta);
            item.setOnHand(newQty);
            return inventoryItemRepository.save(item);
        });
    }
}
