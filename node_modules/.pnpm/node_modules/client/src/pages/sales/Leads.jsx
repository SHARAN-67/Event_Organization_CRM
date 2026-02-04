import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit, Lock, Eye, Check, X, Shield, Filter, RefreshCw, Layers } from 'lucide-react';
import { useLeads } from '../../hooks/useLeads';
import { useAccessControl } from '../../context/AccessControlContext';
import { useTheme } from '../../theme/ThemeContext';
import Restricted from '../../components/common/Restricted';
import { PERMISSIONS } from '../../security/policy';
import LeadFormDialog from '../../components/leads/LeadFormDialog';

import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Leads = () => {
    const { leads, loading, error, fetchLeads, addLead, updateLead, deleteLead, updateLeadStatus } = useLeads();
    const { can } = useAccessControl();
    const { userRole } = useAuth();
    const { theme } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [assistants, setAssistants] = useState([]);
    const [assigningLeadId, setAssigningLeadId] = useState(null);
    const [selectedAssistantId, setSelectedAssistantId] = useState('');

    useEffect(() => {
        if (can(PERMISSIONS.LEADS.VIEW)) {
            fetchLeads();
        }

        // Fetch users for assignment (Assistants + Planners)
        const fetchAssistants = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/auth/users', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Allow assignment to Assistants, Planners, and Lead Planners
                const rolesToAssign = ['Assistant', 'Planner', 'Lead Planner'];
                const assistantUsers = res.data.filter(u => rolesToAssign.includes(u.role));
                setAssistants(assistantUsers);
                if (assistantUsers.length > 0) setSelectedAssistantId(assistantUsers[0]._id);
            } catch (err) {
                console.error("Failed to fetch assistants", err);
            }
        };

        if (userRole === 'Admin' || userRole === 'Lead Planner') {
            fetchAssistants();
        }
    }, [fetchLeads, can, userRole]);

    const isDark = theme === 'dark' || theme === 'night';
    const bgColor = theme === 'light' ? '#f8fafc' : theme === 'dark' ? '#0f172a' : '#020617';
    const cardBg = theme === 'light' ? '#ffffff' : theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(15, 23, 42, 0.5)';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const subTextColor = isDark ? '#94a3b8' : '#64748b';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0';

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this lead?')) {
            const result = await deleteLead(id);
            if (!result.success) alert(result.error);
        }
    };

    const handleEditClick = (e, lead) => {
        e.stopPropagation();
        setSelectedLead(lead);
        setIsReadOnly(false);
        setIsDialogOpen(true);
    };

    const handleViewClick = (lead) => {
        setSelectedLead(lead);
        setIsReadOnly(true);
        setIsDialogOpen(true);
    };

    const handleAddClick = () => {
        setSelectedLead(null);
        setIsReadOnly(false);
        setIsDialogOpen(true);
    };

    const handleAccept = async (e, leadId) => {
        e.stopPropagation();
        if (!selectedAssistantId) {
            alert("Please select an assistant first.");
            return;
        }
        const result = await updateLeadStatus(leadId, 'Accepted', { assignedTo: selectedAssistantId });
        if (result.success) {
            setAssigningLeadId(null);
        } else {
            alert(result.error);
        }
    };

    const handleDeny = async (e, leadId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to deny this lead?')) {
            const result = await updateLeadStatus(leadId, 'Denied');
            if (!result.success) alert(result.error);
        }
    };

    const handleFormSubmit = async (formData) => {
        let result;
        if (selectedLead && !isReadOnly) {
            result = await updateLead(selectedLead._id || selectedLead.id, formData);
        } else {
            result = await addLead(formData);
        }

        if (result.success) {
            setIsDialogOpen(false);
        } else {
            alert(result.error);
        }
    };

    if (!can(PERMISSIONS.LEADS.VIEW)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Lock size={48} className="text-slate-500 opacity-20" />
                <h2 className="text-xl font-black uppercase tracking-widest opacity-40">Access Restricted</h2>
                <p className="text-sm font-bold opacity-30 text-center max-w-xs uppercase leading-relaxed">
                    Clearance Level 4 Required for Pipeline Access
                </p>
            </div>
        );
    }

    if (loading && leads.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-emerald-500">
            <RefreshCw className="animate-spin w-10 h-10 mb-4" />
            <span className="font-mono text-[10px] font-black tracking-[0.3em] uppercase">Decrypting Pipeline...</span>
        </div>
    );

    const filteredLeads = leads.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="min-h-screen transition-colors duration-500 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ backgroundColor: bgColor, color: textColor }}>
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3" style={{ color: textColor }}>
                        <div className="w-2 h-10 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
                        LEAD PIPELINE
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] font-black rounded border border-blue-500/20 uppercase tracking-widest">Active Ops</span>
                        <p className="text-xs font-bold opacity-40 uppercase tracking-wider">Synchronized with Core Grid</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                    <div className="flex-1 lg:flex-none relative group">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH_CODENAME..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border rounded-2xl pl-12 pr-6 py-3 text-xs font-black focus:outline-none transition-all w-full lg:w-64 uppercase tracking-widest"
                            style={{ backgroundColor: cardBg, borderColor: borderColor, color: textColor }}
                        />
                    </div>

                    <Restricted to={PERMISSIONS.LEADS.MANAGE}>
                        <button
                            onClick={handleAddClick}
                            className="flex items-center gap-2 bg-blue-500 text-white font-black px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest"
                        >
                            <Plus size={16} /> Deploy Lead
                        </button>
                    </Restricted>
                </div>
            </div>

            {/* Main Content Card (Bento Table) */}
            <div className="border rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ backgroundColor: theme === 'night' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Identity</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Contact Info</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Classification</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Status Vector</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-right">Magnitude</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: borderColor }}>
                            {filteredLeads.map((lead) => (
                                <tr
                                    key={lead._id || lead.id}
                                    onClick={() => handleViewClick(lead)}
                                    className="group hover:bg-slate-500/5 transition-colors cursor-pointer"
                                >
                                    <td className="px-8 py-6">
                                        <div className="font-black text-sm uppercase tracking-tight" style={{ color: textColor }}>{lead.name}</div>
                                        <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">{lead.company}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-xs font-bold" style={{ color: subTextColor }}>{lead.email}</div>
                                        <div className="text-[10px] font-mono opacity-40 mt-1">{lead.phone_number}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border rounded-lg" style={{ borderColor: borderColor }}>
                                            <Layers size={12} className="text-blue-500" />
                                            <span className="text-[10px] font-black uppercase" style={{ color: subTextColor }}>{lead.source || 'Direct'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${lead.status === 'Won' || lead.status === 'Accepted' || lead.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                            lead.status === 'Lost' || lead.status === 'Denied' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                            }`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="font-black text-sm" style={{ color: textColor }}>
                                            ${(parseFloat(lead.value?.replace(/[^0-9.]/g, '')) || 0).toLocaleString()}
                                        </div>
                                        <div className="text-[10px] font-bold opacity-30 mt-1 uppercase tracking-tighter">Projected Yield</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
                                            {(userRole === 'Admin' || userRole === 'Lead Planner' || userRole === 'Planner') && lead.status === 'New' && (
                                                <div className="flex items-center gap-2">
                                                    {assigningLeadId === lead._id ? (
                                                        <div className="flex items-center gap-2 animate-in zoom-in duration-200">
                                                            <select
                                                                value={selectedAssistantId}
                                                                onChange={(e) => setSelectedAssistantId(e.target.value)}
                                                                className="text-[10px] font-black uppercase tracking-widest bg-slate-900 border rounded-lg px-2 py-1 focus:outline-none"
                                                                style={{ borderColor: borderColor, color: textColor }}
                                                            >
                                                                {assistants.map(a => (
                                                                    <option key={a._id} value={a._id}>
                                                                        {a.name} ({a.role})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <button
                                                                onClick={(e) => handleAccept(e, lead._id || lead.id)}
                                                                className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-all border border-emerald-500/20"
                                                                title="Confirm Acceptance"
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setAssigningLeadId(null); }}
                                                                className="p-1.5 bg-slate-500/10 hover:bg-slate-500/20 text-slate-500 rounded-lg transition-all border border-slate-500/20"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setAssigningLeadId(lead._id); }}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-emerald-500/20 shadow-sm shadow-emerald-500/5"
                                                            >
                                                                <Check size={14} /> Accept
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDeny(e, lead._id || lead.id)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-red-500/20 shadow-sm shadow-red-500/5"
                                                            >
                                                                <X size={14} /> Deny
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                            <button
                                                onClick={(e) => handleEditClick(e, lead)}
                                                className="p-2 hover:bg-blue-500/10 rounded-xl text-blue-500 transition-all border border-transparent hover:border-blue-500/20"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(e, lead._id || lead.id)}
                                                className="p-2 hover:bg-red-500/10 rounded-xl text-red-500 transition-all border border-transparent hover:border-red-500/20"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredLeads.length === 0 && (
                    <div className="py-32 flex flex-col items-center justify-center text-center px-10">
                        <div className="p-8 bg-slate-500/5 rounded-[2rem] mb-6 border border-dashed" style={{ borderColor: borderColor }}>
                            <Search size={40} className="text-slate-500 opacity-20" />
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-widest opacity-40">No Lead Matches Found</h3>
                        <p className="mt-2 text-xs font-bold opacity-30 max-w-xs leading-relaxed uppercase">
                            Adjust your filters or deploy a new intelligence fragment into the pipeline.
                        </p>
                    </div>
                )}
            </div>

            <LeadFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                initialData={selectedLead}
                onSubmit={handleFormSubmit}
                readOnly={isReadOnly}
            />
        </div>
    );
};

export default Leads;
