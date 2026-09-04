# Vendora — System Architecture

## Overview

Vendora is a multi-vendor e-commerce platform implemented as an **Nx monorepo** with three separate frontend portals and a set of backend services responsible for authentication, catalog management, sellers, orders, administration, real-time communication, analytics, recommendations, and logging.

The architecture combines synchronous HTTP communication through an API Gateway, asynchronous event-driven communication through Apache Kafka, real-time communication through WebSockets, Redis for fast-changing state, Prisma for database access, Stripe for marketplace payments, ImageKit for media management, TensorFlow.js for recommendations, Docker for containerization, and GitHub Actions + Docker Hub for CI/CD.

The main architectural goal is to keep user-facing requests responsive while moving analytics, logging, chat persistence, and recommendation-related work into asynchronous workflows where appropriate.

---

# 1. High-Level Architecture

```text
                                    ┌──────────────────────┐
                                    │       Internet       │
                                    └──────────┬───────────┘
                                               │
                                               ▼
                                    ┌──────────────────────┐
                                    │        NGINX         │
                                    │    Reverse Proxy     │
                                    └──────────┬───────────┘
                                               │
                       ┌───────────────────────┼───────────────────────┐
                       │                       │                       │
                       ▼                       ▼                       ▼
              ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
              │    User UI     │      │   Seller UI    │      │    Admin UI    │
              │   Next.js      │      │   Next.js      │      │   Next.js      │
              └───────┬────────┘      └───────┬────────┘      └───────┬────────┘
                      │                       │                       │
                      └───────────────────────┼───────────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────────┐
                                    │     API Gateway      │
                                    │       Express        │
                                    └──────────┬───────────┘
                                               │
              ┌────────────────────────────────┼────────────────────────────────┐
              │                │               │                │                │
              ▼                ▼               ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐
       │    Auth    │   │  Products  │   │   Seller   │   │   Orders   │   │   Admin    │
       │  Service   │   │  Service   │   │  Service   │   │  Service   │   │  Service   │
       └─────┬──────┘   └─────┬──────┘   └─────┬──────┘   └─────┬──────┘   └─────┬──────┘
             │                │                │                │                │
             └────────────────┴────────────────┴────────────────┴────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
                    ▼                         ▼                         ▼
             ┌─────────────┐          ┌───────────────┐          ┌─────────────┐
             │    Kafka    │          │     Redis     │          │  Database   │
             │ Event Bus   │          │ Cache / State │          │ Persistence │
             └──────┬──────┘          └───────────────┘          └─────────────┘
                    │
          ┌─────────┼──────────────────────────────┐
          │         │                              │
          ▼         ▼                              ▼
   ┌────────────┐ ┌──────────────────┐      ┌────────────────┐
   │  Analytics │ │ Recommendation   │      │ Logger Service │
   │ Processing │ │ Service          │      │                │
   └─────┬──────┘ └────────┬─────────┘      └────────────────┘
         │                 │
         │                 ▼
         │          ┌─────────────┐
         │          │ TensorFlow  │
         │          │    Model    │
         │          └─────────────┘
         │
         ▼
   User Behaviour Data
```

---

# 2. Frontend Architecture

Vendora contains three independent frontend applications inside the Nx workspace.

## User UI

The customer-facing marketplace.

Responsibilities include:

- registration and login
- OTP verification
- product discovery
- categories and subcategories
- product details
- cart
- wishlist
- checkout
- order interaction
- personalized recommendations
- customer ↔ seller chat

```text
User Browser
     │
     ▼
User UI
     │
     ├── HTTP ───────────────► API Gateway
     │
     └── WebSocket ──────────► Chatting Service
```

## Seller UI

The seller dashboard.

Responsibilities include seller onboarding, Stripe setup, product creation and management, product media, variants/sizes, category selection, seller orders, and customer communication.

```text
Seller Browser
      │
      ▼
 Seller UI
      │
      ├── HTTP ──────────────► API Gateway
      │
      └── WebSocket ─────────► Chatting Service
```

## Admin UI

The administration portal for user and seller management, banners, logo, platform customization, and operational visibility.

---

# 3. API Gateway

The API Gateway is the central HTTP entry point for the frontend applications.

```text
               ┌───────────────┐
               │ User / Seller │
               │    / Admin    │
               └───────┬───────┘
                       │
                       ▼
                ┌─────────────┐
                │ API Gateway │
                └──────┬──────┘
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
     Auth          Products           Seller
       │
       ├──────────► Orders
       ├──────────► Admin
       └──────────► Other Services
```

The gateway provides a single API boundary so frontend applications do not need to know the internal location of individual backend services.

