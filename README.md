# Inventory Management System
 
> **Work in progress.** This README describes the target state of the project. Sections will be filled in / checked off as features are completed.
 
A backend system for managing product inventory across multiple warehouses, processing orders, and keeping stock levels accurate under concurrent load. Built to reflect how a real e-commerce backend handles consistency, concurrency, and async processing not just basic CRUD.
 
---
 

 
## Overview
 
This project simulates the backend of an e-commerce inventory system: tracking stock across warehouses, handling orders safely under concurrent requests, and reacting to inventory events in real time. The goal was to go beyond a simple CRUD app and implement patterns used in production systems optimistic locking, event-driven processing, and idempotent APIs.
 
---
 
## Tech Stack
 
- **Language/Framework:** Java 21, Spring Boot 3
- **Database:** PostgreSQL
- **Caching:** Redis
- **Messaging:** RabbitMQ
- **Auth:** Spring Security + JWT
- **API Docs:** springdoc-openapi (Swagger UI)
- **Testing:** JUnit 5, Mockito, Testcontainers
- **Containerization:** Docker & Docker Compose
- **CI/CD:** GitHub Actions
---
 
## Architecture
 
```
                         ┌─────────────┐
                         │   React     │  (optional admin dashboard)
                         │  Dashboard  │
                         └──────┬──────┘
                                │ REST / WebSocket
                         ┌──────▼──────┐
                         │   Spring    │
                         │  Boot API   │──── Swagger UI (/swagger-ui.html)
                         └───┬───┬─────┘
                 ┌───────────┘   └───────────┐
         ┌───────▼──────┐             ┌──────▼───────┐
         │  PostgreSQL  │             │    Redis     │
         │ (source of   │             │ (cache/rate  │
         │   truth)     │             │   limiting)  │
         └──────────────┘             └──────────────┘
                 │
         ┌───────▼──────┐
         │  RabbitMQ    │──▶ Async order processing workers
         └──────────────┘
```
 
*(Diagram will be replaced with a real exported image once the system is stable.)*
 
---
 
## Features
 
### Core
- Product catalog (CRUD, categories, SKUs, pricing)
- Multi-warehouse inventory tracking
- User accounts with role-based access (ADMIN, MANAGER, STAFF, CUSTOMER)
- Order creation, stock reservation, and fulfillment
- Search, filter, and pagination on products
### Advanced
- Optimistic locking to prevent overselling under concurrent requests
- Event-driven order pipeline (`OrderPlaced` → `InventoryReserved` → `PaymentProcessed` → `OrderShipped`) via RabbitMQ
- Idempotent order creation via `Idempotency-Key` header
- Immutable inventory audit log (stock levels derived from event history)
- Redis-based caching for product lookups
- Redis-based rate limiting on public endpoints
- Real-time low-stock alerts via WebSocket
- Basic demand forecasting (moving average on order history)
---
 
## Getting Started
 
### Prerequisites
- Java 21
- Maven
- Docker & Docker Compose
- Git
### Setup
```bash
git clone https://github.com/tbui0478/inventory-management-system
cd inventory-management-system
 
# start local services (Postgres, Redis, RabbitMQ)
docker compose up -d
 
# run the app
mvn spring-boot:run
```
 
The API will be available at `http://localhost:8080`.
 
### Environment Variables
| Variable | Description | Default (local) |
|---|---|---|
| `SPRING_DATASOURCE_URL` | Postgres connection string | `jdbc:postgresql://localhost:5432/inventory_db` |
| `SPRING_DATASOURCE_USERNAME` | DB username | `inventory_user` |
| `SPRING_DATASOURCE_PASSWORD` | DB password | `devpassword` |
| `JWT_SECRET` | Secret key for signing tokens | *(set in `.env`, not committed)* |
 
---
 
## API Documentation
 
Once the app is running, interactive API docs are available at:
```
http://localhost:8080/swagger-ui.html
```
 
*(Screenshot to be added here once endpoints are built out.)*
 
---
 
 
## Roadmap
 
- Phase 1 — Core entities & CRUD APIs
- Phase 2 — Authentication & role-based access
- Phase 3 — Orders & concurrency-safe stock reservation
- Phase 4 — Async order pipeline (RabbitMQ)
- Phase 5 — Caching, rate limiting, audit log, WebSocket alerts
- Phase 6 — React admin dashboard, deployment, demand forecasting
---
 
## Author
 
**Trinh Bui**
