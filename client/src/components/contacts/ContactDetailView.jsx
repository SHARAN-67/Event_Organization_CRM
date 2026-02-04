
import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building, Briefcase, Trash2, Save, Loader2, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { useContacts } from '../../hooks/useContacts';
import { useTheme } from '../../theme/ThemeContext';

const ContactDetailView = ({ contactId, isOpen, onClose, onRefresh }) => {
    const { getContact, updateContact, deleteContact, createContact } = useContacts();
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });

    // Theme-aware colors
    const isDark = theme === 'dark' || theme === 'night';
    const panelBg = isDark ? '#1e293b' : '#ffffff';
    const headerBg = isDark ? '#0f172a' : '#ffffff';
    const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
    const textSecondary = isDark ? '#94a3b8' : '#64748b';
    const inputBg = isDark ? '#0f172a' : '#f8fafc';
    const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
    const buttonBg = isDark ? '#3b82f6' : '#18181b';
    const buttonHover = isDark ? '#2563eb' : '#27272a';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        phone_number: '',
        role: '',
        type: 'attendee'
    });

    // Hydration Logic: Fetch details when contactId changes
    useEffect(() => {
        if (isOpen) {
            if (contactId) {
                fetchContactDetails(contactId);
            } else {
                // Reset for Create Mode
                setFormData({
                    name: '',
                    email: '',
                    company: '',
                    phone_number: '',
                    role: '',
                    type: 'attendee'
                });
                setStatus({ type: '', msg: '' });
            }
        }
    }, [contactId, isOpen]);

    const fetchContactDetails = async (id) => {
        setLoading(true);
        setStatus({ type: '', msg: '' });
        try {
            const data = await getContact(id);
            setFormData({
                name: data.name || '',
                email: data.email || '',
                company: data.company || '',
                phone_number: data.phone_number || '',
                role: data.role || '',
                type: data.type || 'attendee'
            });
        } catch (err) {
            setStatus({ type: 'error', msg: 'Failed to synchronize contact intelligence.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setStatus({ type: '', msg: '' });
        try {
            if (contactId) {
                await updateContact(contactId, formData);
                setStatus({ type: 'success', msg: 'Intelligence record updated.' });
            } else {
                await createContact(formData);
                setStatus({ type: 'success', msg: 'New contact record initialized.' });
                setTimeout(() => onClose(), 1500);
            }
            onRefresh();
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.message || 'Transmission failed.' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Decommission this contact intelligence record?')) return;
        setActionLoading(true);
        try {
            await deleteContact(contactId);
            onRefresh();
            onClose();
        } catch (err) {
            setStatus({ type: 'error', msg: 'Decommissioning failed.' });
        } finally {
            setActionLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden font-['Inter']">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                <div className={`w-screen max-w-md transform transition-all duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="h-full flex flex-col shadow-2xl rounded-l-[3rem] overflow-hidden" style={{ backgroundColor: panelBg }}>

                        {/* Header */}
                        <div className="p-8 border-b flex items-center justify-between" style={{ backgroundColor: headerBg, borderColor: inputBorder }}>
                            <div>
                                <h2 className="text-3xl font-black tracking-tight leading-none uppercase" style={{ color: textPrimary }}>
                                    {contactId ? 'Contact Intelligence' : 'New Intelligence'}
                                </h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-3" style={{ color: textSecondary }}>
                                    {contactId ? `ID: ${contactId.slice(-8)}` : 'Entry Mode: Initialization'}
                                </p>
                            </div>
                            <button onClick={onClose} className="p-2.5 rounded-xl hover:opacity-80 transition-all shadow-lg" style={{ backgroundColor: buttonBg, color: '#ffffff' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form Content */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-8">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="animate-spin text-blue-500" size={48} />
                                </div>
                            ) : (
                                <form onSubmit={handleSave} className="space-y-6">

                                    {/* Personal Intel */}
                                    <div className="space-y-4 font-['Inter']">
                                        <label className="text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 mb-4" style={{ color: textSecondary }}>
                                            <User size={14} /> Contact Profile
                                        </label>
                                        <div className="rounded-2xl p-1 shadow-sm" style={{ backgroundColor: inputBg, border: `1px solid ${inputBorder}` }}>
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                className="w-full bg-transparent p-4 font-bold outline-none"
                                                style={{ color: textPrimary }}
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="relative rounded-2xl p-1 shadow-sm flex items-center" style={{ backgroundColor: inputBg, border: `1px solid ${inputBorder}` }}>
                                            <Mail className="ml-4" size={18} style={{ color: textSecondary }} />
                                            <input
                                                type="email"
                                                placeholder="Email Address"
                                                className="w-full bg-transparent p-4 font-bold outline-none"
                                                style={{ color: textPrimary }}
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="relative rounded-2xl p-1 shadow-sm flex items-center" style={{ backgroundColor: inputBg, border: `1px solid ${inputBorder}` }}>
                                            <Phone className="ml-4" size={18} style={{ color: textSecondary }} />
                                            <input
                                                type="text"
                                                placeholder="Phone Number"
                                                className="w-full bg-transparent p-4 font-bold outline-none"
                                                style={{ color: textPrimary }}
                                                value={formData.phone_number}
                                                onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Professional Intel */}
                                    <div className="space-y-4 font-['Inter']">
                                        <label className="text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 mb-4" style={{ color: textSecondary }}>
                                            <Building size={14} /> Organizational Intel
                                        </label>
                                        <div className="relative rounded-2xl p-1 shadow-sm flex items-center" style={{ backgroundColor: inputBg, border: `1px solid ${inputBorder}` }}>
                                            <Building className="ml-4" size={18} style={{ color: textSecondary }} />
                                            <input
                                                type="text"
                                                placeholder="Company / Entity"
                                                className="w-full bg-transparent p-4 font-bold outline-none"
                                                style={{ color: textPrimary }}
                                                value={formData.company}
                                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                                            />
                                        </div>
                                        <div className="relative rounded-2xl p-1 shadow-sm flex items-center" style={{ backgroundColor: inputBg, border: `1px solid ${inputBorder}` }}>
                                            <Briefcase className="ml-4" size={18} style={{ color: textSecondary }} />
                                            <input
                                                type="text"
                                                placeholder="Designated Role"
                                                className="w-full bg-transparent p-4 font-bold outline-none"
                                                style={{ color: textPrimary }}
                                                value={formData.role}
                                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Type Selector */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.15em] mb-4" style={{ color: textSecondary }}>Classification Type</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['attendee', 'vendor', 'speaker', 'sponsor'].map(t => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, type: t })}
                                                    className={`p-5 rounded-xl font-black text-[12px] uppercase tracking-[0.2em] transition-all duration-300`}
                                                    style={{
                                                        backgroundColor: formData.type === t ? buttonBg : inputBg,
                                                        color: formData.type === t ? '#ffffff' : textSecondary,
                                                        border: formData.type === t ? `2px solid ${buttonBg}` : `2px solid ${inputBorder}`
                                                    }}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Status Feed */}
                                    {status.msg && (
                                        <div className={`flex items-center gap-3 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2 ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                            <span className="font-bold text-xs uppercase tracking-tight">{status.msg}</span>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="pt-8 flex gap-4" style={{ borderTop: `1px solid ${inputBorder}` }}>
                                        <button
                                            type="submit"
                                            disabled={actionLoading}
                                            className="flex-1 p-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                            style={{ backgroundColor: buttonBg, color: '#ffffff' }}
                                        >
                                            {actionLoading ? <Loader2 className="animate-spin" size={18} /> : (contactId ? <Save size={18} /> : <Plus size={18} />)}
                                            {contactId ? 'Commit Intel' : 'Initialize'}
                                        </button>

                                        {contactId && (
                                            <button
                                                type="button"
                                                onClick={handleDelete}
                                                disabled={actionLoading}
                                                className="p-6 rounded-2xl transition-all shadow-lg flex items-center justify-center disabled:opacity-50"
                                                style={{ backgroundColor: isDark ? '#7f1d1d' : '#fef2f2', border: `2px solid ${isDark ? '#991b1b' : '#fecaca'}` }}
                                            >
                                                <Trash2 size={24} className="text-red-500" />
                                            </button>
                                        )}
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactDetailView;