---

# 4. Backend Services

## Auth Service

Responsible for registration, login, JWT authentication, refresh-token handling, OTP verification, and authentication-related emails.

```text
Register
   │
   ▼
OTP Verification
   │
   ▼
Account Activated
   │
   ▼
Login
   │
   ▼
Access Token + Refresh Token
```

## Products Service

Responsible for the product catalog, product descriptions, categories, subcategories, variants/sizes, retrieval and product-related operations.

Product data is database-backed rather than hard-coded into the frontend.

## Seller Service

Responsible for seller profiles, seller onboarding, seller product operations, seller-related data, seller order interactions, and Stripe seller onboarding.

## Order Service

Responsible for order processing and payment workflows.

```text
Customer
   │
   ▼
Checkout
   │
   ▼
Order Service
   │
   ├──────────────► Stripe
   ├──────────────► Order Persistence
   └──────────────► Platform/Admin Fee
```

## Admin Service

Responsible for platform-level administration: users, sellers, banners, logo, customization, and administrative operations.

---

# 5. Event-Driven Architecture

Kafka is used as the asynchronous communication layer for workloads that do not need to complete inside the original HTTP request.

Examples include:

- product views
- add-to-cart events
- add-to-wishlist events
- chat messages
- application logs
- analytics events

```text
                         ┌──────────────┐
                         │ Application  │
                         └──────┬───────┘
                                │
                                ▼
                           Kafka Topic
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
          Analytics           Chat             Logger
              │                 │                 │
              ▼                 ▼                 ▼
       Recommendation       Persistence       Log Clients
```

This separates synchronous application behavior from background processing.

---

# 6. Analytics Pipeline

User interactions such as product views, adding products to the cart, and adding products to the wishlist can generate events.

```text
User Action
    │
    ▼
Application
    │
    ▼
Kafka
    │
    ▼
Analytics
    │
    ▼
Recommendation Service
    │
    ▼
TensorFlow.js
    │
    ▼
Recommended Products
```

The analytics layer provides behavioral data that can later be used for personalized recommendation logic.

---

# 7. Recommendation Service

The recommendation service uses TensorFlow.js for Node.js. It is separated from the core product service so recommendation logic can evolve independently.

```text
┌───────────────────────────┐
│        User Events        │
│                           │
│  View / Cart / Wishlist   │
└─────────────┬─────────────┘
              │
              ▼
           Kafka
              │
              ▼
         Analytics
              │
              ▼
   Recommendation Service
              │
              ▼
        TensorFlow.js
              │
              ▼
     Recommendation Result
              │
              ▼
           User UI
```

---

# 8. Real-Time Chat Architecture

The chatting service provides real-time customer-to-seller communication and combines WebSockets, Redis, Kafka and Prisma-based persistence.

## Real-Time Delivery

```text
Customer
   │
   │ WebSocket
   ▼
Chatting Service
   │
   ├────────► Receiver WebSocket
   └────────► Sender Echo
```

## Online Presence

Redis is used for short-lived online status.

```text
WebSocket Connected
       │
       ▼
Chatting Service
       │
       ▼
Redis
       │
       ├── online:user:<id>
       └── online:seller:<id>
```

## Unseen Messages

The chat layer maintains unseen-message state and updates the receiver when new messages arrive.

```text
New Message
    │
    ▼
Chatting Service
    │
    ├── Deliver message
    └── Increment unseen count
              │
              ▼
            Redis
```

## Asynchronous Persistence

Incoming chat messages are published to Kafka and persisted by a consumer in batches.

```text
WebSocket Message
       │
       ▼
Chatting Service
       │
       ▼
Kafka
       │
       ▼
chat.new_message
       │
       ▼
Kafka Consumer
       │
       ▼
In-Memory Buffer
       │
       ▼
Batch Flush
       │
       ▼
Prisma createMany()
       │
       ▼
Database
```

The consumer buffers messages for a short interval and writes them in batches instead of issuing one database operation for every message.

---

# 9. Logger Service

The logger service consumes logging events from Kafka.

```text
Application Services
        │
        ▼
      Kafka
        │
        │ topic: logs
        ▼
 Logger Consumer
        │
        ▼
     Log Queue
        │
        ▼
  Batch Processing
        │
        ▼
 WebSocket Clients
```

This allows operational information to be processed independently from the services that generate it.

---

# 10. Redis

Redis is used where low-latency, frequently changing state is more appropriate than durable database persistence.

Current architectural uses include:

- online user/seller presence
- unseen chat message counts
- other short-lived chat-related state

