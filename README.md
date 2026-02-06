# Event Organization CRM - Command Center

A high-performance, production-ready MERN stack application for coordinating large-scale events, tracking sales pipelines, and managing organizational data with robust synchronization and security.

---

## 🌟 Core Features

### 1. **Visual Kanban Pipeline**
- **Shared View**: Collaborate across all roles (Admin, Lead Planner, Assistant) on the same operational grid.
- **Drag & Drop**: Fluidly move events through stages: *Prospecting* → *Processing* → *Live* → *Completed*.
- **Change Audit Log**: Automatic tracking of all modifications when an event is in the 'Live' stage.
- **Modern UI**: Clean, responsive design with interactive states and production-standard CSS.

### 2. **Hybrid Cloud Synchronization**
- **Dynamic Connection**: Automatically connects to the **Cloud MongoDB (Atlas)** by default.
- **Offline Fallback**: Seamlessly switches to **Local MongoDB** if cloud connection fails.
- **Auto-Sync**: Triggers an automatic backup from Local -> Cloud on successful connection (with activity-exclusion filters).
- **Manual Protocol**: Forced synchronization available via Account Settings for administrative oversight.

### 3. **Role-Based Security (RBAC)**
- **Granular Protection**: Case-insensitive permission matching for **Admin**, **Lead Planner**, and **Assistant** roles.
- **Dynamic Matrix**: Permissions for every module (Sales, Activities, Inventory, Management) are stored in the database and can be updated in real-time.
- **Session Security**: Automatic logout after 30 minutes of inactivity and enforced password changes for new accounts.

### 4. **Reporting & Analytics**
- **Interactive Dashboards**: Data visualization for distribution and performance metrics.
- **Document Management**: Secure storage and retrieval of event dossiers and contracts.
- **Operational Auditing**: Detailed logs for logins, logouts, and data transformations.

---

## 🚀 Navigation Guide

### 📂 Sales Module
- **Leads**: `/sales/leads` - Lead capture and approval workflow.
- **Contacts**: `/sales/contacts` - Unified contact directory.
- **Pipeline**: `/sales/pipeline` - The Kanban Command Center.
- **Documents**: `/sales/documents` - Contractual and operational files.
- **Campaigns**: `/sales/campaigns` - Outreach and marketing tracking.

### 📂 Activities Module
- **Tasks**: `/activities/tasks` - To-do management.
- **Meetings**: `/activities/meetings` - Event calendar and schedules.

### 📂 Inventory & Management
- **Inventory Sub-Hub**: Products, Orders, Invoices, and Vendors.
- **Account Settings**: Theme control, Profile management, and DB Synchronization.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, Recharts, Axios.
- **Backend**: Node.js, Express, Mongoose, JWT, CryptoJS.
- **Database**: MongoDB (Atlas Cloud + Local Community Server).
- **Styling**: Vanilla CSS (Production Extracted), Tailwind (Utility).

---

## 📝 Setup & Deployment

### Environment Variables
Create a `.env` file in the `server` directory and a `.env` file in the `client` directory using the provided `.env.example` templates.

### Running Locally
```bash
# 1. Start Backend
cd server
npm install
npm start

# 2. Start Frontend
cd client
pnpm install
pnpm run dev
```

### Database Seeding
```bash
cd server
node scripts/seedReports.js
```

---

## 🔐 Security Standards
- **Wait Timeout**: Multi-layer loading states with 10-second automatic timeouts to prevent UI freezes.
- **Data Masking**: Sensitive lead data is masked for restricted roles.
- **Input Validation**: Sanitized data entry and server-side model validation.

---

*Developed and Orchestrated by the Project Creator - 2026*
