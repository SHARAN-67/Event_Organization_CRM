# Command Center - Frontend Application

A sophisticated React application built with Vite, featuring a dynamic theme system, visual operational pipelines, and a robust security layer.

---

## 🎨 Design System

The application follows a premium, modern aesthetic with high-contrast UI elements.

- **Theme Engine**: Support for *Light*, *Dark*, *Night*, and *Void* modes.
- **Visual Feedback**: Interactive Kanban board with drag-and-drop feedback and transition animations.
- **Production Styles**: All complex components (like the Pipeline) use extracted, performance-optimized CSS files (`.css`) rather than inline styles.

---

## 🔒 Security & Access

Authentication is handled via the `AuthContext` which provides:
- **Global Auth State**: Real-time role and permission tracking.
- **RBAC Enforcement**: Case-insensitive role mapping (`Lead Planner`, `Assistant`, `Admin`).
- **Graceful Timeouts**: 10-second API timeout fallback to prevent UI freezing during slow connections.
- **Session Control**: 30-minute inactivity auto-logout.

---

## 📂 Key Modules

### 🗺️ Event Pipeline
- **Shared Operation**: Real-time visibility of deals across all organizational roles.
- **Audit Logs**: Secure tracking of "Live" stage modifications.
- **Quick Content**: Direct editing of venue, value, and attendee data.

### 📊 Analytics & Reports
- **Insights**: Recharts-powered data visualization.
- **Dossiers**: Management of operational documents with secure download capability.

### ⚙️ Account Management
- **Themes**: Switch between multiple visual protocols.
- **Sync Protocol**: Manually trigger data backups to the cloud database.

---

## 🛠 Project Structure

```text
client/
├── src/
│   ├── components/  # Reusable UI & Logical components
│   ├── context/     # Auth & Theme state providers
│   ├── hooks/       # Custom API & Logic hooks
│   ├── pages/       # Feature-level page components
│   ├── theme/       # Design system tokens & context
│   └── security/    # Security policies & constants
```

---

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure Environment**:
   Create `client/.env` with:
   ```text
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Launch**:
   ```bash
   pnpm run dev
   ```
