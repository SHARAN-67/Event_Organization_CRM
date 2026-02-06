# Command Center - Backend API

The backend engine for the Event Organization CRM, built with Node.js, Express, and Mongoose. It handles data persistence, authentication, role-based access control, and hybrid database synchronization.

---

## 🏛 Architecture

### Core Components
- **`index.js`**: Main entry point, establishes dual-database connection logic.
- **`services/SyncService.js`**: The synchronization engine that manages data transfer between Local and Cloud databases.
- **`middleware/authMiddleware.js`**: Case-insensitive JWT validation and dynamic RBAC checks.
- **`models/`**: Mongoose schemas defining the data structure for all modules.

---

## 🔄 Hybrid Synchronization Protocol

The server implements a robust "Cloud-First, Local-Fallback" strategy.

1. **Startup Check**: Attempts to connect to `MONGO_URI_CLOUD`.
2. **Fallback**: If Cloud is unreachable, it connects to `MONGO_URI_LOCAL`.
3. **Auto-Recovery**: When a Cloud connection is established, the `SyncService` is triggered to push local work to the cloud automatically.
4. **Data Integrity**: Uses MongoDB `bulkWrite` with `upsert` for efficient, conflict-free synchronization.

---

## 🔒 API Endpoints

### Authentication `/api/auth`
- `POST /login`: Authenticates user, returns JWT and role details.
- `GET /access-rules`: Fetches the current security matrix for the UI.
- `POST /change-password`: Enforces security updates for new accounts.

### Operational Hub
- **Deals (Pipeline)**: `/api/deals` - Full CRUD with shared visibility logic.
- **Leads**: `/api/leads` - Includes `/public` intake and status workflow.
- **Reports**: `/api/reports` - Management of operational dossiers.
- **Venues**: `/api/venues` - Location and gallery management.

### Admin Tools `/api/admin`
- `POST /sync-db`: Manually triggers a full synchronization (Admin only).
- `GET /users`: Access to the User Vault and personnel management.

---

## 📂 Project Structure

```text
server/
├── models/         # Database Schemas
├── routes/         # API Route Handlers
├── middleware/     # Auth & Permission verification
├── services/       # Sync & Business Logic
├── scripts/        # Database Seeding tools
└── uploads/        # Local storage for documents/images
```

---

## 🧪 Seeding the Database

To populate the system with production-quality sample data:

```bash
node scripts/seedReports.js
```

---

## ⚙️ Environment Configuration

Ensure `server/.env` contains:
- `MONGO_URI_CLOUD`: Connection string for Atlas.
- `MONGO_URI_LOCAL`: Connection string for Local MongoDB.
- `JWT_SECRET`: For secure token signing.
- `PORT`: Defaults to 5000.
