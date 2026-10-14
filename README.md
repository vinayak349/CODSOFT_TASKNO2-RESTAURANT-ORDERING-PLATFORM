# DineDesk — Full-Stack Restaurant Ordering & Table Management Platform

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.0-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3.0-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.19-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest_3.0-FCC72B?style=flat&logo=vitest)](https://vitest.dev/)

> **DineDesk** is an enterprise-grade, production-minded digital dining platform designed to modernize restaurant operations. It unifies customer digital ordering, table reservation conflict prevention, live kitchen display system (KDS), and administrative oversight into a cohesive, responsive web platform.

---

## 1. Executive Summary & Purpose

Traditional restaurants frequently grapple with fragmented order pads, telephone reservations, paper tickets lost in the kitchen rush, and inaccurate billing. **DineDesk** centralizes the end-to-end dining lifecycle:
- **For Diners:** Explore rich digital menus, customize dine-in/pickup/delivery orders, book tables with real-time slot verification, and monitor orders with live status tracking.
- **For Kitchen Staff:** Process orders through an interactive Kitchen Display System (KDS) Kanban board with audible cues, ticket printing, and prep timers.
- **For Restaurant Administrators:** Manage menus, categories, tables, staff roles, operating hours, and monitor live sales analytics and top-selling dishes.

---

## 2. Core Platform Features

### 🍽️ Digital Menu & Ordering
- **Database-Backed Menu:** Curated categories (Starters, Signature Mains, Tandoori Grills, Breads & Biryanis, Desserts, Beverages) with high-definition imagery and descriptions.
- **Dietary & Special Tags:** Filter by Vegetarian (`Veg`), Non-Vegetarian (`Non-Veg`), Vegan, or `Chef Special`.
- **Search & Sort:** Instant client-side search and sorting (Price low-to-high, high-to-low, name A-Z).
- **Preparation Times & Live Availability:** Automatic warnings and order prevention for sold-out items.

### 🛒 Shopping Cart & Server-Side Checkout
- **Quantity Adjustments & Subtotals:** Dynamic client cart state with local persistence.
- **Server Recalculation:** Absolute protection against client manipulation — prices, 5% GST taxes, delivery fees, and order totals are recalculated exclusively on the server.
- **Multiple Fulfillment Types:**
  - `DINE_IN`: Table number assignment and dine-in instructions.
  - `PICKUP`: Direct counter pickup.
  - `DELIVERY`: Verified home delivery with dynamic delivery fee computation.
- **Idempotency Protection:** Generates unique idempotency tokens per submission to prevent duplicate charges or double orders on network retry.

### 📊 Live Order Tracking & Lifecycle State Machine
- **Strict State Transitions:**
  `PLACED` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `READY` ➔ `COMPLETED`
  *(Exception states: `CANCELLED`, `REJECTED`, `PAYMENT_FAILED`, `REFUNDED`)*
- **Live Status Stepper:** Polling mechanism refreshes customer order tracking every 5 seconds without manual page reloads.
- **Customer Cancellation Rules:** Customers can cancel unconfirmed orders; once food preparation begins (`PREPARING`), cancellations are restricted.

### 👨‍🍳 Dedicated Kitchen Display System (KDS)
- **Kanban Board:** Segregates orders across *New Placed*, *In Preparation*, and *Ready on Pass*.
- **Order Cards:** Displays elapsed cooking timers, special allergy notes, fulfillment mode, and action buttons (*Accept*, *Start Cooking*, *Mark Ready*, *Fulfill*).
- **Physical Ticket View:** Formatted thermal printer ticket view accessible at `/kitchen/orders/[id]`.

### 🪑 Table Reservation & Overlap Prevention Engine
- **Conflict Prevention Algorithm:** Prevents overlapping confirmed reservations for the same table within the restaurant's booking buffer (default 90 mins).
- **Operating Hours Enforcement:** Validates that reservations only fall within restaurant operating hours (11:00 AM – 11:00 PM).
- **Capacity Matching:** Ensures assigned tables satisfy minimum guest party size.
- **Dining Zones:** Main Dining, Garden Patio, Balcony Deck, and VIP Private Salon.

### 💳 Safe Payment Workflow
- **Multi-Provider Architecture:** Supports *Test Online Gateway Sandbox* (HMAC signed session with verification) and *Cash on Delivery / Pickup / Dine-in*.
- **No Card Data Stored:** Strictly complies with PCI-DSS guidelines by delegating card data handling and storing only provider transaction references.

### 👑 Comprehensive Administrative Dashboard
- **Executive Analytics:** Live counters for Total Revenue, Today's Sales, Active Kitchen Orders, and Pending Reservations.
- **Top Dishes Ranking:** Automatic volume calculation of top revenue-generating menu items.
- **CRUD Operations:** Menu items, categories, dining tables, and restaurant parameters.
- **Role-Based User Management:** Administrators can promote staff to `KITCHEN` or `ADMIN` roles.

---

## 3. Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server & Client Components) |
| **UI Library** | [React 19](https://react.dev/), [TypeScript 5.9](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with custom warm culinary color tokens |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **State & Context** | React Context API (`CartContext`, `AuthContext`) |
| **Backend API** | Next.js Route Handlers (`src/app/api/*`) with isolated Service Layer |
| **Database & ORM** | [PostgreSQL 16](https://www.postgresql.org/) & [Prisma ORM 6.19](https://www.prisma.io/) |
| **Database Fallback** | In-memory resilient state store (`src/lib/db-store.ts`) for zero-dependency local runs |
| **Authentication & RBAC** | [Jose](https://github.com/panva/jose) (HS256 JWT in `httpOnly` secure cookies) & [bcryptjs](https://www.npmjs.com/package/bcryptjs) |
| **Validation** | [Zod 4](https://zod.dev/) schemas |
| **Testing** | [Vitest 3](https://vitest.dev/) unit and integration test runner |
| **Containerization** | Docker, Docker Compose multi-stage production builds |

---

## 4. Application Architecture

```
dinedesk/
├── docker-compose.yml         # Local PostgreSQL container configuration
├── Dockerfile                 # Multi-stage production container
├── prisma/
│   ├── schema.prisma          # PostgreSQL relational data schema & indexes
│   └── seed.ts                # Production database seed script
├── src/
│   ├── app/
│   │   ├── (public)/          # /, /menu, /cart, /checkout, /reservations, /about, /contact
│   │   ├── (auth)/            # /login, /register
│   │   ├── account/           # /account, /account/orders, /account/reservations
│   │   ├── kitchen/           # /kitchen KDS Kanban board & ticket viewer
│   │   ├── admin/             # /admin (overview, menu, categories, orders, tables, users, settings)
│   │   ├── api/               # Server-side Route Handlers for orders, menu, auth, payments, etc.
│   │   ├── layout.tsx         # Root layout with Auth & Cart providers, Navbar, and Footer
│   │   └── globals.css        # Tailwind v4 styles and warm palette tokens
│   ├── components/
│   │   ├── layout/            # Navbar, Footer, AdminNav
│   │   ├── menu/              # FoodCard, ItemDetailClient
│   │   └── ui/                # StatusBadge
│   ├── context/
│   │   ├── AuthContext.tsx    # Session management & user state
│   │   └── CartContext.tsx    # Shopping cart items, subtotals, and persistence
│   ├── lib/
│   │   ├── auth.ts            # JWT signing, cookie verification, requireAuth, requireRole
│   │   ├── prisma.ts          # Singleton Prisma Client instance
│   │   ├── db-store.ts        # Offline fallback database store & mock state
│   │   └── validation/        # Zod input schemas
│   └── services/              # Business logic modules
│       ├── user.service.ts
│       ├── menu.service.ts
│       ├── order.service.ts
│       ├── reservation.service.ts
│       ├── payment.service.ts
│       └── analytics.service.ts
└── tests/
    └── unit/
        └── order-and-calculations.test.ts # Vitest automated test suite
```

---

## 5. Prerequisites

- **Node.js**: v18.18.0 or newer (Tested on Node v20 and v24)
- **Package Manager**: npm v9+ (or pnpm/yarn)
- **Optional**: Docker & Docker Compose (for running local PostgreSQL container)

---

## 6. Installation & Quick Start

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/dinedesk.git
cd dinedesk
```

### Step 2: Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Step 3: Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Default `.env` configuration:
```dotenv
DATABASE_URL="postgresql://dinedesk_user:dinedesk_password@localhost:5432/dinedesk_db?schema=public"
AUTH_SECRET="dinedesk-dev-secret-key-replace-in-production-32chars"
APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
RESTAURANT_TIMEZONE="Asia/Kolkata"
PAYMENT_PROVIDER="test"
```

### Step 4 (Optional): Start PostgreSQL with Docker
If you have Docker installed, start PostgreSQL with one command:
```bash
docker compose up -d
```

### Step 5: Generate Prisma Client & Run Migrations
```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```
*(Note: If running without Docker/PostgreSQL, DineDesk automatically utilizes its built-in in-memory fallback store pre-populated with dishes, categories, tables, and demo accounts!)*

### Step 6: Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 7. Demo Accounts & Role Credentials

You can sign in using one of the pre-configured accounts or use the **Quick One-Click Sign-In** buttons on `/login`:

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Customer** | `customer@dinedesk.com` | `Customer@12345` | Menu, Cart, Checkout, Order Tracking, Reservations, Account |
| **Kitchen Staff** | `chef@dinedesk.com` | `Kitchen@12345` | Kitchen Display System (`/kitchen`), Order status updating, Tickets |
| **Administrator** | `admin@dinedesk.com` | `Admin@12345` | Executive Dashboard (`/admin`), Menu CRUD, Tables, Orders, Staff Roles, Settings |

---

## 8. Test Commands & Validation

Run the Vitest test suite to verify pricing calculations, GST tax computation, order lifecycle transitions, and reservation double-booking prevention:
```bash
npm test
```
To run tests with code coverage or in watch mode:
```bash
npx vitest
```

To run TypeScript type checks and production bundle builds:
```bash
npm run build
```

---

## 9. API Documentation Overview

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Registers customer (enforces role `CUSTOMER`).
- `POST /api/auth/login` — Authenticates email & password, sets `dinedesk_session` cookie.
- `POST /api/auth/logout` — Clears authentication cookie.
- `GET /api/auth/me` — Fetches current authenticated session user.

### 🍛 Menu & Categories (`/api/menu`)
- `GET /api/menu` — Fetches items with search query, category slug, dietary filter, and sort options.
- `GET /api/menu/categories` — Returns list of culinary categories.
- `GET /api/menu/[slug]` — Retrieves full details of a specific dish.
- `POST /api/admin/menu` — Creates a new menu item *(Admin only)*.
- `PATCH /api/admin/menu/[id]` — Updates menu item details or toggles availability *(Admin only)*.
- `DELETE /api/admin/menu/[id]` — Removes menu item *(Admin only)*.

### 📦 Orders (`/api/orders`)
- `POST /api/orders` — Submits order with server-side price verification and idempotency check.
- `GET /api/orders` — Returns order history (customer sees own; staff/admin sees all).
- `GET /api/orders/[id]` — Retrieves single order tracking ticket.
- `PATCH /api/orders/[id]/status` — Advances lifecycle status (`CONFIRMED`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED`).

### 📅 Table Reservations (`/api/reservations`)
- `POST /api/reservations` — Submits booking with overlap check and capacity matching.
- `GET /api/reservations` — Lists reservations.
- `PATCH /api/reservations/[id]` — Confirms reservation with table assignment or updates status.
- `GET /api/reservations/tables` — Returns configured dining tables and capacities.
- `POST /api/reservations/tables` — Creates new table *(Admin only)*.

### 💳 Payments (`/api/payments`)
- `POST /api/payments/create-session` — Generates test payment session URL and reference.
- `POST /api/payments/verify` — Validates provider reference and completes order payment status.

### 📈 Administration & Settings (`/api/admin`)
- `GET /api/admin/stats` — Returns KPIs: total revenue, today's sales, active orders, top dishes.
- `GET /api/admin/users` — Lists all registered accounts.
- `PATCH /api/admin/users/[id]/role` — Updates user role (`CUSTOMER`, `KITCHEN`, `ADMIN`).
- `GET /api/admin/settings` & `PATCH /api/admin/settings` — Retrieves or updates restaurant parameters.

---

## 10. Security & Hardening Measures

- **JWT Session Protection:** Signed using HS256 algorithm with `AUTH_SECRET`, stored in `httpOnly`, `sameSite: 'lax'` secure cookies.
- **Server-Side Authorization:** Every protected route handler and service verifies user role on the server; UI visibility toggles are never treated as security boundaries.
- **Password Hashing:** Passwords hashed with bcrypt (salt rounds: 10).
- **Client-Side Tampering Prevention:** Order totals and line prices submitted from the browser are discarded; the server recalculates totals strictly from database records.
- **Idempotency Protection:** Prevents duplicate payments and double order placement during network timeouts or double submissions.
- **Double-Booking Shield:** Strict time overlap checking algorithms prevent conflicting bookings on the same physical table.

---

## 11. Production Deployment Guide

### Option A: Vercel Deployment
1. Push repository to GitHub.
2. Import project in Vercel.
3. Configure environment variables in Vercel project settings:
   - `DATABASE_URL` (e.g. from Supabase or Neon PostgreSQL)
   - `AUTH_SECRET` (generate using `openssl rand -base64 32`)
   - `APP_URL` (your production Vercel domain)
4. Deploy! Vercel automatically runs `prisma generate` and `next build`.

### Option B: Docker Container Deployment
```bash
# Build production Docker image
docker build -t dinedesk:latest .

# Run container on port 3000
docker run -p 3000:3000 --env-file .env dinedesk:latest
```

---

## 12. License & Acknowledgments

This project is licensed under the MIT License. Developed as a modern culinary management platform adhering to industry best practices in full-stack architecture, clean code, and user experience.
