<div align="center">

<img src="public/IMG_20260420_095352_613.png" alt="Vira Logo" width="120" height="120" style="border-radius: 24px;" />

# 🚛 Vira Transport Management System

**A modern, full-featured transport & logistics management platform**  
Built with Next.js 15 · Laravel API · RTL/Persian UI

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Laravel](https://img.shields.io/badge/Laravel-API-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![React Query](https://img.shields.io/badge/React_Query-v5-FF4154?style=for-the-badge&logo=reactquery)](https://tanstack.com/query)

</div>

---

## ✨ Overview

**Vira TMS** is a comprehensive Transport Management System designed for logistics and repair shop operations. It provides a unified dashboard to manage drivers, vehicles (mechanisms), warehouses, financial statements, work orders, and more — all in a beautifully crafted Persian (RTL) interface with full dark mode support.

---

## 🎨 Design System

Vira uses a custom CSS variable-based design system for consistent theming across light and dark modes:

| Token | Light | Dark |
|---|---|---|
| `--primary` | `#544ccf` | `#7c72e0` |
| `--bg` | `#f8fafc` | `#0d1117` |
| `--surface` | `#ffffff` | `#161b22` |
| `--surface-2` | `#f1f5f9` | `#1e2733` |
| `--border` | `#e2e8f0` | `#2a3444` |
| `--text` | `#1e293b` | `#e2e8f0` |

> Full design token reference in `app/globals.css`

---

## 🗂️ Module Overview

### 🔧 Repair Shop Operations
| Module | Description |
|---|---|
| **TM Codes** | Manage repair/maintenance codes (CM, PM, EM types) |
| **Repair Requests** | Track and manage vehicle repair work orders |
| **Repairmen** | Technician profiles, contracts, and assignments |
| **PM Groups** | Preventive maintenance group configuration |
| **Waybills** | Transport waybill management |

### 💰 Financial Management
| Module | Description |
|---|---|
| **Shops** | Repair shop registry and configuration |
| **Final Statements** | Monthly/periodic financial statements |
| **Statement Factors** | Invoices tied to final statements |
| **Account Sides** | Bank accounts and financial counterparts |

### 📦 Warehouse
| Module | Description |
|---|---|
| **Products** | Inventory items with stock tracking |
| **Storehouses** | Warehouse locations and management |
| **Storehouse Users** | Access control per warehouse |
| **Units** | Units of measurement |
| **Customers** | Customer registry (natural & legal persons) |
| **Factors** | Warehouse invoices with confirm/cancel flow |
| **Requests** | Inbound/outbound warehouse requests |
| **Transfers** | Inter-warehouse stock transfers |
| **Imports/Exports** | Goods entry and exit records |

### 🚛 Transport
| Module | Description |
|---|---|
| **Drivers** | Driver profiles, licenses, and contracts |
| **Mechanisms** | Vehicle registry (trucks, pickups, tractors, etc.) |
| **Mechanism Groups** | Vehicle classification and grouping |
| **Owners** | Vehicle and asset ownership records |

### ⚙️ System Administration
| Module | Description |
|---|---|
| **Roles** | Role-based access control (RBAC) |
| **Permissions** | Permission list with one-click server sync |
| **Tickets** | Internal support ticketing system |

---

## 🏗️ Architecture

```
app/
├── config/
│   └── env.js              # Centralized API endpoints + getHeaders()
├── components/
│   ├── DataTable/          # Universal data table with filters & pagination
│   ├── Sidebar/            # Collapsible navigation with flyout menus
│   └── SplashScreen/       # Post-login animated splash
├── login/
│   ├── page.js
│   ├── _hooks/useLogin.js  # Auth logic, token storage, saved credentials
│   └── _components/        # LoginForm, ForgotForm
├── dashboard/
├── [module]/
│   ├── page.js             # Render only — imports hook + components
│   ├── _hooks/             # Data fetching, mutations, state
│   └── _components/        # Columns, stats, sub-components
└── globals.css             # Design system tokens + SweetAlert2 dark mode
```

### Key Patterns

- **Layered architecture**: `page.js` (render) → `_hooks/` (logic) → `_components/` (UI)
- **Token auth**: JWT stored in cookie, auto-injected via `getHeaders()`
- **Infinite scroll**: `useInfiniteQuery` with IntersectionObserver
- **Optimistic UI**: React Query mutations with automatic cache invalidation

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Backend API running at `https://viratest2.ir` (or configure via env)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/vira-tms.git
cd vira-tms

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local:
# NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
# NEXT_PUBLIC_APP_NAME=سامانه ویرا

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

---

## 🔐 Authentication Flow

```
Login Page
  │
  ├── POST /api/v1/auth/login
  │     body: { credential, password }
  │
  ├── Response: { data: { token, user } }
  │
  ├── Token → cookie (token=...; SameSite=Lax)
  ├── User info → localStorage['vira-user']
  ├── Saved credentials → localStorage['vira-saved-credentials']
  │
  └── SplashScreen → /dashboard
```

All subsequent API calls include:
```
Authorization: Bearer <token>
```
via the centralized `getHeaders()` function in `app/config/env.js`.

---

## 🧩 DataTable Component

The universal `DataTable` component supports:

- ✅ **Text search** — minimum 2 characters + ✓ confirm button
- ✅ **Select filter** — dropdown with ✓ confirm before applying
- ✅ **Active filters popup** — view and remove individual filters
- ✅ **Animated record counter** — live count with filter state
- ✅ **Infinite scroll** compatible (`disablePagination` prop)
- ✅ **Standard pagination** with page size selector

```jsx
<DataTable
  data={allData}
  columns={columns}
  loading={isLoading}
  emptyMessage="No records found"
  disablePagination={true}
/>
```

---

## 🌙 Dark Mode

Dark mode is controlled via `data-theme="dark"` on the `<html>` element, stored in `localStorage`. The entire design system switches via CSS variables — no class-name juggling.

SweetAlert2, React Select, and all custom components fully support both themes.

---

## 📁 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `https://viratest2.ir` | Backend API base URL |
| `NEXT_PUBLIC_APP_NAME` | `سامانه ویرا` | App display name |
| `NEXT_PUBLIC_APP_VERSION` | `1.0.0` | Version shown in sidebar |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Frontend base URL |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS + Custom CSS Variables |
| Data Fetching | TanStack React Query v5 |
| Animations | Framer Motion |
| Icons | Font Awesome 6 |
| Alerts | SweetAlert2 (dark mode patched) |
| Select Inputs | React Select (theme-aware) |
| Auth | Laravel Sanctum (token-based) |

---

## 📄 License

This project is proprietary software developed for Vira Transport Company.  
© 2026 Vira TMS. All rights reserved.

---

<div align="center">
  <sub>Built with ❤️ for Vira Transport · <strong>سامانه مدیریت حمل و نقل ویرا</strong></sub>
</div>