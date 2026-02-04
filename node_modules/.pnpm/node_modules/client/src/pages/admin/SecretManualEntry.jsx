import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { secretApi } from '../../lib/api';
import {
    Zap, Save, ArrowLeft, ShieldCheck,
    MessageSquare, DollarSign, Star, Ghost, RefreshCw, Layers, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';

const SecretManualEntry = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { theme } = useTheme();

    const [formData, setFormData] = useState({
        eventName: '',
        actualCost: '',
        satisfactionScore: 5,
        internalNotes: '',
        revenue: '',
        successRate: '',
    });

    const [overrideMetric, setOverrideMetric] = useState('totalROI');
    const [overrideValue, setOverrideValue] = useState('');
    const [status, setStatus] = useState(null);

    const isDark = theme === 'dark' || theme === 'night';
    const bgColor = theme === 'light' ? '#f8fafc' : theme === 'dark' ? '#0f172a' : '#020617';
    const cardBg = theme === 'light' ? '#ffffff' : theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(15, 23, 42, 0.5)';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0';

    const mutation = useMutation({
        mutationFn: (newData) => secretApi.post('/manual-entry', newData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['analyticsSummary'] });
            setStatus({ type: 'success', message: 'Intelligence Fragment Committed.' });
            setFormData({ eventName: '', actualCost: '', satisfactionScore: 5, internalNotes: '', revenue: '', successRate: '' });
            setTimeout(() => setStatus(null), 3000);
        },
        onError: () => setStatus({ type: 'error', message: 'Security Handshake Failed.' })
    });

    const overrideMutation = useMutation({
        mutationFn: (newData) => secretApi.post('/override', newData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['analyticsSummary'] });
            setStatus({ type: 'success', message: 'Override Protocol Synchronized.' });
            setOverrideValue('');
            setTimeout(() => setStatus(null), 3000);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate({
            ...formData,
            actualCost: parseFloat(formData.actualCost),
            revenue: parseFloat(formData.revenue),
            satisfactionScore: parseInt(formData.satisfactionScore),
        });
    };

    const handleOverrideSubmit = (e) => {
        e.preventDefault();
        overrideMutation.mutate({
            metricKey: overrideMetric,
            value: parseFloat(overrideValue),
            isEnabled: true
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen transition-colors duration-500 flex flex-col items-center justify-center p-6 gap-8" style={{ backgroundColor: bgColor, color: textColor }}>
            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Main Entry Section */}
                <div className="lg:col-span-8 border rounded-[3rem] shadow-2xl p-10 relative overflow-hidden transition-all" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                    <div className="relative z-10 text-left">
                        <button
                            onClick={() => navigate('/analytics')}
                            className="flex items-center gap-2 mb-10 transition-all opacity-40 hover:opacity-100"
                            style={{ color: textColor }}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Return to Core</span>
                        </button>

                        <div className="flex items-start gap-6 mb-12">
                            <div className="p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tighter" style={{ color: textColor }}>Intelligence Injection</h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mt-2">Manual Data Commitment Protocol</p>
                            </div>
                        </div>

                        {status && (
                            <div className={`mb-10 p-6 rounded-2xl border flex items-center gap-4 animate-in fade-in zoom-in duration-500 ${status.type === 'success'
                                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'
                                    : 'bg-red-500/5 border-red-500/20 text-red-500'
                                }`}>
                                {status.type === 'success' ? <Zap className="w-5 h-5" /> : <Ghost className="w-5 h-5" />}
                                <span className="font-black text-xs uppercase tracking-widest">{status.message}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-10 text-left">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center justify-between">
                                        Identity <span className="text-[9px] lowercase italic">(Dashboard: Log Entity)</span>
                                    </label>
                                    <input
                                        name="eventName"
                                        value={formData.eventName}
                                        onChange={handleChange}
                                        placeholder="MISSION_NAME_DELTA"
                                        className="w-full bg-slate-500/5 border rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-black text-sm uppercase placeholder:opacity-20"
                                        style={{ borderColor: borderColor, color: textColor }}
                                        required
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center justify-between">
                                        Expenditure <span className="text-[9px] lowercase italic">(Dashboard: Cost)</span>
                                    </label>
                                    <input
                                        name="actualCost"
                                        value={formData.actualCost}
                                        onChange={handleChange}
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full bg-slate-500/5 border rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-sm"
                                        style={{ borderColor: borderColor, color: textColor }}
                                        required
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center justify-between">
                                        Magnitude <span className="text-[9px] lowercase italic">(Dashboard: Revenue)</span>
                                    </label>
                                    <input
                                        name="revenue"
                                        value={formData.revenue}
                                        onChange={handleChange}
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full bg-slate-500/5 border rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-sm"
                                        style={{ borderColor: borderColor, color: textColor }}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center justify-between">
                                        Efficiency <span className="text-[9px] lowercase italic">(Dashboard: Radar)</span>
                                    </label>
                                    <div className="flex items-center gap-8 bg-slate-500/5 border p-5 rounded-2xl" style={{ borderColor: borderColor }}>
                                        <input
                                            name="satisfactionScore"
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={formData.satisfactionScore}
                                            onChange={handleChange}
                                            className="flex-1 h-1 bg-emerald-500/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                        />
                                        <span className="text-xl font-black text-emerald-500 w-6 text-center">{formData.satisfactionScore}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={mutation.isPending}
                                className="w-full bg-emerald-500 text-slate-950 font-black py-6 rounded-[1.5rem] shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
                            >
                                {mutation.isPending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Commit Fragment</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Overrides Section */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="border rounded-[3rem] p-10 relative overflow-hidden transition-all shadow-xl h-full" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <div className="relative z-10 flex flex-col text-left h-full">
                            <div className="flex items-start gap-4 mb-10">
                                <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-500">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-xl font-black tracking-tight" style={{ color: textColor }}>Alpha Overrides</h2>
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mt-1">Manual Hierarchy Logic</p>
                                </div>
                            </div>

                            <form onSubmit={handleOverrideSubmit} className="space-y-10 flex-1 flex flex-col">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Target Vector</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            { key: 'totalROI', label: 'Growth ROI Card' },
                                            { key: 'totalLeads', label: 'Active Leads Card' },
                                            { key: 'conversionRate', label: 'Conversion Card' },
                                            { key: 'totalEvents', label: 'Total Events Card' }
                                        ].map((m) => (
                                            <button
                                                key={m.key}
                                                type="button"
                                                onClick={() => setOverrideMetric(m.key)}
                                                className={`px-5 py-4 rounded-2xl text-left text-[10px] font-black transition-all border uppercase tracking-widest ${overrideMetric === m.key
                                                        ? 'bg-blue-500 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                                                        : 'bg-slate-500/5 border-transparent opacity-40 hover:opacity-100'
                                                    }`}
                                                style={{ color: overrideMetric === m.key ? '#fff' : textColor, borderColor: overrideMetric === m.key ? '#3b82f6' : borderColor }}
                                            >
                                                {m.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Override Magnitude</label>
                                    <input
                                        value={overrideValue}
                                        onChange={(e) => setOverrideValue(e.target.value)}
                                        placeholder="VALUE_INPUT..."
                                        className="w-full bg-slate-500/5 border rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-black text-sm"
                                        style={{ borderColor: borderColor, color: textColor }}
                                        required
                                    />
                                </div>

                                <button
                                    className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/10 flex items-center justify-center gap-3 transition-all active:scale-95 uppercase tracking-widest text-xs"
                                >
                                    <Eye className="w-4 h-4" /> Force Injection
                                </button>

                                <p className="text-[8px] font-black opacity-20 uppercase tracking-[0.2em] mt-6 leading-relaxed">
                                    * FORCED INJECTION WILL OVERRIDE AUTOMATED AGGREGATIONS IMMEDIATELY. VERIFICATION INDICATORS WILL DEPLOY.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecretManualEntry;
