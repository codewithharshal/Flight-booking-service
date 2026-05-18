# ✈️ Flight Booking Service

A **microservice** for managing flight seat bookings and payments in a distributed airline reservation system. This service handles the complete booking lifecycle — from seat reservation and payment processing to booking expiry and cancellation — while coordinating with a separate **Flight Service** for flight/seat data.

---

## 📌 Problem Statement

Modern airline booking systems face several critical challenges:

1. **Distributed Booking Integrity** — Booking a flight involves checking seat availability, calculating pricing, and processing payments across multiple systems. These operations must be **atomic** — if any step fails, the entire booking must roll back cleanly to prevent **overbooking** or **ghost reservations**.

2. **Time-Bound Reservations** — When a user initiates a booking, seats must be temporarily held. If the user doesn't complete payment within a reasonable window (e.g., 5 minutes), the reservation must **automatically expire** and release the held seats back to the inventory.

3. **Inter-Service Coordination** — In a microservices architecture, the booking service must reliably communicate with the flight inventory service. Any communication failure or inconsistent state between services can lead to data corruption.

4. **Concurrent Booking Conflicts** — Multiple users may attempt to book the same flight simultaneously. The system must handle **race conditions** and ensure that seat count updates are consistent.

---

## 💡 Our Solution & Technical Approach

### Architecture Overview

```
┌──────────────┐     HTTP/REST      ┌──────────────────┐
│              │ ◄────────────────── │                  │
│  Booking     │     (Axios)        │   Flight Service  │
│  Service     │                    │   (External)      │
│  (This One)  │ ──────────────────►│                   │
│              │                    │  - Flight Info    │
│              │                    │  - Seat Inventory │
└──────┬───────┘                    └──────────────────┘
       │
       │ Sequelize ORM
       ▼
┌──────────────┐
│   MySQL DB   │
│  (Bookings)  │
└──────────────┘
```

### Key Design Decisions

#### 1. **Repository Pattern + Layered Architecture**

We follow a strict layered architecture with clear separation of concerns:

- **Controller Layer** — Handles HTTP request/response, delegates to services
- **Service Layer** — All business logic lives here (orchestration, validation, transactions)
- **Repository Layer** — Data access abstraction via `CrudRepository` base class (generic `create`, `read`, `update`, `delete`) and `BookingRepository` for booking-specific queries

This makes the codebase **testable**, **maintainable**, and **swap-friendly** (e.g., swapping MySQL for PostgreSQL requires only repository changes).

#### 2. **ACID Transactions for Booking Integrity**

We use **Sequelize database transactions** to ensure that the entire booking flow (reserve → check seat → calculate price → create booking → update inventory) is atomic. If any step fails:

- The transaction is **rolled back** → no partial bookings
- Held seats are released automatically
- The calling service receives a clear error

```
createBooking(data) ─► BEGIN TRANSACTION
    ├─ GET flight details from Flight Service
    ├─ VALIDATE seat availability
    ├─ CALCULATE total cost
    ├─ INSERT booking record with status INITIATED
    ├─ UPDATE seat inventory via Flight Service
    └─ COMMIT TRANSACTION  ✅
```

#### 3. **Booking Expiry with 5-Minute Window**

When a booking is created with `INITIATED` status, the user has **5 minutes** to complete payment. The `makePayment` flow:

- Fetches the booking record
- Checks if `currentTime - bookingTime > 300000ms (5 min)`
- If expired → updates status to `CANCELLED` → throws error
- If valid → validates amount, user → marks as `BOOKED`

This prevents indefinite seat holding and ensures fair resource usage.

#### 4. **Booking Status Lifecycle**

```
                  ┌──────────┐
                  │ INITIATED│ ◄── Booking created, seats held
                  └────┬─────┘
                       │
          ┌────────────┼────────────┐
          ▼                         ▼
    ┌──────────┐             ┌──────────┐
    │  BOOKED  │             │ CANCELLED│
    │          │             │          │
    │ Payment  │             │ Expired  │
    │ Complete │             │ or User  │
    └──────────┘             │ Cancelled│
                             └──────────┘
```

#### 5. **Idempotent Payment Processing**

The `makePayment` method validates:

- Booking exists and is not already cancelled
- Payment amount matches the calculated `totalCost`
- The requesting `userId` matches the booking owner
- Booking hasn't exceeded the 5-minute expiry window

#### 6. **Centralized Error Handling**

Custom `AppError` class provides consistent error responses with meaningful messages and HTTP status codes, making API debugging straightforward.

---

## 🧠 Thinking Behind the Design

### Why Repository + Service Pattern?

**Scalability of Business Logic**: As the system grows (e.g., adding loyalty points, cancellation fees, partial refunds), all changes stay within the service layer. The database access layer remains untouched, and the HTTP layer remains untouched.

**Testability**: We can mock the repository layer in unit tests without spinning up a database, and mock external HTTP calls (Flight Service) in service tests.

