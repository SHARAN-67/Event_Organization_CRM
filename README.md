# Command Center - Architecture & Routing Guide

This document provides a comprehensive overview of the navigation structure, routing logic, and Role-Based Access Control (RBAC) implemented in the Command Center platform.

## 🚀 Navigation Structure

The application uses a dynamic sidebar with collapsible sections and granular permission checks.

### 1. Main Dashboard
- **Home**: `/home` - General overview and metrics.
- **Reports**: `/reports` - Detailed system reports.
- **Analytics**: `/analytics` - Data visualization and insights.
- **My Requests**: `/my-requests` - **(Assistance Role)** Workspace for fulfilling approved leads.

### 2. Sales Module
- **Leads**: `/sales/leads` - Central lead management with Approval/Deny workflow.
- **Contacts**: `/sales/contacts` - Business contact directory.
- **Documents**: `/sales/documents` - Sales-related files and contracts.
- **Campaigns**: `/sales/campaigns` - Marketing and outreach tracking.
- **Pipeline**: `/sales/pipeline` - Visual Kanban/Pipeline view.

### 3. Activities Module
- **Tasks**: `/activities/tasks` - To-do lists and management.
- **Meetings**: `/activities/meetings` - Calendar and schedule.
- **Email**: External link to [Gmail](https://mail.google.com).

### 4. Inventory Module
- **Products**: `/inventory/products` - Catalog management.
- **Orders**: `/inventory/orders` - Transaction tracking.
- **Invoices**: `/inventory/invoices` - Billing and records.
- **Vendors**: `/inventory/vendors` - Supplier management.

### 5. Management
- **Account Settings**: `/profile/settings` - User profile and preferences.
- **Logout**: Triggers session termination and redirects to `/auth/login`.

---

## 🔒 Routing & Security

### Public Routes (No Auth Required)
- **Login**: `/auth/login` - System entry point.
- **Public Lead Capture**: `/inquiry` - High-end form for external customers/ads to submit leads directly into the system.

### Internal Route Logic (`App.jsx`)
- All internal routes are wrapped in a `DashboardLayout` which provides the Sidebar and Header.
- **Protected Routes**: Most features are wrapped in `<ProtectedRoute />` which checks for valid authentication and feature-level access.
- **Granular RBAC**: The `/sales/leads` route uses deeper logic via the `AccessControlContext` to enable/disable specific UI actions (Approve, Edit, Delete) based on permission keys.

---

## 🎭 Role-Based Access Control (RBAC)

Permissions are defined in `client/src/security/policy.js` and enforced both on the Frontend (UI mounting) and Backend (API Middleware).

| Role | Access Level | Key Capabilities |
| :--- | :--- | :--- |
| **Admin** | Full Access | Complete power over all modules and data deletion. |
| **Lead Planner**| Manage | Can Approve/Deny new leads, create/edit records. |
| **Assistant** | Fulfillment | "My Requests" access, can process Approved leads, data is masked in Leads view. |

### Lead Workflow Logic
1. **Inquiry (Public)**: Customer fills form at `/inquiry`.
2. **Approval (Planner/Admin)**: Lead appears as `New`. Admin clicks ✅ (Approve) or ❌ (Deny).
3. **Fulfillment (Assistant)**: Approved leads move to "My Requests". Assistant moves them from `Approved` -> `Processing` -> `Completed`.

---

## 🛠 Backend API Routes

- **Auth**: `/api/auth`
- **Leads**: `/api/leads`
  - `POST /public`: Public lead intake.
  - `PATCH /:id/status`: Workflow transition logic.
- **Contacts**: `/api/contacts`
- **Tasks**: `/api/tasks`
- **Inventory**: `/api/products`, `/api/orders`, `/api/invoices`
- **Reports**: `/api/reports`
  - `GET /`: Fetch all operational reports.
  - `POST /`: Initialize a new report (Admin only).
  - `PUT /:id`: Update any field in an existing report (Admin only).
  - `DELETE /:id`: Decommission a report (Admin only).
  - `GET /download/:id`: Securely download attached dossier file.

---

## 🕵️‍♂️ Secret Analytics Engine

The system contains a hidden analytics and manual-entry system for high-level event auditing.

### Hidden Frontend Routes
- **Hidden Manual Entry**: `/admin/secret-manual-entry` (Unlinked, requires manual URL navigation)

### Protected API Endpoints (`/api/secret`)
All endpoints in this router require a custom security header for validation.
- **Header**: `X-ANTIGRAVITY-SECRET-KEY: antigravity-secret-2026`
- **Behavior**: Returns `404 Not Found` if the header is missing or invalid (Security through Obscurity).

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/summary` | GET | Returns big-number metrics and all analytics records. |
| `/data` | GET | Returns sorted raw analytics data. |
| `/manual-entry`| POST | Injects new event performance data into the database. |
