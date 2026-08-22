package com.bui.inventory_management_system.controller;

import com.bui.inventory_management_system.model.Warehouse;
import com.bui.inventory_management_system.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouses")
@CrossOrigin(origins = "*")
public class WarehouseController {

    private final WarehouseRepository warehouseRepository;

    @Autowired
    public WarehouseController(WarehouseRepository warehouseRepository) {
        this.warehouseRepository = warehouseRepository;
    }

    @GetMapping
    public ResponseEntity<List<Warehouse>> getAllWarehouses() {
        return ResponseEntity.ok(warehouseRepository.findAll());
    }
}