```text
                    ┌──────────────┐
                    │ Chat Service │
                    └──────┬───────┘
                           │
                           ▼
                        Redis
                     ┌─────┴─────┐
                     │           │
                     ▼           ▼
                  Presence   Unseen Counts
```

---

# 11. Database & Prisma

Prisma is used as the data-access layer where applicable.

```text
Service
   │
   ▼
Prisma
   │
   ▼
Database
```

For event-driven workflows, consumers transform incoming Kafka events into database operations. For example, chat persistence uses a buffered consumer and `createMany()`.

---

# 12. Stripe Marketplace Flow

Vendora uses Stripe for payment processing and seller onboarding.

```text
Seller
   │
   ▼
Stripe Seller Account
   │
   ▼
Marketplace
```

During checkout:

```text
Customer
   │
   ▼
Order Service
   │
   ▼
Stripe Payment
   │
   ├────────────► Seller share
   └────────────► Platform/Admin fee
```

This supports a marketplace monetization model based on an automatically calculated platform fee.

---

# 13. ImageKit

ImageKit is used for product and seller image management.

```text
Seller UI
    │
    ▼
Image Upload
    │
    ▼
ImageKit
    │
    ▼
Image URL / Asset
    │
    ▼
Product / Seller Data
```

The application uses image references rather than treating the application filesystem as the primary image store.

---

# 14. Email Architecture

Transactional email templates are implemented with EJS.

Examples include OTP verification, registration-related emails, and order-related notifications.

```text
Application Event
      │
      ▼
Email Generation
      │
      ▼
EJS Template
      │
      ▼
Rendered HTML
      │
      ▼
Email Delivery
```

---

# 15. Authentication Flow

The authentication system combines JWT, refresh tokens and OTP verification.

```text
                    ┌─────────────┐
                    │ Registration│
                    └──────┬──────┘
                           │
                           ▼
                     OTP Verification
                           │
                           ▼
                        Account
                           │
                           ▼
                         Login
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
        Access Token             Refresh Token
              │                         │
              └────────────┬────────────┘
                           ▼
                  Authenticated Requests
```

---

# 16. Request Lifecycle

A typical synchronous request follows:

```text
Browser
   │
   ▼
Nginx
   │
   ▼
Frontend
   │
   ▼
API Gateway
   │
   ▼
Target Backend Service
   │
   ▼
Prisma / Redis / External API
   │
   ▼
Backend Response
   │
   ▼
API Gateway
   │
   ▼
Frontend
```

For asynchronous actions:

```text
Browser
   │
   ▼
Backend Service
   │
   ▼
Kafka
   │
   ▼
Consumer
   │
   ├── Analytics
   ├── Recommendation
   ├── Logging
   └── Persistence
```

---

# 17. Synchronous vs Asynchronous Communication

Vendora intentionally uses both communication styles.

## Synchronous

Used when the user needs an immediate response:

- login
- product retrieval
- seller dashboard requests
- product creation
- checkout validation
- administration actions

```text
Client → API Gateway → Service → Response
```

## Asynchronous

Used when work can happen independently of the immediate request:

- analytics
- logging
- chat persistence
- recommendation-related processing

```text
Service → Kafka → Consumer → Background Processing
```

---

# 18. Container Architecture

Vendora is containerized using Docker and orchestrated locally/for production through Docker Compose.

```text
                    ┌──────────────┐
                    │    NGINX     │
                    └──────┬───────┘
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
          User UI       Seller UI      Admin UI
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                     API Gateway
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
       Backend          Backend          Backend
       Services         Services         Services
          │
          ├─────────► Kafka
          ├─────────► Redis
          └─────────► Database / External APIs
```

Production uses published images from Docker Hub and `docker-compose.prod.yml`.

---

# 19. CI/CD Architecture

GitHub Actions automates build verification and Docker image publishing.

```text
Developer
    │
    ▼
git push → main
    │
    ▼
GitHub Actions
    │
    ├─────────────────────────────┐
    │                             │
    ▼                             ▼
Vendora CI                  Docker Publish
    │                             │
    ▼                             ▼
Install dependencies         Build applications
    │                             │
    ▼                             ▼
Nx verification              Verify dist outputs
    │                             │
    ▼                             ▼
Build applications           Package build artifact
                                  │
                                  ▼
                           Docker Buildx
                                  │
                                  ▼
                              Docker Hub
```

The Docker publish workflow builds and publishes separate images for backend services and frontend applications. Build artifacts are transferred between GitHub Actions jobs before Docker builds begin.

---

# 20. Deployment Flow

```text
GitHub
   │
   ▼
GitHub Actions
   │
   ▼
Docker Hub
   │
   ▼
docker-compose.prod.yml
   │
   ▼
docker compose pull
   │
   ▼
docker compose up -d
   │
   ▼
Running Vendora Stack
```