### Why Transaction-Based Booking?

In a naive implementation, you might book seats and then call the flight service — but if the flight service call fails, you're left with a **ghost booking** in your database. By wrapping everything in a transaction, we guarantee **all-or-nothing semantics**:

- ✅ Booking created → inventory updated → both succeed together
- ❌ Flight service down → transaction rolls back → no stale data

This is the same principle that banks use for money transfers.

### Why 5-Minute Expiry Instead of Immediate Booking?

Users browse multiple flights before deciding. Holding seats for a **short, reasonable window** reduces friction (users don't lose their selection while checking out) while preventing inventory blocking. This mimics how real-world airline booking systems work (e.g., "Hold your fare for 10 minutes").

### Inter-Service Communication

We chose **synchronous HTTP (Axios)** over message queues for simplicity in this version. The Flight Service is treated as the **source of truth** for seat inventory. A production system could evolve to:

- Add **Redis caching** for flight data to reduce latency
- Use **Kafka/RabbitMQ** for eventual consistency in high-throughput scenarios
- Add **circuit breakers** for resilience when Flight Service is down

---

## 🛠️ Tech Stack

| Layer       | Technology                            |
| ----------- | ------------------------------------- |
| Runtime     | Node.js                               |
| Framework   | Express.js                            |
| Database    | MySQL                                 |
| ORM         | Sequelize (with migrations & seeders) |
| HTTP Client | Axios (inter-service communication)   |
| Logging     | Winston (custom logger per module)    |
| Validation  | Application-level (in service layer)  |
| Dev Runner  | Nodemon                               |
| Linting     | ESLint + Prettier                     |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MySQL
- A running instance of the [Flight Service](https://github.com/codewithharshal) (manages flight inventory)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/codewithharshal/Flight-booking-service.git
cd flight-booking-service

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Create a .env file (or update the existing one):
PORT=3001
FLIGHT_SERVICE=http://localhost:3000

# 4. Run database migrations
npx sequelize-cli db:migrate

# 5. Start the server in development mode
npm run dev
```

### Environment Variables

| Variable         | Description                    | Default                 |
| ---------------- | ------------------------------ | ----------------------- |
| `PORT`           | Server port                    | `3001`                  |
| `FLIGHT_SERVICE` | Base URL of the Flight Service | `http://localhost:3000` |

---

## 📡 API Endpoints

### `POST /api/v1/bookings`

Create a new booking (initiates booking with seat holding).

**Request Body:**

```json
{
  "flightId": 1,
  "userId": 42,
  "noofSeats": 2
}
```

**Response:** Booking object with `INITIATED` status.

### `POST /api/v1/bookings/payments`

Complete payment for an existing booking.

**Request Body:**

```json
{
  "bookingId": 1,
  "userId": 42,
  "totalCost": 540
}
```

**Response:** Success confirmation. Booking status changes to `BOOKED`.

---

## 🗂️ Project Structure

```
src/
├── config/                  # App configuration (dotenv, logger)
│   ├── serverConfig.js      # Port, Flight Service URL
│   └── loggerConfig.js      # Winston logger factory
├── controllers/             # HTTP request handlers
│   ├── booking.controller.js
│   └── server.controller.js
├── errors/                  # Error handling infrastructure
│   ├── AppError.js          # Custom error class
│   └── response/            # Standardized response builders
├── migrations/              # Sequelize DB migrations
├── models/                  # Sequelize models
│   └── booking.js
├── repository/              # Data access layer
│   ├── crud.repository.js   # Generic CRUD base class
│   └── booking.repository.js
├── routes/                  # Express route definitions
│   ├── index.js
│   └── v1/index.js
├── seeders/                 # Database seeders
├── services/                # Business logic layer
│   └── booking.service.js
└── utils/                   # Utility functions & enums
    ├── enums.js             # Booking status, seat type enums
    └── datetime.js          # Date comparison helpers
```

---

## 🧪 Running Tests & Linting

```bash
# Lint code
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Format code
npm run format
```

---

## 🔮 Future Improvements

- [ ] Add **message queue** (RabbitMQ/Kafka) for async inventory updates
- [ ] Implement **cancellation flow** with refund processing
- [ ] Add **API rate limiting** and authentication middleware
- [ ] Introduce **caching layer** (Redis) for flight data
- [ ] Containerize with **Docker** and add **docker-compose** for local dev
- [ ] Add **unit + integration tests** (Jest / Mocha)
- [ ] Implement **circuit breaker pattern** for external service calls
- [ ] Add **health check** and **metrics** endpoints

---

## 👤 Author

**Harshal** — [@codewithharshal](https://github.com/codewithharshal)

---

> **Note:** This service is part of a multi-service airline reservation system. It depends on a **Flight Service** for flight and seat inventory data, which should be running and accessible via the `FLIGHT_SERVICE` environment variable.
