import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    User, Shield, Users, Building, Lock, Unlock,
    Save, Plus, Trash2, Mail, Phone, Briefcase,
    Globe, DollarSign, ShieldCheck, Edit, Settings,
    Activity, RefreshCw, FileText, XCircle, ToggleLeft, ToggleRight,
    Download, LogIn, LogOut, Clock, Key as KeyIcon, Cloud, Database
} from 'lucide-react';
import AccessControl from '../access/AccessControl';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import UserVault from '../admin/UserVault';

const API_URL = 'http://localhost:5000/api/auth';

const AccountSettings = () => {
    const [activeTab, setActiveTab] = useState('Identity');
    const [isLocked, setIsLocked] = useState(false);
    const location = useLocation();

    // Deep linking for tabs
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) setActiveTab(tab);
    }, [location.search]);
    const [lockSetup, setLockSetup] = useState({ password: '', confirmPassword: '' });
    const [unlockPassword, setUnlockPassword] = useState('');
    const [isLockPasswordSet, setIsLockPasswordSet] = useState(false);

    // --- AUTH STATE ---
    const [currentUser, setCurrentUser] = useState({
        id: localStorage.getItem('userId') || 'mock_id',
        name: localStorage.getItem('userName') || 'Admin User',
        role: localStorage.getItem('userRole') || 'Admin',
        email: localStorage.getItem('userEmail') || 'admin@cnevents.com',
        token: localStorage.getItem('token') || ''
    });

    const { hasPermission, userRole: currentUserRole, updateUser } = useAuth();
    const { theme } = useTheme();

    // Theme Variables
    const isDark = theme === 'dark' || theme === 'night';
    const bgColor = theme === 'light' ? '#f8fafc' : theme === 'dark' ? '#0f172a' : '#020617';
    const cardBg = theme === 'light' ? '#ffffff' : theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(15, 23, 42, 0.5)';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const subTextColor = isDark ? '#94a3b8' : '#64748b';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0';

    const canWriteAccount = hasPermission('Account Settings', 'Write');
    const canReadTeam = hasPermission('Team', 'Read');
    const canWriteTeam = hasPermission('Team', 'Write');
    const canDeleteTeam = hasPermission('Team', 'Delete');
    const canReadSettings = hasPermission('Settings', 'Read');
    const canWriteSettings = hasPermission('Settings', 'Write');
    const canReadSecurity = hasPermission('Security Matrix', 'Read');
    const canReadLogs = hasPermission('Audit Logs', 'Read');

    // Legacy fallback for simple Admin checks if needed, but we'll use permissions mostly
    const isAdmin = currentUserRole && currentUserRole.toLowerCase() === 'admin';
    const isAssistant = currentUserRole === 'Assistant';

    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    // --- DATA STATE ---
    const [identityData, setIdentityData] = useState({
        name: currentUser.name,
        email: currentUser.email,
        phone_number: '+91 98765 43210',
        jobTitle: 'Senior Event Director'
    });

    const [businessData, setBusinessData] = useState({
        companyName: 'CN Events & Logistics',
        currency: '₹',
        secondaryCurrency: '$',
        brandingColor: '#3b82f6',
        leadRules: 'Priority based on Budget',
        maintenanceMode: false
    });

    const [logsData, setLogsData] = useState([]);
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [selectedUserName, setSelectedUserName] = useState('');

    const [team, setTeam] = useState([]);
    const [showAddUser, setShowAddUser] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Assistant', password: 'password123', phone_number: '' });

    const downloadLogs = (userName, logs) => {
        const headers = ["Action", "Details", "Timestamp"];
        const csvRows = [
            headers.join(','),
            ...logs.map(log => [
                `"${log.action}"`,
                `"${log.details.replace(/"/g, '""')}"`,
                `"${new Date(log.timestamp).toLocaleString()}"`
            ].join(','))
        ];
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `${userName.replace(/\s+/g, '_')}_Activity_Logs.csv`);
        a.click();
    };

    // Fetch Data on Load
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Company Config
                try {
                    const configRes = await axios.get(`${API_URL}/config`);
                    if (configRes.data) {
                        setBusinessData({
                            companyName: configRes.data.companyName || 'CN Events',
                            currency: configRes.data.defaults?.currency || '₹',
                            secondaryCurrency: configRes.data.defaults?.secondaryCurrency || '$',
                            brandingColor: configRes.data.branding?.primaryColor || '#3b82f6',
                            leadRules: configRes.data.leadSettings?.prioritizationRules || 'None',
                            maintenanceMode: configRes.data.security?.maintenanceMode || false
                        });
                    }
                } catch (configErr) {
                    console.warn("Failed to fetch config (might be restricted/network)", configErr);
                }

                // 2. Fetch User Data (Profile & Team)
                if (currentUser.token) {
                    const headers = { Authorization: `Bearer ${currentUser.token}` };

                    // A. Fetch Own Profile (Available to all authenticated users)
                    try {
                        const profileRes = await axios.get(`${API_URL}/profile`, { headers });
                        const me = profileRes.data;
                        if (me) {
                            setIdentityData({
                                name: me.name,
                                email: me.email,
                                jobTitle: me.jobTitle || 'Team Member',
                                phone_number: me.phone_number || ''
                            });
                            setIsLockPasswordSet(!!me.lockPassword);
                            // Optional: update local user state if needed
                        }
                    } catch (err) {
                        if (err.response?.status === 401) {
                            setAuthError("Session expired. Please log in again.");
                        } else {
                            console.error("Profile fetch error:", err);
                        }
                    }

                    // B. Fetch Team (Only if privileged)
                    // We check permission or role before making the request to avoid 403s
                    if (canReadTeam || isAdmin) {
                        try {
                            const teamRes = await axios.get(`${API_URL}/users`, { headers });
                            setTeam(teamRes.data);
                        } catch (err) {
                            // If we thought we had permission but didn't, don't show a global session error, just log it.
                            // Only 401 is a critical session error.
                            if (err.response?.status === 401) {
                                setAuthError("Session expired or invalid token.");
                            } else if (err.response?.status === 403) {
                                console.warn("Access to Team List denied.");
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching settings data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUser.token, canReadTeam, isAdmin]);



    const toggleLock = () => {
        if (!isLockPasswordSet && !isLocked) {
            alert('Lock Station protocol cannot be engaged. No access password detected. Please set your clearance password in the Security tab first.');
            return;
        }
        setIsLocked(!isLocked);
        setUnlockPassword('');
    };

    const handleUnlock = async () => {
        try {
            await axios.post(`${API_URL}/verify-lock`,
                { lockPassword: unlockPassword },
                { headers: { Authorization: `Bearer ${currentUser.token}` } }
            );
            setIsLocked(false);
            setUnlockPassword('');
        } catch (err) {
            alert(err.response?.data?.error || 'Invalid lock password');
        }
    };

    const handleSetLockPassword = async (e) => {
        e.preventDefault();
        if (lockSetup.password !== lockSetup.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        try {
            await axios.put(`${API_URL}/lock-password`,
                { lockPassword: lockSetup.password },
                { headers: { Authorization: `Bearer ${currentUser.token}` } }
            );
            setIsLockPasswordSet(true);
            setLockSetup({ password: '', confirmPassword: '' });
            alert('Lock Station password secured!');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update lock password');
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const headers = { Authorization: `Bearer ${currentUser.token}` };
            const payload = { ...newUser };
            if (payload.role === 'Other') {
                payload.role = payload.customRole || payload.role;
            }
            delete payload.customRole;

            if (editingMember) {
                const res = await axios.put(`${API_URL}/users/${editingMember._id || editingMember.id}`, payload, { headers });

                // Refresh team list from server to ensure data consistency and prevent duplication bugs
                const refreshRes = await axios.get(`${API_URL}/users`, { headers });
                setTeam(refreshRes.data);

                alert('Personnel record updated and synchronized.');

                // Real-time reflection: If updating self, update identity state and AuthContext too
                if ((editingMember._id || editingMember.id) === currentUser.id) {
                    const updatedInfo = {
                        name: res.data.user.name,
                        email: res.data.user.email,
                        jobTitle: res.data.user.jobTitle,
                        phone_number: res.data.user.phone_number || ''
                    };
                    setIdentityData(updatedInfo);
                    updateUser({ name: updatedInfo.name, email: updatedInfo.email, role: res.data.user.role });
                }
            } else {
                const res = await axios.post(`${API_URL}/users`, payload, { headers });

                // Refresh team list from server
                const refreshRes = await axios.get(`${API_URL}/users`, { headers });
                setTeam(refreshRes.data);

                alert('New mission partner enlisted.');
            }
            setShowAddUser(false);
            setEditingMember(null);
            setNewUser({ name: '', email: '', role: 'Assistant', password: 'password123', phone_number: '' });
        } catch (err) {
            console.error("Management Failure:", err);
            const serverMsg = err.response?.data?.error;
            const clientMsg = err.message;
            alert(serverMsg || clientMsg || 'Failed to manage user');
        }
    };

    const handleUpdateIdentity = async (e) => {
        e.preventDefault();
        try {
            const headers = { Authorization: `Bearer ${currentUser.token}` };
            const res = await axios.put(`${API_URL}/profile`, identityData, { headers });

            // Update global auth state
            updateUser({
                name: res.data.user.name,
                email: res.data.user.email
            });

            alert('Identity successfully synchronized across all terminals.');
        } catch (err) {
            console.error("Identity Update Failure:", err);
            alert(err.response?.data?.error || 'Failed to update identity.');
        }
    };

    const handleEditClick = (member) => {
        setEditingMember(member);
        setNewUser({
            name: member.name,
            email: member.email,
            role: member.role,
            password: '',
            phone_number: member.phone_number || member.phone || ''
        });
        setShowAddUser(true);
    };

    const handleDeleteMember = (id) => {
        if (window.confirm('Remove this mission partner?')) {
            // Backend delete to be implemented
            setTeam(team.filter(m => m._id !== id));
        }
    };

    const fetchUserLogs = async (userId, userName) => {
        try {
            const res = await axios.get(`${API_URL}/logs/${userId}`, {
                headers: { Authorization: `Bearer ${currentUser.token}` }
            });
            setLogsData(res.data);
            setSelectedUserName(userName);
            setShowLogsModal(true);
        } catch (err) {
            alert("Failed to retrieve mission logs.");
        }
    };

    const handleSaveBusinessConfig = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                companyName: businessData.companyName,
                branding: { primaryColor: businessData.brandingColor },
                defaults: {
                    currency: businessData.currency === 'Other' ? businessData.customCurrency : businessData.currency,
                    secondaryCurrency: businessData.secondaryCurrency === 'Other' ? businessData.customSecondaryCurrency : businessData.secondaryCurrency
                },
                leadSettings: { prioritizationRules: businessData.leadRules },
                security: { maintenanceMode: businessData.maintenanceMode }
            };
            await axios.put(`${API_URL}/config`, payload, {
                headers: { Authorization: `Bearer ${currentUser.token}` }
            });
            alert('Mission parameters updated successfully!');
        } catch (err) {
            alert('Failed to deploy mission config.');
        }
    };

    const handleSyncDB = async () => {
        const confirmSync = window.confirm("Initiate data synchronization between Local Station and Cloud Database? This process uses the local DB as the source of truth.");
        if (confirmSync) {
            setLoading(true);
            try {
                const headers = { Authorization: `Bearer ${currentUser.token}` };
                // Adjust path: API_URL is .../auth, we need .../admin/sync-db
                const baseUrl = API_URL.replace('/auth', '');
                const res = await axios.post(`${baseUrl}/admin/sync-db`, {}, { headers });

                let detailsMsg = res.data.details.synced
                    .filter(d => d.count > 0)
                    .map(d => `${d.model}: ${d.count}`)
                    .join('\n');

                if (!detailsMsg) detailsMsg = "No changes needed.";

                alert(`Synchronization Protocol Complete.\n\nUpdated Records:\n${detailsMsg}`);
            } catch (err) {
                console.error("Sync Error:", err);
                const errMsg = err.response?.data?.error || err.message;
                alert(`Synchronization Aborted: ${errMsg}`);
            } finally {
                setLoading(false);
            }
        }
    };

    if (isLocked) {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(20px)',
                zIndex: 9999, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', color: 'white'
            }}>
                <div style={{ textAlign: 'center', width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
                        <Lock size={40} style={{ color: '#ef4444' }} />
                    </div>
                    <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '12px', letterSpacing: '-0.02em' }}>TERMINAL LOCKED</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '40px', fontSize: '16px' }}>Enter Clearance Key to Resume Operations</p>

                    <input
                        type="password"
                        placeholder="••••••••"
                        autoFocus
                        value={unlockPassword}
                        onChange={(e) => setUnlockPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                        style={{
                            width: '100%', padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.1)', color: 'white', textAlign: 'center', fontSize: '24px',
                            letterSpacing: '8px', outline: 'none', marginBottom: '24px', transition: 'all 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                    <Button
                        onClick={handleUnlock}
                        style={{
                            width: '100%', padding: '18px', borderRadius: '16px',
                            fontWeight: '700', fontSize: '16px'
                        }}
                    >
                        <Unlock size={20} /> UNLOCK SESSION
                    </Button>
                    <p style={{ marginTop: '32px', fontSize: '12px', color: '#64748b', letterSpacing: '0.1em' }}>SECURITY STATION ACTIVE • ID: {currentUser.id.slice(-6).toUpperCase()}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen transition-colors duration-500 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ padding: '32px', backgroundColor: bgColor, color: textColor }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {authError && (
                    <div style={{ backgroundColor: isDark ? 'rgba(255,237,213,0.1)' : '#fff7ed', border: '1px solid #ffedd5', padding: '12px 20px', borderRadius: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#9a3412', fontSize: '14px', fontWeight: '500' }}>⚠️ {authError}</span>
                        <button onClick={() => window.location.reload()} style={{ color: '#c2410c', background: 'none', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>Reload Session</button>
                    </div>
                )}

                <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: '900', color: textColor, marginBottom: '8px' }}>
                            {currentUserRole || 'User'} Command Center
                        </h1>
                        <p style={{ color: subTextColor, fontSize: '18px' }}>Centralized hub for workforce, security, and global business parameters.</p>
                    </div>
                    {(isAdmin || isAssistant) && (
                        <button
                            onClick={handleSyncDB}
                            style={{
                                ...PrimaryBtnStyle,
                                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff',
                                color: '#3b82f6',
                                border: '1px solid #3b82f6',
                                boxShadow: 'none'
                            }}
                        >
                            <Database size={18} /> SYNC DATABASES
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '32px' }}>
                    {/* Tabs Sidebar */}
                    <div style={{ width: '280px', flexShrink: 0 }}>
                        <div style={{ backgroundColor: cardBg, borderRadius: '24px', padding: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'sticky', top: '32px', border: `1px solid ${borderColor}` }}>
                            {[
                                { name: 'Identity', icon: <User size={20} /> },
                                { name: 'Security Control', icon: <Shield size={20} /> },
                                isAdmin && { name: 'Team Management', icon: <Users size={20} /> },
                                isAdmin && { name: 'Business Config', icon: <Building size={20} /> },
                                isAdmin && { name: 'Credential Vault', icon: <KeyIcon size={20} /> },
                                isAdmin && { name: 'Access Rights', icon: <Settings size={20} /> }
                            ].filter(Boolean).map(tab => (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '16px 20px', borderRadius: '16px', border: 'none',
                                        backgroundColor: activeTab === tab.name ? (isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9') : 'transparent',
                                        color: activeTab === tab.name ? textColor : subTextColor,
                                        fontWeight: activeTab === tab.name ? '700' : '500',
                                        cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                                        marginBottom: '6px'
                                    }}
                                >
                                    {tab.icon} {tab.name}
                                </button>
                            ))}
                            <hr style={{ margin: '16px 0', border: '0', borderTop: `1px solid ${borderColor}` }} />
                            <button
                                onClick={toggleLock}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '16px 20px', borderRadius: '16px', border: 'none',
                                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2', color: '#dc2626', fontWeight: '700',
                                    cursor: 'pointer', textAlign: 'left'
                                }}
                            >
                                <Lock size={20} /> LOCK STATION
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div style={{ flex: 1 }}>
                        <div style={{ backgroundColor: cardBg, borderRadius: '32px', padding: '48px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', minHeight: '650px', border: `1px solid ${borderColor}` }}>

                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                                    <div style={{ width: '40px', height: '40px', border: `4px solid ${isDark ? '#334155' : '#f3f3f3'}`, borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                </div>
                            ) : (
                                <>
                                    {/* IDENTITY TAB */}
                                    {activeTab === 'Identity' && (
                                        <div>
                                            <h2 style={{ fontSize: '28px', fontWeight: '800', color: textColor, marginBottom: '32px' }}>Professional Identity</h2>
                                            <form onSubmit={handleUpdateIdentity}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
                                                    <FormGroup label="Full name" icon={<User size={18} />} value={identityData.name} onChange={v => setIdentityData({ ...identityData, name: v })} disabled={!isAdmin || !canWriteAccount} theme={{ textColor, subTextColor, borderColor, cardBg }} />
                                                    <FormGroup label="Professional role" icon={<Briefcase size={18} />} value={identityData.jobTitle} onChange={v => setIdentityData({ ...identityData, jobTitle: v })} disabled={!isAdmin || !canWriteAccount} theme={{ textColor, subTextColor, borderColor, cardBg }} />
                                                    <FormGroup label="Email channel" icon={<Mail size={18} />} value={identityData.email} onChange={v => setIdentityData({ ...identityData, email: v })} disabled={!isAdmin || !canWriteAccount} theme={{ textColor, subTextColor, borderColor, cardBg }} />
                                                    <FormGroup label="Contact number" icon={<Phone size={18} />} value={identityData.phone_number} onChange={v => setIdentityData({ ...identityData, phone_number: v })} disabled={!isAdmin || !canWriteAccount} theme={{ textColor, subTextColor, borderColor, cardBg }} />
                                                </div>
                                                {(isAdmin && canWriteAccount) ? (
                                                    <button type="submit" style={PrimaryBtnStyle}><Save size={20} /> Commit Changes</button>
                                                ) : (
                                                    <div style={{ color: subTextColor, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Lock size={14} /> Identity parameters are read-only for your clearance level.
                                                    </div>
                                                )}
                                            </form>
                                        </div>
                                    )}

                                    {/* SECURITY TAB */}
                                    {activeTab === 'Security Control' && (
                                        <div>
                                            <h2 style={{ fontSize: '28px', fontWeight: '800', color: textColor, marginBottom: '32px' }}>Security Station</h2>

                                            <div style={{ display: 'grid', gridTemplateColumns: canWriteAccount ? '1fr 1fr' : '1fr', gap: '32px' }}>
                                                <div style={{ ...CardStyle(cardBg, borderColor), maxWidth: canWriteAccount ? 'none' : '500px', margin: canWriteAccount ? '0' : '0 auto' }}>
                                                    <Shield size={28} style={{ color: '#3b82f6', marginBottom: '20px' }} />
                                                    <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: textColor }}>Station Access Password</h4>
                                                    <p style={{ color: subTextColor, fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
                                                        {isLockPasswordSet ? 'Access control is active. You can update your lock password below.' : 'Establish an access password for the Lock Station protocol.'}
                                                    </p>

                                                    <form onSubmit={handleSetLockPassword} style={{ width: '100%' }}>
                                                        <input
                                                            type="password"
                                                            placeholder="New Lock Password"
                                                            value={lockSetup.password}
                                                            onChange={(e) => setLockSetup({ ...lockSetup, password: e.target.value })}
                                                            style={{ ...InputStyle(cardBg, borderColor, textColor), marginBottom: '16px' }}
                                                            required
                                                        />
                                                        <input
                                                            type="password"
                                                            placeholder="Confirm Password"
                                                            value={lockSetup.confirmPassword}
                                                            onChange={(e) => setLockSetup({ ...lockSetup, confirmPassword: e.target.value })}
                                                            style={{ ...InputStyle(cardBg, borderColor, textColor), marginBottom: '24px' }}
                                                            required
                                                        />
                                                        {canWriteAccount ? (
                                                            <button type="submit" style={{ ...PrimaryBtnStyle, width: '100%', justifyContent: 'center' }}>
                                                                {isLockPasswordSet ? 'Authorize Update' : 'Initialize Password'}
                                                            </button>
                                                        ) : (
                                                            <p style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center' }}>Encryption key updates not permitted.</p>
                                                        )}
                                                    </form>
                                                </div>
                                                {(canWriteSettings || isAdmin) && (
                                                    <div style={CardStyle(cardBg, borderColor)}>
                                                        <RefreshCw size={28} style={{ color: '#f59e0b', marginBottom: '20px' }} />
                                                        <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: textColor }}>Maintenance Mode</h4>
                                                        <p style={{ color: subTextColor, fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
                                                            Activate global maintenance protocol to restrict access to Admins only.
                                                        </p>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                                                            <button
                                                                onClick={() => setBusinessData({ ...businessData, maintenanceMode: !businessData.maintenanceMode })}
                                                                style={{
                                                                    ...SecondaryBtnStyle(cardBg, borderColor, textColor), flex: 1,
                                                                    borderColor: businessData.maintenanceMode ? '#ef4444' : borderColor,
                                                                    color: businessData.maintenanceMode ? '#ef4444' : textColor
                                                                }}
                                                            >
                                                                {businessData.maintenanceMode ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                                                {businessData.maintenanceMode ? 'ACTIVE' : 'INACTIVE'}
                                                            </button>
                                                            <button onClick={handleSaveBusinessConfig} style={{ ...PrimaryBtnStyle, flex: 1, justifyContent: 'center' }}>Apply</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* TEAM MANAGEMENT TAB */}
                                    {activeTab === 'Team Management' && isAdmin && (
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                    <h2 style={{ fontSize: '28px', fontWeight: '800', color: textColor }}>Personnel Database</h2>
                                                    <button
                                                        onClick={async () => {
                                                            setLoading(true);
                                                            try {
                                                                const headers = { Authorization: `Bearer ${currentUser.token}` };
                                                                const teamRes = await axios.get(`${API_URL}/users`, { headers });
                                                                setTeam(teamRes.data);
                                                            } catch (e) { console.error(e); }
                                                            setLoading(false);
                                                        }}
                                                        style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '900', padding: '8px' }}
                                                    >
                                                        <RefreshCw size={18} /> SYNC STATUS
                                                    </button>
                                                </div>
                                                {canWriteTeam && (
                                                    <button onClick={() => { setEditingMember(null); setShowAddUser(true); }} style={PrimaryBtnStyle}><Plus size={20} /> Add Mission Partner</button>
                                                )}
                                            </div>

                                            <div style={{ borderRadius: '20px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc' }}>
                                                        <tr>
                                                            <th style={TabHeaderStyle(subTextColor)}>NAME</th>
                                                            <th style={TabHeaderStyle(subTextColor)}>STATUS</th>
                                                            <th style={TabHeaderStyle(subTextColor)}>ROLE</th>
                                                            <th style={TabHeaderStyle(subTextColor)}>EMAIL CHANNEL</th>
                                                            <th style={TabHeaderStyle(subTextColor)}>ACTIONS</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {team.map(member => (
                                                            <tr key={member._id || member.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                                                                <td style={TableCellStyle(textColor)}>
                                                                    <span style={{ fontWeight: '700', color: textColor }}>{member.name}</span>
                                                                </td>
                                                                <td style={TableCellStyle(textColor)}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <div style={{
                                                                            width: '8px', height: '8px', borderRadius: '50%',
                                                                            backgroundColor: member.isOnline ? '#10b981' : '#94a3b8',
                                                                            boxShadow: member.isOnline ? '0 0 8px rgba(16, 185, 129, 0.4)' : 'none'
                                                                        }}></div>
                                                                        <span style={{
                                                                            fontSize: '10px', fontWeight: '900',
                                                                            color: member.isOnline ? '#10b981' : subTextColor,
                                                                            letterSpacing: '0.05em'
                                                                        }}>
                                                                            {member.isOnline ? 'ONLINE' : 'OFFLINE'}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td style={TableCellStyle(textColor)}>
                                                                    <span style={{
                                                                        padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '800',
                                                                        backgroundColor: member.role === 'Admin' ? 'rgba(239, 68, 68, 0.1)' : (member.role === 'Lead Planner' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(100, 116, 139, 0.1)'),
                                                                        color: member.role === 'Admin' ? '#dc2626' : (member.role === 'Lead Planner' ? '#3b82f6' : subTextColor)
                                                                    }}>
                                                                        {member.role.toUpperCase()}
                                                                    </span>
                                                                </td>
                                                                <td style={TableCellStyle(textColor)}>{member.email}</td>
                                                                <td style={TableCellStyle(textColor)}>
                                                                    <div style={{ display: 'flex', gap: '16px' }}>
                                                                        {canReadLogs && <button onClick={() => fetchUserLogs(member._id || member.id, member.name)} style={{ color: subTextColor, background: 'none', border: 'none', cursor: 'pointer' }} title="Activity Logs"><Activity size={18} /></button>}
                                                                        {canWriteTeam && <button onClick={() => handleEditClick(member)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}><Edit size={18} /></button>}
                                                                        {canDeleteTeam && <button onClick={() => handleDeleteMember(member._id || member.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {team.length === 0 && (
                                                            <tr>
                                                                <td colSpan="5" style={{ padding: '48px', textAlign: 'center', color: subTextColor }}>No personnel records found.</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {showLogsModal && (
                                                <div style={ModalOverlayStyle}>
                                                    <div style={{ ...ModalContentStyle(cardBg), maxWidth: '600px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                                <h3 style={{ fontSize: '24px', fontWeight: '900', color: textColor }}>{selectedUserName}'s Activity Logs</h3>
                                                                {logsData.length > 0 && (
                                                                    <button
                                                                        onClick={() => downloadLogs(selectedUserName, logsData)}
                                                                        style={{ ...SecondaryBtnStyle(cardBg, borderColor, textColor), padding: '8px 16px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                                    >
                                                                        <Download size={14} /> CSV
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <button onClick={() => setShowLogsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><XCircle size={24} color={subTextColor} /></button>
                                                        </div>
                                                        <div style={{ maxHeight: '450px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '10px' }}>
                                                            {logsData.map((log, i) => {
                                                                const isLogin = log.action === 'Login';
                                                                const isLogout = log.action === 'Logout';
                                                                return (
                                                                    <div key={i} style={{
                                                                        padding: '20px',
                                                                        borderRadius: '20px',
                                                                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                                                        borderLeft: `4px solid ${isLogin ? '#10b981' : isLogout ? '#ef4444' : '#3b82f6'}`,
                                                                        border: `1px solid ${borderColor}`,
                                                                    }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                                {isLogin ? <LogIn size={18} color="#10b981" /> : isLogout ? <LogOut size={18} color="#ef4444" /> : <Activity size={18} color="#3b82f6" />}
                                                                                <span style={{ fontWeight: '900', color: textColor, fontSize: '16px' }}>{log.action.toUpperCase()}</span>
                                                                            </div>
                                                                            <span style={{ fontSize: '11px', color: subTextColor }}>
                                                                                {new Date(log.timestamp).toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                        <p style={{ fontSize: '14px', color: subTextColor, margin: 0, lineHeight: '1.5' }}>{log.details}</p>
                                                                        {isLogout && log.details.includes('Session duration:') && (
                                                                            <div style={{ marginTop: '12px', padding: '8px 12px', borderRadius: '10px', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                                                                <Clock size={14} color={subTextColor} />
                                                                                <span style={{ fontSize: '12px', fontWeight: '800', color: textColor }}>
                                                                                    {log.details.split('Session duration: ')[1]}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                            {logsData.length === 0 && <p style={{ textAlign: 'center', color: subTextColor, padding: '40px' }}>No session records detected.</p>}
                                                        </div>
                                                        <button onClick={() => setShowLogsModal(false)} style={{ ...PrimaryBtnStyle, width: '100%', marginTop: '32px', justifyContent: 'center' }}>CLOSE MONITOR</button>
                                                    </div>
                                                </div>
                                            )}

                                            {showAddUser && (
                                                <div style={ModalOverlayStyle}>
                                                    <div style={ModalContentStyle(cardBg)}>
                                                        <h3 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '24px', color: textColor }}>{editingMember ? 'Update Personnel' : 'Enlist Personnel'}</h3>
                                                        <form onSubmit={handleAddUser}>
                                                            <div style={{ marginBottom: '20px' }}>
                                                                <Label style={LabelStyle(subTextColor)}>Full Name</Label>
                                                                <input type="text" style={InputStyle(cardBg, borderColor, textColor)} value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required />
                                                            </div>
                                                            <div style={{ marginBottom: '20px' }}>
                                                                <Label style={LabelStyle(subTextColor)}>Email Address</Label>
                                                                <input type="email" style={InputStyle(cardBg, borderColor, textColor)} value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
                                                            </div>
                                                            <div style={{ marginBottom: '20px' }}>
                                                                <Label style={LabelStyle(subTextColor)}>Phone Number</Label>
                                                                <input type="text" style={InputStyle(cardBg, borderColor, textColor)} value={newUser.phone_number} onChange={e => setNewUser({ ...newUser, phone_number: e.target.value })} placeholder="+1 (555) 000-0000" />
                                                            </div>
                                                            {!editingMember && (
                                                                <div style={{ marginBottom: '20px' }}>
                                                                    <Label style={LabelStyle(subTextColor)}>Assign Secret Password</Label>
                                                                    <input type="password" style={InputStyle(cardBg, borderColor, textColor)} value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required />
                                                                </div>
                                                            )}
                                                            <div style={{ marginBottom: '32px' }}>
                                                                <Label style={LabelStyle(subTextColor)}>Designated Role</Label>
                                                                <select style={InputStyle(cardBg, borderColor, textColor)} value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} required>
                                                                    <option value="Assistant">Assistant</option>
                                                                    <option value="Lead Planner">Lead Planner</option>
                                                                    <option value="Admin">Admin</option>
                                                                    <option value="Other">Other</option>
                                                                </select>
                                                                {newUser.role === 'Other' && (
                                                                    <input
                                                                        type="text"
                                                                        style={{ ...InputStyle(cardBg, borderColor, textColor), marginTop: '12px' }}
                                                                        placeholder="Specify custom role"
                                                                        onChange={(e) => setNewUser({ ...newUser, customRole: e.target.value })}
                                                                        required
                                                                    />
                                                                )}
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '16px' }}>
                                                                <button type="button" onClick={() => setShowAddUser(false)} style={{ ...SecondaryBtnStyle(cardBg, borderColor, textColor), flex: 1 }}>Abort</button>
                                                                <button type="submit" style={{ ...PrimaryBtnStyle, flex: 2, justifyContent: 'center' }}>{editingMember ? 'Update Record' : 'Create Account'}</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* BUSINESS CONFIG TAB */}
                                    {activeTab === 'Business Config' && isAdmin && (
                                        <div>
                                            <h2 style={{ fontSize: '28px', fontWeight: '800', color: textColor, marginBottom: '32px' }}>Global Operations Config</h2>
                                            <form onSubmit={handleSaveBusinessConfig}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                                        <FormGroup label="Branding primary name" icon={<Building size={18} />} value={businessData.companyName} onChange={v => setBusinessData({ ...businessData, companyName: v })} theme={{ textColor, subTextColor, borderColor, cardBg }} />

                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                                <Label style={LabelStyle(subTextColor)}>Primary Currency</Label>
                                                                <select style={InputStyle(cardBg, borderColor, textColor)} value={businessData.currency} onChange={v => setBusinessData({ ...businessData, currency: v.target.value })} required>
                                                                    <option value="₹">Rupee (₹)</option>
                                                                    <option value="$">Dollar ($)</option>
                                                                    <option value="€">Euro (€)</option>
                                                                    <option value="Other">Other</option>
                                                                </select>
                                                                {businessData.currency === 'Other' && (
                                                                    <input
                                                                        type="text"
                                                                        style={{ ...InputStyle(cardBg, borderColor, textColor), marginTop: '12px' }}
                                                                        placeholder="Specify custom currency"
                                                                        onChange={(e) => setBusinessData({ ...businessData, customCurrency: e.target.value })}
                                                                        required
                                                                    />
                                                                )}
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                                <Label style={LabelStyle(subTextColor)}>Secondary Currency</Label>
                                                                <select style={InputStyle(cardBg, borderColor, textColor)} value={businessData.secondaryCurrency} onChange={v => setBusinessData({ ...businessData, secondaryCurrency: v.target.value })} required>
                                                                    <option value="$">Dollar ($)</option>
                                                                    <option value="₹">Rupee (₹)</option>
                                                                    <option value="€">Euro (€)</option>
                                                                    <option value="Other">Other</option>
                                                                </select>
                                                                {businessData.secondaryCurrency === 'Other' && (
                                                                    <input
                                                                        type="text"
                                                                        style={{ ...InputStyle(cardBg, borderColor, textColor), marginTop: '12px' }}
                                                                        placeholder="Specify custom secondary currency"
                                                                        onChange={(e) => setBusinessData({ ...businessData, customSecondaryCurrency: e.target.value })}
                                                                        required
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>

                                                        <FormGroup label="Primary color hex" icon={<DollarSign size={18} />} value={businessData.brandingColor} onChange={v => setBusinessData({ ...businessData, brandingColor: v })} theme={{ textColor, subTextColor, borderColor, cardBg }} />
                                                    </div>

                                                    <div style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderRadius: '24px', padding: '32px', border: `1px solid ${borderColor}` }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                                            <FileText size={20} color="#3b82f6" />
                                                            <span style={{ fontWeight: '800', color: textColor, fontSize: '14px', textTransform: 'uppercase' }}>Visual Branding Preview</span>
                                                        </div>

                                                        {/* Sample Invoice Preview */}
                                                        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', transform: 'scale(0.9)', transformOrigin: 'top center' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: businessData.brandingColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '10px' }}>LOGO</div>
                                                                <div style={{ textAlign: 'right' }}>
                                                                    <div style={{ fontSize: '10px', fontWeight: '900', color: businessData.brandingColor }}>INVOICE</div>
                                                                    <div style={{ fontSize: '8px', color: '#94a3b8' }}>#INV-2024-001</div>
                                                                </div>
                                                            </div>
                                                            <div style={{ height: '2px', background: `linear-gradient(90deg, ${businessData.brandingColor} 0%, transparent 100%)`, marginBottom: '16px' }}></div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                                <div style={{ width: '40%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px' }}></div>
                                                                <div style={{ width: '20%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px' }}></div>
                                                            </div>
                                                            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '12px' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                                    <div style={{ width: '60%', height: '6px', backgroundColor: '#f8fafc', borderRadius: '3px' }}></div>
                                                                    <div style={{ width: '15%', height: '6px', backgroundColor: '#f8fafc', borderRadius: '3px' }}></div>
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                                <div style={{ fontSize: '10px', fontWeight: '800', color: '#1e293b' }}>Total: {businessData.currency} 45,000</div>
                                                            </div>
                                                        </div>
                                                        <p style={{ fontSize: '11px', color: subTextColor, textAlign: 'center', marginTop: '16px' }}>Real-time synchronization of brand identity.</p>
                                                    </div>
                                                </div>
                                                {canWriteSettings && <button type="submit" style={PrimaryBtnStyle}><Save size={20} /> Deploy Mission Config</button>}
                                            </form>
                                        </div>
                                    )}

                                    {/* CREDENTIAL VAULT TAB */}
                                    {activeTab === 'Credential Vault' && isAdmin && (
                                        <UserVault />
                                    )}

                                    {/* ACCESS CONTROL TAB (ADMIN ONLY) */}
                                    {activeTab === 'Access Rights' && isAdmin && (
                                        <AccessControl token={currentUser.token} />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SUBSIDIARY COMPONENTS ---

const FormGroup = ({ label, icon, value, onChange, disabled = false, theme = {} }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.textColor }}>{label}</Label>
        <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: theme.subTextColor, zIndex: 10 }}>{icon}</span>
            <Input
                type="text"
                style={{
                    paddingLeft: '48px',
                    backgroundColor: theme.cardBg,
                    color: theme.textColor,
                    borderColor: theme.borderColor,
                }}
                value={value}
                onChange={(v) => !disabled && onChange(v.target.value)}
                disabled={disabled}
                required
            />
        </div>
    </div>
);

// --- STYLES ---

const TabHeaderStyle = (color) => ({ padding: '18px 24px', textAlign: 'left', fontSize: '13px', color: color, fontWeight: '800', letterSpacing: '0.05em' });
const TableCellStyle = (color) => ({ padding: '24px', fontSize: '15px', color: color });

const PrimaryBtnStyle = {
    display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 32px', borderRadius: '16px',
    background: '#3b82f6', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', transition: 'all 0.3s',
    boxShadow: '0 8px 20px -6px rgba(59, 130, 246, 0.5)'
};

const SecondaryBtnStyle = (bg, border, color) => ({
    padding: '16px 32px', borderRadius: '16px', background: bg, color: color,
    border: `1px solid ${border}`, fontWeight: '800', cursor: 'pointer', transition: 'all 0.3s'
});

const LabelStyle = (color) => ({ fontSize: '14px', fontWeight: '700', color: color, marginBottom: '4px' });

const InputStyle = (bg, border, color) => ({
    width: '100%', padding: '16px 20px', borderRadius: '16px', border: `2px solid ${border}`,
    fontSize: '16px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
    backgroundColor: bg, color: color
});

const CardStyle = (bg, border) => ({
    padding: '40px', borderRadius: '32px', backgroundColor: bg, border: `1px solid ${border}`,
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start'
});

const ModalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)'
};

const ModalContentStyle = (bg) => ({
    backgroundColor: bg, padding: '48px', borderRadius: '32px', width: '100%', maxWidth: '500px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)'
});

export default AccountSettings;
