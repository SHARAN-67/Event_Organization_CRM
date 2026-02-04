import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Shield, UserPlus, RefreshCw, Copy, Check, Search,
    Lock, Key, ShieldAlert, ChevronRight, User, Mail,
    Trash2, AlertTriangle, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeContext';

const UserVault = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [credentialModal, setCredentialModal] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Assistant', jobTitle: '' });
    const { theme } = useTheme();
    const { userRole } = useAuth();

    const isDark = theme === 'dark' || theme === 'night';
    const bgColor = theme === 'light' ? '#f8fafc' : theme === 'dark' ? '#0f172a' : '#020617';
    const cardBg = theme === 'light' ? '#ffffff' : theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(15, 23, 42, 0.5)';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const subTextColor = isDark ? '#94a3b8' : '#64748b';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0';

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch vault users", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/admin/users/create', newUser, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCredentialModal({
                ...res.data.user,
                password: res.data.temporaryPassword
            });
            setNewUser({ name: '', email: '', role: 'Assistant', jobTitle: '' });
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to create user");
        } finally {
            setIsCreating(false);
        }
    };

    const handleResetPassword = async (userId) => {
        if (!window.confirm("Are you sure? This will invalidate the user's current password.")) return;

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5000/api/admin/users/${userId}/reset-password`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCredentialModal({
                password: res.data.temporaryPassword,
                isReset: true
            });
        } catch (err) {
            alert("Failed to reset password");
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.agId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Could add a toast here
        alert("Copied to clipboard!");
    };

    if (userRole !== 'Admin') {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center">
                <ShieldAlert size={64} className="text-red-500 mb-4 opacity-20" />
                <h2 className="text-2xl font-black uppercase tracking-widest text-red-500">Security Access Denied</h2>
                <p className="opacity-40 max-w-xs mt-2">Only level-1 administrators are authorized to access the user credential vault.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: textColor }}>User Security Vault</h2>
                    <p className="text-sm opacity-50 font-medium">Manage personnel credentials and AG-ID authorization protocols.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-blue-500 group-focus-within:opacity-100 transition-all" />
                        <input
                            type="text"
                            placeholder="SEARCH PERSONNEL..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border rounded-xl pl-10 pr-4 py-2 text-[10px] font-black uppercase tracking-widest w-64 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                            style={{ backgroundColor: cardBg, borderColor: borderColor, color: textColor }}
                        />
                    </div>
                </div>
            </div>

            {/* Creation Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Provisioning Form */}
                <div className="lg:col-span-1 p-6 border rounded-3xl space-y-6" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-500/10 p-2 rounded-lg">
                            <UserPlus size={18} className="text-blue-500" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-wider">Provision Personnel</h3>
                    </div>

                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">Full Name</label>
                            <input
                                required
                                value={newUser.name}
                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                className="w-full bg-slate-500/5 border rounded-xl px-4 py-2.5 text-xs font-bold"
                                style={{ borderColor: borderColor, color: textColor }}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                type="email"
                                required
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                className="w-full bg-slate-500/5 border rounded-xl px-4 py-2.5 text-xs font-bold"
                                style={{ borderColor: borderColor, color: textColor }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">Assigned Role</label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    className="w-full bg-slate-500/5 border rounded-xl px-4 py-2.5 text-xs font-bold appearance-none"
                                    style={{ borderColor: borderColor, color: textColor }}
                                >
                                    <option value="Assistant" className="bg-slate-900">Assistant</option>
                                    <option value="Lead Planner" className="bg-slate-900">Lead Planner</option>
                                    <option value="Planner" className="bg-slate-900">Planner</option>
                                    <option value="Admin" className="bg-slate-900">Admin</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">Job Title</label>
                                <input
                                    value={newUser.jobTitle}
                                    onChange={(e) => setNewUser({ ...newUser, jobTitle: e.target.value })}
                                    className="w-full bg-slate-500/5 border rounded-xl px-4 py-2.5 text-xs font-bold"
                                    style={{ borderColor: borderColor, color: textColor }}
                                />
                            </div>
                        </div>
                        <button
                            disabled={isCreating}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mt-4 uppercase text-[10px] tracking-widest"
                        >
                            {isCreating ? <RefreshCw className="animate-spin" size={16} /> : <Shield size={16} />}
                            {isCreating ? 'Encrypting Data...' : 'Authorize & Provision'}
                        </button>
                    </form>
                </div>

                {/* Users List Table */}
                <div className="lg:col-span-2 border rounded-3xl overflow-hidden" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b" style={{ borderColor: borderColor, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-40">AG-ID & Profile</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-40">Permissions</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-40">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: borderColor }}>
                                {filteredUsers.map(user => (
                                    <tr key={user._id} className="group hover:bg-white/5 transition-all">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-slate-500/10 w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-blue-500">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-black uppercase tracking-tight" style={{ color: textColor }}>{user.name}</div>
                                                    <div className="text-[10px] font-mono opacity-50">{user.agId || 'UNREGISTERED'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[8px] font-black rounded border border-blue-500/20 uppercase tracking-widest">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${user.mustChangePassword ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                                                <span className="text-[9px] font-black uppercase tracking-tighter opacity-50">
                                                    {user.mustChangePassword ? 'Key Pending' : 'Encrypted'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleResetPassword(user._id)}
                                                className="p-2 hover:bg-amber-500/10 rounded-lg text-amber-500/40 hover:text-amber-500 transition-all border border-transparent hover:border-amber-500/20"
                                                title="Reset Credentials"
                                            >
                                                <RefreshCw size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* One-Time Credential Modal */}
            {credentialModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-md p-8 rounded-[2.5rem] border shadow-2xl space-y-6 animate-in zoom-in duration-300"
                        style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <div className="text-center space-y-2">
                            <div className="bg-emerald-500/10 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                                <Key size={32} className="text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight" style={{ color: textColor }}>
                                {credentialModal.isReset ? 'Credential Reset' : 'Authorization Generated'}
                            </h3>
                            <p className="text-xs opacity-50 uppercase tracking-widest font-bold">Confidential: One-time view only</p>
                        </div>

                        <div className="space-y-4 p-6 bg-slate-500/5 rounded-3xl border border-dashed" style={{ borderColor: borderColor }}>
                            {!credentialModal.isReset && (
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em] ml-1">Personnel ID</label>
                                    <div className="flex items-center justify-between text-sm font-mono font-black" style={{ color: textColor }}>
                                        {credentialModal.agId}
                                        <button onClick={() => copyToClipboard(credentialModal.agId)} className="text-blue-500 hover:scale-110"><Copy size={16} /></button>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em] ml-1">Encrypted Clearance Key</label>
                                <div className="flex items-center justify-between text-lg font-mono font-black text-blue-500 tracking-tighter">
                                    {credentialModal.password}
                                    <button onClick={() => copyToClipboard(credentialModal.password)} className="text-blue-500 hover:scale-110"><Copy size={20} /></button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-500/10 p-4 rounded-2xl flex gap-3 border border-amber-500/20">
                            <AlertTriangle size={20} className="text-amber-500 shrink-0" />
                            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-tight leading-relaxed">
                                WARNING: This clearance key is only visible now. Ensure it is transmitted to the personnel securely. Password will be hashed and hidden once you close this terminal.
                            </p>
                        </div>

                        <button
                            onClick={() => setCredentialModal(null)}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl transition-all uppercase text-[10px] tracking-widest"
                        >
                            Acknowledge & Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserVault;
