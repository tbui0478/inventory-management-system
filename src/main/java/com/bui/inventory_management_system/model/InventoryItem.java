package com.bui.inventory_management_system.model;

import jakarta.persistence.*;

@Entity
@Table(name = "inventory_items")
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String productName;

    @Column(nullable = false, unique = true)
    private String sku;

    private String category;
    private String location;
    private Integer onHand;
    private String route;
    private Integer minStock;
    private Integer maxStock;
    private Integer toOrder;
    private Double unitPrice;

    public InventoryItem() {
    }

    public InventoryItem(String productName, String sku, String category, String location, 
                         Integer onHand, String route, Integer minStock, Integer maxStock, Double unitPrice) {
        this.productName = productName;
        this.sku = sku;
        this.category = category;
        this.location = location;
        this.onHand = onHand;
        this.route = route;
        this.minStock = minStock;
        this.maxStock = maxStock;
        this.unitPrice = unitPrice;
        this.recalculateToOrder();
    }

    public void recalculateToOrder() {
        if (this.maxStock != null && this.onHand != null) {
            this.toOrder = Math.max(0, this.maxStock - this.onHand);
        } else {
            this.toOrder = 0;
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Integer getOnHand() {
        return onHand;
    }

    public void setOnHand(Integer onHand) {
        this.onHand = onHand;
        recalculateToOrder();
    }

    public String getRoute() {
        return route;
    }

    public void setRoute(String route) {
        this.route = route;
    }

    public Integer getMinStock() {
        return minStock;
    }

    public void setMinStock(Integer minStock) {
        this.minStock = minStock;
    }

    public Integer getMaxStock() {
        return maxStock;
    }

    public void setMaxStock(Integer maxStock) {
        this.maxStock = maxStock;
        recalculateToOrder();
    }

    public Integer getToOrder() {
        return toOrder;
    }

    public void setToOrder(Integer toOrder) {
        this.toOrder = toOrder;
    }

    public Double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
    }
}
