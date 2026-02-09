import React, { useEffect } from 'react';
import { useLeads } from '../hooks/useLeads';
import { useAccessControl } from '../context/AccessControlContext';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS } from '../security/policy';
import { ClipboardCheck, Loader2, Link as LinkIcon, CheckCircle2, User, Mail, Phone, Building, DollarSign, Globe, AlertCircle } from 'lucide-react';

const MyRequests = () => {
    const { leads, loading, error, fetchLeads, updateLeadStatus } = useLeads();
    const { can } = useAccessControl();
    const { theme } = useTheme();
    const { userId } = useAuth();

    const isDark = theme === 'dark' || theme === 'night';
    const bgColor = theme === 'light' ? '#f8fafc' : theme === 'dark' ? '#0f172a' : '#020617';
    const cardBg = theme === 'light' ? '#ffffff' : theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(15, 23, 42, 0.5)';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const subTextColor = isDark ? '#94a3b8' : '#64748b';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0';

    useEffect(() => {
        if (can(PERMISSIONS.LEADS.FULFILL) && userId) {
            fetchLeads({ assignedTo: userId });
        }
    }, [fetchLeads, can, userId]);

    const handleProcess = async (id) => {
        const result = await updateLeadStatus(id, 'Processing');
        if (!result.success) alert(result.error);
    };

    const handleComplete = async (id) => {
        if (window.confirm('Mark this request as completely resolved?')) {
            const result = await updateLeadStatus(id, 'Completed');
            if (!result.success) alert(result.error);
        }
    };

    const handleAcceptMission = async (id) => {
        const result = await updateLeadStatus(id, 'Accepted');
        if (!result.success) alert(result.error);
    };

    // Filter leads assigned to the current user
    const myWorkItems = leads.filter(l => {
        const leadAssignedToId = l.assignedTo?._id?.toString() || l.assignedTo?.id?.toString() || l.assignedTo?.toString();
        const currentUserId = userId?.toString();

        // Include 'New' status so users can see and accept new assignments
        return leadAssignedToId === currentUserId &&
            ['New', 'Accepted', 'Processing', 'Completed', 'Denied'].includes(l.status);
    });

    const StatusBadge = ({ status }) => {
        const baseClasses = "px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest";

        switch (status) {
            case 'New':
                return <span className={`${baseClasses} bg-emerald-500/10 text-emerald-500 border-emerald-500/20`}>Pending Acceptance</span>;
            case 'Accepted':
            case 'Approved':
                return <span className={`${baseClasses} bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]`}>Accepted</span>;
            case 'Processing':
                return <span className={`${baseClasses} bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]`}>Processing</span>;
            case 'Completed':
                return <span className={`${baseClasses} bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]`}>Completed</span>;
            case 'Denied':
                return <span className={`${baseClasses} bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]`}>Denied</span>;
            default:
                return <span className={`${baseClasses} bg-slate-500/10 text-slate-500 border-slate-500/20`}>{status}</span>;
        }
    };

    if (!can(PERMISSIONS.LEADS.FULFILL)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen transition-colors duration-500" style={{ backgroundColor: bgColor }}>
                <div className="p-12 rounded-[2.5rem] shadow-xl border text-center max-w-md" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                    <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ClipboardCheck size={36} className="text-red-500" />
                    </div>
                    <h2 className="text-2xl font-black mb-2 uppercase tracking-tight" style={{ color: textColor }}>Access Restricted</h2>
                    <p className="leading-relaxed" style={{ color: subTextColor }}>Your clearance level does not permit access to the fulfillment workspace.</p>
                </div>
            </div>
        );
    }

    if (loading && leads.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen transition-colors duration-500" style={{ backgroundColor: bgColor }}>
                <Loader2 size={48} className="text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen transition-colors duration-500 p-10 font-sans" style={{ backgroundColor: bgColor, color: textColor }}>
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-4 mb-2">
                    <div className="bg-blue-500 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
                        <ClipboardCheck size={32} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight leading-none" style={{ color: textColor }}>My Fulfillment Requests</h1>
                </div>
                <p className="text-lg ml-16" style={{ color: subTextColor }}>Active mission intelligence for operational processing and completion.</p>
            </div>

            {/* Content */}
            <div className="overflow-hidden shadow-sm" style={{ backgroundColor: cardBg, borderRadius: '24px', border: `1px solid ${borderColor}` }}>
                <table className="w-full border-collapse">
                    <thead>
                        <tr style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f1f5f9' }}>
                            <th className="py-5 px-6 text-left text-xs font-black uppercase tracking-widest" style={{ color: subTextColor }}>Lead Intelligence</th>
                            <th className="hidden lg:table-cell py-5 px-6 text-left text-xs font-black uppercase tracking-widest" style={{ color: subTextColor }}>Contact Points</th>
                            <th className="hidden md:table-cell py-5 px-6 text-left text-xs font-black uppercase tracking-widest" style={{ color: subTextColor }}>Vitals & Origin</th>
                            <th className="py-5 px-6 text-left text-xs font-black uppercase tracking-widest" style={{ color: subTextColor }}>Mission Status</th>
                            <th className="py-5 px-6 text-left text-xs font-black uppercase tracking-widest" style={{ color: subTextColor }}>Operational Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myWorkItems.length > 0 ? (
                            myWorkItems.map(item => (
                                <tr key={item._id || item.id} className="transition-colors duration-200 border-b last:border-0 hover:bg-slate-500/5" style={{ borderColor: borderColor }}>
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                                                <User size={20} style={{ color: subTextColor }} />
                                            </div>
                                            <div>
                                                <div className="text-lg font-black" style={{ color: textColor }}>{item.name}</div>
                                                <div className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-wider mt-1" style={{ color: subTextColor }}>
                                                    <Building size={12} /> {item.company}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="hidden lg:table-cell p-6">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 font-medium text-sm" style={{ color: subTextColor }}>
                                                <Mail size={14} /> {item.email}
                                            </div>
                                            <div className="flex items-center gap-2 font-medium text-sm" style={{ color: subTextColor }}>
                                                <Phone size={14} /> {item.phone_number}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="hidden md:table-cell p-6">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 font-black text-sm" style={{ color: textColor }}>
                                                <DollarSign size={14} className="text-green-500" /> {item.value || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2 font-bold text-[11px] uppercase tracking-wide" style={{ color: subTextColor }}>
                                                <Globe size={14} /> {item.source || 'Web Channel'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <StatusBadge status={item.status} />
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-wrap gap-3 items-center">
                                            {/* Action: Accept (Only if New) */}
                                            {item.status === 'New' && (
                                                <button
                                                    onClick={() => handleAcceptMission(item._id || item.id)}
                                                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                                                >
                                                    <CheckCircle2 size={16} /> Accept Mission
                                                </button>
                                            )}

                                            {/* Action: Start Processing (Only if Accepted) */}
                                            {(item.status === 'Accepted' || item.status === 'Approved') && (
                                                <button
                                                    onClick={() => handleProcess(item._id || item.id)}
                                                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-500 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                                                >
                                                    <Loader2 size={16} className="animate-spin-slow" /> Start Processing
                                                </button>
                                            )}

                                            {/* Action: G-Form & Complete (Only if Processing) */}
                                            {item.status === 'Processing' && (
                                                <>
                                                    <a
                                                        href="[INSERT_GFORM_LINK_HERE]"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 border hover:bg-slate-500/5"
                                                        style={{ borderColor: borderColor, color: subTextColor }}
                                                    >
                                                        <LinkIcon size={16} /> Fill Details
                                                    </a>

                                                    <button
                                                        onClick={() => handleComplete(item._id || item.id)}
                                                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                                                    >
                                                        <CheckCircle2 size={16} /> Mark Complete
                                                    </button>
                                                </>
                                            )}

                                            {/* Completed State */}
                                            {item.status === 'Completed' && (
                                                <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest italic py-3" style={{ color: subTextColor }}>
                                                    <CheckCircle2 size={16} /> Mission Synchronized
                                                </div>
                                            )}

                                            {/* Denied State */}
                                            {item.status === 'Denied' && (
                                                <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest italic py-3 text-red-500/60">
                                                    <AlertCircle size={16} /> Clearance Revoked
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-32 text-center" style={{ color: subTextColor }}>
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="p-8 rounded-full" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                                            <ClipboardCheck size={64} className="opacity-50" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black uppercase tracking-tight opacity-70">Queue Depleted</h3>
                                            <p className="font-medium opacity-50">No active fulfillment requests are currently pending assignment.</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyRequests;
