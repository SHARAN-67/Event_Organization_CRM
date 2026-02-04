import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Mail,
  Kanban,
  Contact,
  FileText,
  Receipt,
  UserPlus,
  User,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  FolderCheck,
  Home as LucideHome,
  ChartPie,
  NotepadText,
  ListTodo,
  LogOut,
  Lock
} from 'lucide-react';

const Sidebar = () => {
  const [expanded, setExpanded] = useState({ activities: true, sales: true, inventory: true });
  const [dbStatus, setDbStatus] = useState('Connecting...');
  const { hasPermission, userRole, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/status');
        setDbStatus(response.data.dbStatus || 'Connected');
      } catch (error) {
        setDbStatus('Offline');
      }
    };
    fetchStatus();
    // Refresh status every 5 minutes
    const interval = setInterval(fetchStatus, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const toggleExpand = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNavigation = (path, isExternal = false) => {
    if (isExternal) {
      window.open(path, '_blank');
    } else {
      navigate(path);
    }
  };

  const menuItems = [
    {
      section: 'Command Center',
      items: [
        {
          label: 'Home',
          icon: <LucideHome size={20} />,
          id: 'home',
          path: '/home',
        },
        {
          label: 'Reports',
          icon: <ChartPie size={20} />,
          id: 'reports',
          path: '/reports',
        },
        {
          label: 'Analytics',
          icon: <ChartPie size={20} />,
          id: 'analytics',
          path: '/analytics',
        },
        {
          label: 'My Requests',
          icon: <NotepadText size={20} />,
          id: 'my-requests',
          path: '/my-requests',
        },
        {
          label: 'Sales',
          icon: <FolderCheck size={20} />,
          id: 'sales',
          subItems: [
            { label: 'Leads', icon: <FolderCheck size={20} />, path: '/sales/leads' },
            { label: 'Contacts', icon: <Contact size={20} />, path: '/sales/contacts' },
            { label: 'Documents', icon: <FileText size={20} />, path: '/sales/documents' },
            { label: 'Campaigns', icon: <MessageSquare size={20} />, path: '/sales/campaigns' },
            { label: 'Pipeline', icon: <Kanban size={20} />, path: '/sales/pipeline' }
          ]
        },
        {
          label: 'Activities',
          icon: <FolderCheck size={20} />,
          id: 'activities',
          subItems: [
            { label: 'Tasks', icon: <ListTodo size={20} />, path: '/activities/tasks' },
            { label: 'Meetings', icon: <Calendar size={20} />, path: '/activities/meetings' },
            { label: 'Email', icon: <Mail size={20} />, path: 'https://mail.google.com', isExternal: true }
          ]
        },
        {
          label: 'Inventory',
          icon: <FolderCheck size={20} />,
          id: 'inventory',
          subItems: [
            { label: 'Products', icon: <FolderCheck size={20} />, path: '/inventory/products' },

            { label: 'Orders', icon: <ListTodo size={20} />, path: '/inventory/orders' },
            { label: 'Invoices', icon: <Receipt size={20} />, path: '/inventory/invoices' },
            { label: 'Vendors', icon: <UserPlus size={20} />, path: '/inventory/vendors' }
          ]
        },
      ]
    },
    {
      section: 'Management',
      items: [
        {
          label: 'Account Settings',
          icon: <User size={20} />,
          id: 'account-settings',
          path: '/profile/settings',
        },
        userRole === 'Admin' && {
          label: 'Security Vault',
          icon: <Lock size={20} />,
          id: 'security-vault',
          path: '/profile/settings?tab=Credential Vault', // Deep link if I implementation supports it, or just use settings
          onClick: () => navigate('/profile/settings?tab=Credential Vault')
        },
        {
          label: 'Logout',
          icon: <LogOut size={20} />,
          id: 'logout',
          onClick: handleLogout
        },
      ]
    }
  ];

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="logo-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="logo-icon"></div>
          <h2 className="brand-name">CN</h2>
        </div>
        <button className="collapse-btn">
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="sidebar-content">
        <hr className='sidebar-divider' />

        {menuItems.map((section, idx) => (
          <div key={idx}>
            <div className="section-label">{section.section}</div>
            {section.items.filter(Boolean).map((item, itemIdx) => {
              // Special case for Logout: it is always visible
              const isLogout = item.id === 'logout';

              // For parent menu items with subItems, check if user has access to ANY sub-item
              let canRead = isLogout;
              if (!isLogout) {
                if (item.subItems && item.subItems.length > 0) {
                  // Show parent if user can access at least one sub-item
                  canRead = item.subItems.some(sub => hasPermission(sub.label, 'Read'));
                } else {
                  // For regular items, check permission directly
                  canRead = hasPermission(item.label, 'Read');
                }
              }

              if (!canRead && userRole !== 'Admin') return null;

              return (
                <div key={itemIdx}>
                  <div
                    className={`nav-item ${(item.path && (location.pathname === item.path || (location.pathname + location.search) === item.path)) || (item.path === '/home' && location.pathname === '/') ? 'active' : ''}`}
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick();
                      } else if (item.subItems) {
                        item.id && toggleExpand(item.id);
                      } else if (item.path) {
                        handleNavigation(item.path, item.isExternal);
                      }
                    }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text">{item.label}</span>

                    {item.badge && item.badge.type === 'number' && (
                      <span className="badge-number" style={{ backgroundColor: item.badge.color }}>
                        {item.badge.text}
                      </span>
                    )}

                    {item.badge && item.badge.type === 'dot' && (
                      <span className="badge-dot" style={{ backgroundColor: item.badge.color }}></span>
                    )}

                    {(item.subItems || item.hasSub) && (
                      <span className="chevron-icon">
                        {item.id && expanded[item.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    )}
                  </div>

                  {item.subItems && expanded[item.id] && (
                    <div className="sub-menu">
                      {item.subItems.map((sub, subIdx) => {
                        const canRead = hasPermission(sub.label, 'Read');

                        if (!canRead && userRole !== 'Admin') return null; // Hide restricted items for non-admins

                        return (
                          <div
                            key={subIdx}
                            className={`sub-item ${location.pathname === sub.path ? 'active' : ''}`}
                            onClick={() => canRead && sub.path && handleNavigation(sub.path, sub.isExternal)}
                          >
                            <span className="sub-icon" style={{ opacity: 0.7 }}>{sub.icon}</span>
                            <span className="sub-text">{sub.label}</span>
                            {!canRead && <Lock size={12} style={{ marginLeft: 'auto', color: '#ef4444' }} />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Database Status Indicator */}
      <div className="db-status-section">
        <div className="db-status-item">
          <div className={`status-dot ${dbStatus.includes('Online') ? 'online' : dbStatus.includes('Local') ? 'local' : 'offline'}`}></div>
          <span className="db-status-text">DB: {dbStatus}</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;