Typical commands:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
```

---

# 21. Monorepo Structure

```text
apps/
├── admin-service/
├── admin-ui/
├── api-gateway/
├── auth-service/
├── chatting-service/
├── kafka-service/
├── logger-service/
├── order-service/
├── products-service/
├── recommendation-service/
├── seller-service/
├── seller-ui/
└── user-ui/

packages/
├── components/
├── error-handler/
├── libs/
├── middleware/
└── utils/
```

Shared components, middleware, utilities and infrastructure helpers live under `packages`, while deployable applications live under `apps`.

---

# 22. Service Responsibilities

| Component | Primary responsibility | Communication |
|---|---|---|
| User UI | Customer marketplace | HTTP + WebSocket |
| Seller UI | Seller operations | HTTP + WebSocket |
| Admin UI | Administration | HTTP |
| Nginx | Reverse proxy / entry point | HTTP |
| API Gateway | Central API routing | HTTP |
| Auth Service | Authentication / OTP / tokens | HTTP |
| Products Service | Product catalog | HTTP |
| Seller Service | Seller domain | HTTP |
| Order Service | Orders / payments | HTTP + Stripe |
| Admin Service | Platform administration | HTTP |
| Chatting Service | Real-time messaging | WebSocket + Kafka + Redis |
| Recommendation Service | Recommendations | Kafka + TensorFlow.js |
| Logger Service | Log event consumption | Kafka + WebSocket |
| Kafka Service | Kafka integration / event handling | Kafka |
| Redis | Fast state / counters | Redis |
| Database | Durable persistence | Prisma |
| Stripe | Marketplace payments | HTTPS |
| ImageKit | Image storage / delivery | HTTPS |

---

# 23. Architectural Principles

## Separation of Concerns

Each backend service owns a clear business responsibility.

## Centralized API Boundary

Frontend clients communicate through the API Gateway instead of depending directly on internal service locations.

## Event-Driven Background Processing

Kafka is used to move non-blocking workloads away from the request path.

## Fast State vs Durable State

Redis handles low-latency transient state, while the database handles durable persistence.

## Real-Time Delivery vs Persistence

Chat delivery is handled immediately through WebSockets while message persistence can happen asynchronously through Kafka consumers.

## Independent Service Evolution

Recommendation, logging and chat processing can evolve independently from the core synchronous business services.

## Containerized Delivery

The application is packaged as reproducible Docker images and deployed through Docker Compose.

---

# 24. Current Architecture Trade-Offs

The current architecture balances service separation with practical implementation complexity.

Some runtime state is intentionally process-local in the current chat implementation, including connected-client mappings and a short-lived message buffer. This is suitable for a single chat-service instance; horizontally scaling the service would require shared connection/state infrastructure.

A future scaled deployment could look like:

```text
               Load Balancer
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
       Chat 1    Chat 2    Chat 3
          │         │         │
          └─────────┼─────────┘
                    ▼
              Shared Redis
                    │
                    ▼
               Kafka / DB
```

Other production-hardening areas include stronger retry/idempotency guarantees, dead-letter handling, graceful shutdown for buffered consumers, distributed tracing, metrics, and broader automated testing.

---

# 25. Future Evolution

Potential next architectural improvements include:

- horizontal scaling of real-time services
- shared WebSocket state through Redis
- Kafka dead-letter topics
- stronger retry and idempotency guarantees
- distributed tracing
- OpenTelemetry
- Prometheus / Grafana metrics
- centralized structured logs
- automated database migrations
- expanded integration and end-to-end testing
- Kubernetes deployment when operational scale justifies it

---

# 26. Summary

Vendora combines several architectural patterns in one platform:

```text
                    VENDORA
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
    3 Frontends     API Gateway     Admin
        │              │
        │              ▼
        │       Backend Services
        │              │
        │      ┌───────┼────────┐
        │      ▼       ▼        ▼
        │    Kafka   Redis    Database
        │      │
        │      ├── Analytics
        │      ├── Chat Persistence
        │      ├── Logging
        │      └── Recommendations
        │                     │
        │                     ▼
        │                TensorFlow.js
        │
        ├── WebSockets ──► Real-Time Chat
        ├── Stripe ──────► Payments / Platform Fee
        └── ImageKit ────► Media Management

                Docker + Compose
                       │
                 GitHub Actions
                       │
                   Docker Hub
```

The result is a full-stack marketplace architecture that combines traditional request/response APIs with event-driven processing, real-time communication, caching, external payment and media providers, and automated container delivery.
