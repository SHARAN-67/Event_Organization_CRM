import { Outlet } from 'react-router-dom';
import Sidebar from '../navigation/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import ThemeToggle from '../theme/ThemeToggle';

export default function DashboardLayout() {
  const { userName } = useAuth();
  const { theme } = useTheme();

  const isDark = theme === 'dark' || theme === 'night';
  const bgColor = theme === 'light' ? '#f8fafc' : theme === 'dark' ? '#0f172a' : '#020617';
  const headerBg = theme === 'light' ? '#ffffff' : theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(2, 6, 23, 0.8)';
  const textColor = isDark ? '#f1f5f9' : '#0f172a';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9';

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: bgColor, color: textColor, transition: 'all 0.5s ease' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          padding: '16px 40px',
          background: headerBg,
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.5s ease',
          zIndex: 50
        }}>
          <div className="flex items-center gap-4">
            <h2 style={{ margin: 0, fontWeight: 900, color: theme === 'night' ? '#10b981' : textColor }}>CN</h2>
            <div className="h-6 w-[1px] bg-white/10" />
            <ThemeToggle />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: textColor }}>{userName || 'User'}</div>
              <div style={{ fontSize: '10px', color: isDark ? '#64748b' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}>
                System Status: <span style={{ color: '#10b981' }}>Active</span>
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              background: theme === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${borderColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              color: '#3b82f6',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              {(userName || 'U')[0].toUpperCase()}
            </div>
          </div>
        </header>
        <main style={{ flex: 1, padding: '24px', overflow: 'auto', scrollBehavior: 'smooth' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
