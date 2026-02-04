import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
    BarChart3, PieChart, TrendingUp,
    Calendar, Download, RefreshCw,
    FileText, Zap, Shield, Plus,
    MoreVertical, Edit, Trash2, X,
    ChevronRight, ArrowUpRight, ArrowDownRight,
    Search, Filter, Globe, FileUp
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const Reports = () => {
    const { theme } = useTheme();
    const { hasPermission } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [selectedFile, setSelectedFile] = useState(null);

    // UI State
    const [showModal, setShowModal] = useState(false);
    const [editingReport, setEditingReport] = useState(null);
    const [formData, setFormData] = useState({
        reportTitle: '',
        period: '',
        category: 'Operational',
        status: 'Pending',
        notes: '',
        metrics: [
            { label: 'Event Attendance', value: '0', trend: 'stable' },
            { label: 'Net Revenue', value: '$0', trend: 'stable' }
        ]
    });

    const isDark = theme === 'dark' || theme === 'night';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const subTextColor = isDark ? '#94a3b8' : '#64748b';
    const cardBg = theme === 'light' ? '#ffffff' : theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(15, 23, 42, 0.5)';
    const bgColor = theme === 'light' ? '#f8fafc' : theme === 'dark' ? '#0f172a' : '#020617';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0';

    const canWrite = hasPermission('Reports', 'Write');
    const canDelete = hasPermission('Reports', 'Delete');

    const API_URL = 'http://localhost:5000/api/reports';

    const getAuthConfig = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API_URL, getAuthConfig());
            setReports(res.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch intelligence reports.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleOpenModal = (report = null) => {
        setSelectedFile(null);
        if (report) {
            setEditingReport(report);
            setFormData({
                reportTitle: report.reportTitle,
                period: report.period,
                category: report.category,
                status: report.status,
                notes: report.notes || '',
                metrics: report.metrics || []
            });
        } else {
            setEditingReport(null);
            setFormData({
                reportTitle: '',
                period: '',
                category: 'Operational',
                status: 'Pending',
                notes: '',
                metrics: [
                    { label: 'Event Attendance', value: '0', trend: 'stable' },
                    { label: 'Net Revenue', value: '$0', trend: 'stable' }
                ]
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('reportTitle', formData.reportTitle);
        data.append('period', formData.period);
        data.append('category', formData.category);
        data.append('status', formData.status);
        data.append('notes', formData.notes);
        data.append('metrics', JSON.stringify(formData.metrics));

        if (selectedFile) {
            data.append('file', selectedFile);
        }

        try {
            const config = {
                ...getAuthConfig(),
                headers: {
                    ...getAuthConfig().headers,
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (editingReport) {
                await axios.put(`${API_URL}/${editingReport._id}`, data, config);
            } else {
                await axios.post(API_URL, data, config);
            }
            fetchReports();
            setShowModal(false);
        } catch (err) {
            alert(err.response?.data?.error || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Decommission this report permanently?')) {
            try {
                await axios.delete(`${API_URL}/${id}`, getAuthConfig());
                fetchReports();
            } catch (err) {
                alert('Failed to delete report.');
            }
        }
    };

    const handleDownload = async (id, fileName) => {
        try {
            const response = await axios.get(`${API_URL}/download/${id}`, {
                responseType: 'blob',
                ...getAuthConfig()
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName || 'report-archive.dat');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Could not retrieve file from the secure vault.');
        }
    };

    const addMetric = () => {
        setFormData({
            ...formData,
            metrics: [...formData.metrics, { label: '', value: '', trend: 'stable' }]
        });
    };

    const removeMetric = (index) => {
        const newMetrics = formData.metrics.filter((_, i) => i !== index);
        setFormData({ ...formData, metrics: newMetrics });
    };

    const updateMetric = (index, field, value) => {
        const newMetrics = [...formData.metrics];
        newMetrics[index][field] = value;
        setFormData({ ...formData, metrics: newMetrics });
    };

    const filteredReports = reports.filter(r => {
        const matchesSearch = r.reportTitle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterCategory === 'All' || r.category === filterCategory;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen transition-colors duration-500 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ backgroundColor: bgColor, color: textColor }}>
            {/* Header Area */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3" style={{ color: textColor }}>
                        <div className="w-2 h-10 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.3)]" />
                        COMMAND INTELLIGENCE
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[10px] font-black rounded border border-indigo-500/20 uppercase tracking-widest">Operational Analytics</span>
                        <p className="text-xs font-bold opacity-40 uppercase tracking-tight">Real-time Data Stream: ACTIVE</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 transition-colors group-hover:text-indigo-400" />
                        <input
                            type="text"
                            placeholder="Scan Reports..."
                            className="pl-11 pr-6 py-3 rounded-2xl border text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all w-64"
                            style={{ backgroundColor: cardBg, borderColor: borderColor, color: textColor }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {canWrite && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 bg-indigo-600 text-white font-bold px-6 py-3 rounded-2xl text-[11px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20"
                        >
                            <Plus size={16} strokeWidth={3} /> Initialize Report
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Reports', value: reports.length, icon: <FileText size={20} />, color: 'indigo' },
                    { label: 'Active Drafts', value: reports.filter(r => r.status === 'Pending').length, icon: <RefreshCw size={20} />, color: 'amber' },
                    { label: 'Verified Files', value: reports.filter(r => r.status === 'Verified').length, icon: <Shield size={20} />, color: 'emerald' },
                    { label: 'Data Quality', value: '98.4%', icon: <Zap size={20} />, color: 'purple' }
                ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-[2rem] border group hover:scale-[1.02] transition-all duration-300" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500`}>
                                {stat.icon}
                            </div>
                            <span className="text-[10px] font-black opacity-20 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <div className="text-3xl font-black tracking-tight">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Reports Explorer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Filters & Navigation */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="p-6 rounded-[2.5rem] border sticky top-8" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-6 px-2">Category Filter</h3>
                        <div className="space-y-2">
                            {['All', 'Financial', 'Operational', 'Satisfaction', 'Growth', 'Security'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilterCategory(cat)}
                                    className={`w-full flex items-center justify-between px-5 py-3 rounded-2xl text-xs font-black transition-all ${filterCategory === cat
                                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                        : 'hover:bg-indigo-500/5 text-subTextColor'
                                        }`}
                                    style={{ color: filterCategory === cat ? 'white' : subTextColor }}
                                >
                                    {cat.toUpperCase()}
                                    {filterCategory === cat && <ChevronRight size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Report Cards Feed */}
                <div className="lg:col-span-9 space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 opacity-20">
                            <RefreshCw size={48} className="animate-spin mb-4" />
                            <p className="font-black uppercase tracking-widest text-xs">Accessing encrypted archives...</p>
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="p-20 border-2 border-dashed rounded-[3rem] text-center" style={{ borderColor: borderColor }}>
                            <div className="opacity-10 mb-6">
                                <Globe size={80} className="mx-auto" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No Reports Detected</h3>
                            <p className="text-sm opacity-50 mb-8 max-w-sm mx-auto">The intelligence archive for this category is currently empty. Initialize a new report to begin tracking.</p>
                            {canWrite && <Button onClick={() => handleOpenModal()} className="rounded-2xl">Create First Report</Button>}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredReports.map((report) => (
                                <div key={report._id} className="p-8 rounded-[3rem] border relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-500" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                                    {/* Status Badge */}
                                    <div className="flex justify-between items-start mb-8">
                                        <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${report.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                            report.status === 'Warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                            }`}>
                                            {report.status}
                                        </div>
                                        <div className="flex gap-2">
                                            {canWrite && <button onClick={() => handleOpenModal(report)} className="p-2 hover:bg-indigo-500/10 rounded-lg transition-colors text-indigo-500"><Edit size={16} /></button>}
                                            {canDelete && <button onClick={() => handleDelete(report._id)} className="p-2 hover:bg-rose-500/10 rounded-lg transition-colors text-rose-500"><Trash2 size={16} /></button>}
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black tracking-tighter mb-2 leading-none" style={{ color: textColor }}>{report.reportTitle}</h3>
                                    <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-8">{report.period} • {report.category}</p>

                                    {/* Metrics Horizontal Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        {report.metrics?.slice(0, 2).map((m, idx) => (
                                            <div key={idx} className="p-4 bg-slate-500/5 rounded-2xl border" style={{ borderColor: borderColor }}>
                                                <div className="text-[8px] font-black uppercase opacity-30 mb-1">{m.label}</div>
                                                <div className="flex items-center justify-between">
                                                    <div className="text-lg font-black">{m.value}</div>
                                                    {m.trend === 'up' ? <ArrowUpRight size={14} className="text-emerald-500" /> :
                                                        m.trend === 'down' ? <ArrowDownRight size={14} className="text-rose-500" /> :
                                                            <div className="w-2 h-0.5 bg-slate-500/30 rounded-full" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: borderColor }}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
                                            <span className="text-[10px] font-bold opacity-40 uppercase">{report.generatedBy}</span>
                                        </div>
                                        <div className="flex gap-4">
                                            {report.fileName && (
                                                <button
                                                    onClick={() => handleDownload(report._id, report.fileName)}
                                                    className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:gap-3 flex items-center gap-2 transition-all"
                                                >
                                                    <Download size={14} /> Dossier
                                                </button>
                                            )}
                                            <button className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:gap-3 flex items-center gap-2 transition-all">
                                                Analytics <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Initialize/Update Report */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] p-12 border shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh] custom-scrollbar" style={{ borderColor: borderColor }}>
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute right-10 top-10 p-3 hover:bg-slate-500/10 rounded-2xl transition-all"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-3xl font-black mb-8 tracking-tighter">
                            {editingReport ? 'UPDATE INTELLIGENCE' : 'INITIALIZE REPORT'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest opacity-40">Report Title</Label>
                                    <Input
                                        className="rounded-2xl py-6"
                                        value={formData.reportTitle}
                                        onChange={(e) => setFormData({ ...formData, reportTitle: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest opacity-40">Operational Period</Label>
                                    <Input
                                        className="rounded-2xl py-6"
                                        placeholder="e.g. Q1 2024"
                                        value={formData.period}
                                        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest opacity-40">Classification</Label>
                                    <select
                                        className="w-full px-4 py-4 rounded-2xl border bg-transparent text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        style={{ borderColor: borderColor }}
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Financial">Financial</option>
                                        <option value="Operational">Operational</option>
                                        <option value="Satisfaction">Satisfaction</option>
                                        <option value="Growth">Growth</option>
                                        <option value="Security">Security</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest opacity-40">Current Status</Label>
                                    <select
                                        className="w-full px-4 py-4 rounded-2xl border bg-transparent text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        style={{ borderColor: borderColor }}
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Pending">Pending Audit</option>
                                        <option value="Verified">Verified Alpha</option>
                                        <option value="Warning">Warning Flag</option>
                                        <option value="Archive">Archive Only</option>
                                    </select>
                                </div>
                            </div>

                            {/* File Upload Section */}
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest opacity-40">Attachment (PDF/DOCX/IMG)</Label>
                                <div
                                    className="relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all hover:border-indigo-500/50 group"
                                    style={{ borderColor: borderColor, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}
                                >
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        onChange={(e) => setSelectedFile(e.target.files[0])}
                                    />
                                    <FileUp size={32} className="text-indigo-500 mb-2 opacity-50 group-hover:scale-110 transition-transform" />
                                    <p className="text-xs font-bold opacity-40">
                                        {selectedFile ? selectedFile.name : 'Click or Drag to secure dossier'}
                                    </p>
                                </div>
                            </div>

                            {/* Metrics Section */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-xs font-black uppercase tracking-widest opacity-40">Core Metrics</Label>
                                    <button type="button" onClick={addMetric} className="text-[10px] font-black text-indigo-500 flex items-center gap-1 uppercase hover:opacity-70">
                                        <Plus size={14} /> Add Counter
                                    </button>
                                </div>
                                <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                    {formData.metrics.map((m, idx) => (
                                        <div key={idx} className="flex gap-3 items-center">
                                            <Input
                                                placeholder="Label"
                                                className="rounded-xl py-3 text-xs"
                                                value={m.label}
                                                onChange={(e) => updateMetric(idx, 'label', e.target.value)}
                                            />
                                            <Input
                                                placeholder="Value"
                                                className="rounded-xl py-3 text-xs"
                                                value={m.value}
                                                onChange={(e) => updateMetric(idx, 'value', e.target.value)}
                                            />
                                            <select
                                                className="px-3 py-3 rounded-xl border bg-transparent text-[10px] font-black uppercase outline-none"
                                                style={{ borderColor: borderColor }}
                                                value={m.trend}
                                                onChange={(e) => updateMetric(idx, 'trend', e.target.value)}
                                            >
                                                <option value="stable">Stable</option>
                                                <option value="up">Up</option>
                                                <option value="down">Down</option>
                                            </select>
                                            <button type="button" onClick={() => removeMetric(idx)} className="text-rose-500 hover:text-rose-400 p-2"><X size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest opacity-40">Internal Documentation</Label>
                                <textarea
                                    className="w-full px-4 py-4 rounded-2xl border bg-transparent text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none min-h-[100px]"
                                    style={{ borderColor: borderColor }}
                                    placeholder="Enter detailed analysis notes..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <Button type="submit" className="w-full py-8 text-sm font-black uppercase tracking-[0.2em] rounded-3xl mt-6 bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-500/20 transition-all">
                                {editingReport ? 'COMMIT UPDATED DATA' : 'FINALIZE INITIALIZATION'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
