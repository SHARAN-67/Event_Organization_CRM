import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Megaphone, Target, TrendingUp, Users, Calendar, Plus, X, Save, Trash2, Loader2, DollarSign } from 'lucide-react';

const Campaigns = () => {
    const { theme } = useTheme();
    const { hasPermission, userRole } = useAuth();

    // Theme Variables
    const isDark = theme === 'dark' || theme === 'night';
    const bgColor = theme === 'light' ? '#f8fafc' : theme === 'dark' ? '#0f172a' : '#020617';
    const cardBg = theme === 'light' ? '#ffffff' : theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(15, 23, 42, 0.5)';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const subTextColor = isDark ? '#94a3b8' : '#64748b';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0';

    // State
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '', status: 'Draft', reach: '', roi: '', budget: '', startDate: '', endDate: '', description: ''
    });
    const [currentId, setCurrentId] = useState(null);

    const API_URL = 'http://localhost:5000/api/campaigns';
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    const canWrite = userRole === 'Admin' || hasPermission('Campaigns', 'Write');
    const canDelete = userRole === 'Admin' || hasPermission('Campaigns', 'Delete');

    // Fetch Campaigns
    const fetchCampaigns = async () => {
        try {
            // setLoading(true); // Don't block UI if refreshing
            const res = await axios.get(API_URL, { headers });
            setCampaigns(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    // Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`${API_URL}/${currentId}`, formData, { headers });
            } else {
                await axios.post(API_URL, formData, { headers });
            }
            setIsModalOpen(false);
            fetchCampaigns(); // Real-time update
        } catch (error) {
            alert('Failed to save campaign');
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent opening edit modal
        if (!confirm('Are you sure you want to delete this campaign?')) return;
        try {
            await axios.delete(`${API_URL}/${id}`, { headers });
            fetchCampaigns(); // Real-time update
        } catch (error) {
            alert('Failed to delete campaign');
        }
    };

    const openEditModal = (camp) => {
        setFormData({
            name: camp.name,
            status: camp.status,
            reach: camp.reach,
            roi: camp.roi,
            budget: camp.budget,
            startDate: camp.startDate ? camp.startDate.split('T')[0] : '',
            endDate: camp.endDate ? camp.endDate.split('T')[0] : '',
            description: camp.description
        });
        setCurrentId(camp._id);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setFormData({ name: '', status: 'Draft', reach: '', roi: '', budget: '', startDate: '', endDate: '', description: '' });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    // Mappings for colors to avoid dynamic class issues with Tailwind
    const statusClasses = {
        emerald: {
            bg: 'bg-emerald-500/10',
            text: 'text-emerald-500',
            border: 'border-emerald-500/20',
            icon: 'bg-emerald-500/5 text-emerald-500/80 group-hover:bg-emerald-500/10 group-hover:text-emerald-500'
        },
        blue: {
            bg: 'bg-blue-500/10',
            text: 'text-blue-500',
            border: 'border-blue-500/20',
            icon: 'bg-blue-500/5 text-blue-500/80 group-hover:bg-blue-500/10 group-hover:text-blue-500'
        },
        slate: {
            bg: 'bg-slate-500/10',
            text: 'text-slate-500',
            border: 'border-slate-500/20',
            icon: 'bg-slate-500/5 text-slate-500/80 group-hover:bg-slate-500/10 group-hover:text-slate-500'
        },
        amber: {
            bg: 'bg-amber-500/10',
            text: 'text-amber-500',
            border: 'border-amber-500/20',
            icon: 'bg-amber-500/5 text-amber-500/80 group-hover:bg-amber-500/10 group-hover:text-amber-500'
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'emerald';
            case 'Scheduled': return 'blue';
            case 'Completed': return 'slate';
            default: return 'amber';
        }
    };

    useEffect(() => {
        fetchCampaigns();

        // Polling for real-time updates every 30 seconds
        const interval = setInterval(fetchCampaigns, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="flex flex-col h-screen items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-purple-600" size={48} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Synchronizing Marketing Matrix...</p>
        </div>
    );

    return (
        <div className="min-h-screen transition-colors duration-500 p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ backgroundColor: bgColor, color: textColor }}>
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-purple-600 p-2.5 rounded-xl shadow-lg shadow-purple-500/20">
                            <Megaphone size={20} className="text-white" />
                        </div>
                        <span className="text-purple-600 font-black text-[10px] uppercase tracking-[0.3em]">Marketing Core</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-4 uppercase" style={{ color: textColor }}>
                        CAMPAIGN <br /><span className="text-purple-600">INTEL</span>
                    </h1>
                    <p className="text-lg font-bold opacity-40 max-w-lg leading-relaxed uppercase tracking-tight">
                        Orchestrate marketing initiatives across all nodes. Real-time synchronization active.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={fetchCampaigns}
                        className="p-4 rounded-2xl border transition-all hover:bg-slate-500/5 group"
                        style={{ borderColor: borderColor, backgroundColor: cardBg }}
                        title="Manual Sync"
                    >
                        <Save size={20} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                    </button>
                    {canWrite && (
                        <button
                            onClick={openCreateModal}
                            className="bg-purple-600 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center gap-3"
                        >
                            <Plus size={20} /> Initialize Deployment
                        </button>
                    )}
                </div>
            </div>

            {/* Campaign Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {campaigns.map((camp, idx) => {
                    const colorKey = getStatusColor(camp.status);
                    const classes = statusClasses[colorKey];

                    return (
                        <div
                            key={camp._id}
                            onClick={() => canWrite && openEditModal(camp)}
                            className="p-8 rounded-[3rem] border hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative cursor-pointer overflow-hidden animate-in fade-in slide-in-from-bottom-8"
                            style={{
                                backgroundColor: cardBg,
                                borderColor: borderColor,
                                animationDelay: `${idx * 100}ms`
                            }}
                        >
                            {/* Decorative Glow */}
                            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${colorKey}-500/5 blur-[50px] group-hover:bg-${colorKey}-500/10 transition-all rounded-full`} />

                            <div className="flex justify-between items-start mb-8">
                                <div className={`p-4 rounded-2xl transition-all duration-500 ${classes.icon}`}>
                                    <Target size={28} />
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${classes.bg} ${classes.text} ${classes.border}`}>
                                    {camp.status}
                                </span>
                            </div>

                            <h3 className="text-2xl lg:text-3xl font-black mb-2 uppercase tracking-tight truncate pr-8" style={{ color: textColor }}>{camp.name}</h3>
                            <p className="text-sm font-bold opacity-30 uppercase tracking-wider mb-8 truncate">{camp.description || 'No brief summary provided'}</p>

                            <div className="grid grid-cols-2 gap-8 py-8 border-y border-dashed" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2">Magnitude</p>
                                    <div className="flex items-center gap-2 font-black text-xl" style={{ color: textColor }}>
                                        <Users size={18} className="text-blue-500" />
                                        {camp.reach || '0'}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2">Efficiency</p>
                                    <div className="flex items-center gap-2 font-black text-xl" style={{ color: textColor }}>
                                        <TrendingUp size={18} className="text-emerald-500" />
                                        {camp.roi || '0%'}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-slate-500/5 rounded-lg border border-slate-500/10">
                                        <Calendar size={14} className="opacity-40" />
                                    </div>
                                    <div className="text-[10px] font-black opacity-30 uppercase tracking-widest">
                                        Term: {camp.startDate ? new Date(camp.startDate).toLocaleDateString() : 'TBD'}
                                    </div>
                                </div>

                                {canDelete && (
                                    <button
                                        onClick={(e) => handleDelete(e, camp._id)}
                                        className="p-3 rounded-2xl hover:bg-red-500/10 text-red-500 transition-all active:scale-75"
                                        title="Force Purge"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Initializer Button */}
                {canWrite && (
                    <div
                        onClick={openCreateModal}
                        className="p-8 rounded-[3rem] border border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-slate-500/5 transition-all group min-h-[350px] animate-in fade-in"
                        style={{ borderColor: borderColor }}
                    >
                        <div className="p-8 bg-slate-500/5 rounded-[2rem] mb-6 group-hover:scale-110 group-hover:bg-purple-600/5 transition-all border border-transparent group-hover:border-purple-600/20">
                            <Plus size={48} className="opacity-20 group-hover:opacity-100 group-hover:text-purple-600 transition-all" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] opacity-30 group-hover:opacity-100 group-hover:text-purple-600 transition-all">Initialize New Matrix</h3>
                    </div>
                )}
            </div>

            {/* Campaign Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xl p-6 animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl p-12 rounded-[4rem] shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden relative" style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 blur-[80px] -mr-32 -mt-32" />

                        <div className="flex justify-between items-center mb-10 relative z-10">
                            <div>
                                <h2 className="text-4xl font-black uppercase tracking-tighter" style={{ color: textColor }}>
                                    {isEditing ? 'Sync' : 'Init'} <span className="text-purple-600">Protocol</span>
                                </h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">Fragment Synchronization Active</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-4 rounded-full hover:bg-red-500/10 text-red-500 transition-all active:scale-90 bg-slate-500/5">
                                <X size={28} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">Campaign Identifier</label>
                                <input
                                    type="text" name="name" value={formData.name} onChange={handleInputChange} required
                                    placeholder="Enter Designation..."
                                    className="w-full p-6 rounded-3xl border bg-slate-500/5 outline-none focus:ring-4 ring-purple-600/10 transition-all font-bold text-lg"
                                    style={{ borderColor: borderColor, color: textColor }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">Current Status</label>
                                    <select
                                        name="status" value={formData.status} onChange={handleInputChange}
                                        className="w-full p-6 rounded-3xl border bg-slate-500/5 outline-none focus:ring-4 ring-purple-600/10 transition-all font-bold"
                                        style={{ borderColor: borderColor, color: textColor, backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#fff' }}
                                    >
                                        <option value="Draft">Draft Mode</option>
                                        <option value="Scheduled">Scheduled Task</option>
                                        <option value="Active">Active Operation</option>
                                        <option value="Completed">Mission Complete</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">Financial Budget</label>
                                    <div className="relative">
                                        <DollarSign size={20} className="absolute left-6 top-6 opacity-30" />
                                        <input
                                            type="number" name="budget" value={formData.budget} onChange={handleInputChange}
                                            placeholder="0.00"
                                            className="w-full p-6 pl-14 rounded-3xl border bg-slate-500/5 outline-none focus:ring-4 ring-purple-600/10 transition-all font-black"
                                            style={{ borderColor: borderColor, color: textColor }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">Intelligence Reach</label>
                                    <input
                                        type="text" name="reach" value={formData.reach} onChange={handleInputChange} placeholder="e.g. 150K"
                                        className="w-full p-6 rounded-3xl border bg-slate-500/5 outline-none focus:ring-4 ring-purple-600/10 transition-all font-bold"
                                        style={{ borderColor: borderColor, color: textColor }}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">Target ROI</label>
                                    <input
                                        type="text" name="roi" value={formData.roi} onChange={handleInputChange} placeholder="e.g. 400%"
                                        className="w-full p-6 rounded-3xl border bg-slate-500/5 outline-none focus:ring-4 ring-purple-600/10 transition-all font-bold"
                                        style={{ borderColor: borderColor, color: textColor }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">Commencement</label>
                                    <input
                                        type="date" name="startDate" value={formData.startDate} onChange={handleInputChange}
                                        className="w-full p-6 rounded-3xl border bg-slate-500/5 outline-none focus:ring-4 ring-purple-600/10 transition-all font-bold"
                                        style={{ borderColor: borderColor, color: textColor }}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">Termination</label>
                                    <input
                                        type="date" name="endDate" value={formData.endDate} onChange={handleInputChange}
                                        className="w-full p-6 rounded-3xl border bg-slate-500/5 outline-none focus:ring-4 ring-purple-600/10 transition-all font-bold"
                                        style={{ borderColor: borderColor, color: textColor }}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full py-8 rounded-[2rem] bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-[0.3em] shadow-2xl shadow-purple-900/40 transition-all active:scale-95 text-sm mt-4">
                                {isEditing ? 'COMMIT SYNCHRONIZATION' : 'EXECUTE DEPLOYMENT'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Campaigns;
