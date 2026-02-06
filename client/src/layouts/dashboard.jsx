import { Outlet } from 'react-router-dom';
import Sidebar from '../navigation/Sidebar';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../theme/ThemeToggle';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const { userName } = useAuth();
  // Theme logic is now handled by CSS classes

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <div className="brand-section">
            <h2 className="brand-title">CN</h2>
            <div className="brand-divider" />
            <ThemeToggle />
          </div>

          <div className="header-actions">
            <div className="user-info">
              <div className="user-name">{userName || 'User'}</div>
              <div className="system-status">
                System Status: <span className="status-active">Active</span>
              </div>
            </div>
            <div className="user-avatar">
              {(userName || 'U')[0].toUpperCase()}
            </div>
          </div>
        </header>
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
