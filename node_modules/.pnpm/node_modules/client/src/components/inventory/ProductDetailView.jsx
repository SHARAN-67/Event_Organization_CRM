import React, { useState, useEffect } from 'react';
import {
    X, Save, Trash2, Loader2, CheckCircle, AlertCircle,
    Package, DollarSign, Calendar, Clock, Settings, Info,
    Shield, Briefcase, Tag, Plus
} from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../../theme/ThemeContext';

const ProductDetailView = ({ productId, isOpen, onClose, onRefresh, canEdit, canDelete }) => {
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });
    const { theme } = useTheme();

    // Theme Variables
    const isDark = theme === 'dark' || theme === 'night';
    const bgColor = theme === 'light' ? '#ffffff' : theme === 'dark' ? '#1e293b' : '#020617'; // Modal Content Bg
    const containerBg = theme === 'light' ? '#f8fafc' : theme === 'dark' ? '#0f172a' : '#0f172a'; // Inner sections
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const subTextColor = isDark ? '#94a3b8' : '#64748b';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0';
    const inputBg = isDark ? 'rgba(0,0,0,0.2)' : '#f8fafc';

    const [formData, setFormData] = useState({
        productName: '',
        productCode: '',
        productCategory: 'Equipment',
        resourceType: 'Owned',
        unitPrice: 0,
        pricingModel: 'Per Day',
        qtyInStock: 0,
        description: '',
        vendorName: '',
        maintenanceStatus: 'Operational',
        purchaseDate: '',
        rentalDuration: '',
    });

    const API_URL = 'http://localhost:5000/api/products';
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    // Hybrid Hydration
    useEffect(() => {
        if (isOpen) {
            if (productId) {
                fetchProductDetails(productId);
            } else {
                // Initialize for creation
                setFormData({
                    productName: '',
                    productCode: '',
                    productCategory: 'Equipment',
                    resourceType: 'Owned',
                    unitPrice: 0,
                    pricingModel: 'Per Day',
                    qtyInStock: 0,
                    description: '',
                    vendorName: '',
                    maintenanceStatus: 'Operational',
                    purchaseDate: '',
                    rentalDuration: '',
                });
                setStatus({ type: '', msg: '' });
            }
        }
    }, [productId, isOpen]);

    const fetchProductDetails = async (id) => {
        setLoading(true);
        setStatus({ type: '', msg: '' });
        try {
            const res = await axios.get(`${API_URL}/${id}`, { headers });
            const data = res.data;
            setFormData({
                productName: data.productName || '',
                productCode: data.productCode || '',
                productCategory: data.productCategory || 'Equipment',
                resourceType: data.resourceType || 'Owned',
                unitPrice: data.unitPrice || 0,
                pricingModel: data.pricingModel || 'Per Day',
                qtyInStock: data.qtyInStock || 0,
                description: data.description || '',
                vendorName: data.vendorName || '',
                maintenanceStatus: data.maintenanceStatus || 'Operational',
                purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString().split('T')[0] : '',
                rentalDuration: data.rentalDuration || '',
            });
        } catch (err) {
            setStatus({ type: 'error', msg: 'Intelligence retrieval failed.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!canEdit) return;

        setActionLoading(true);
        setStatus({ type: '', msg: '' });
        try {
            if (productId) {
                await axios.put(`${API_URL}/${productId}`, formData, { headers });
                setStatus({ type: 'success', msg: 'Inventory synchronized.' });
            } else {
                await axios.post(API_URL, formData, { headers });
                setStatus({ type: 'success', msg: 'New resource cataloged.' });
                setTimeout(() => onClose(), 1500);
            }
            onRefresh();
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.error || 'Transmission failed.' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!canDelete) return;
        if (!window.confirm('Decommission this inventory resource?')) return;

        setActionLoading(true);
        try {
            await axios.delete(`${API_URL}/${productId}`, { headers });
            onRefresh();
            onClose();
        } catch (err) {
            setStatus({ type: 'error', msg: 'Decommissioning failed.' });
        } finally {
            setActionLoading(false);
        }
    };

    // Shared Styles
    const inputStyle = {
        backgroundColor: inputBg,
        borderColor: borderColor,
        color: textColor,
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-xl transform transition-all duration-500 ease-in-out translate-x-0">
                    <div className="h-full flex flex-col shadow-2xl rounded-l-[3rem] overflow-hidden" style={{ backgroundColor: bgColor }}>

                        {/* Header */}
                        <div className="p-8 border-b flex items-center justify-between" style={{ backgroundColor: containerBg, borderColor: borderColor }}>
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
                                    <Package size={24} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight uppercase" style={{ color: textColor }}>
                                        {productId ? 'Resource Intel' : 'New Resource'}
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: subTextColor }}>
                                            {productId ? `REG: ${productId.slice(-8)}` : 'Entry Mode: Initialization'}
                                        </p>
                                        {formData.resourceType === 'Owned' ? (
                                            <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter border border-emerald-100 italic">Antigravity Asset</span>
                                        ) : (
                                            <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter border border-blue-100 italic">Rental Cluster</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-3 rounded-full transition-all hover:bg-slate-200" style={{ color: subTextColor }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-10">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <Loader2 className="animate-spin text-blue-500" size={48} />
                                    <p className="font-black uppercase text-[10px] tracking-widest animate-pulse" style={{ color: subTextColor }}>Synchronizing Data Integrity...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSave} className="space-y-8">

                                    {/* Classification */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: subTextColor }}>
                                                <Tag size={12} /> Resource Label
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border-2 rounded-2xl p-4 font-bold outline-none focus:border-blue-500/50 transition-all read-only:opacity-60"
                                                style={inputStyle}
                                                value={formData.productName}
                                                onChange={e => setFormData({ ...formData, productName: e.target.value })}
                                                readOnly={!canEdit}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: subTextColor }}>
                                                    <Briefcase size={12} /> Category
                                                </label>
                                                <select
                                                    value={formData.productCategory}
                                                    onChange={e => setFormData({ ...formData, productCategory: e.target.value })}
                                                    disabled={!canEdit}
                                                    className="w-full border-2 rounded-2xl p-4 font-bold outline-none focus:border-blue-500/50 transition-all"
                                                    style={inputStyle}
                                                >
                                                    {['Equipment', 'Audio/Visual', 'Furniture', 'Decor', 'Lighting', 'Service', 'Catering', 'Venue', 'Other'].map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: subTextColor }}>
                                                    <Shield size={12} /> Registry Code
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full border-2 rounded-2xl p-4 font-bold outline-none focus:border-blue-500/50 transition-all read-only:opacity-60"
                                                    style={inputStyle}
                                                    value={formData.productCode}
                                                    onChange={e => setFormData({ ...formData, productCode: e.target.value })}
                                                    readOnly={!canEdit}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Operational Status */}
                                    <div className="p-6 rounded-[2rem] border flex items-center justify-between" style={{ backgroundColor: containerBg, borderColor: borderColor }}>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: subTextColor }}>Global Status</p>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full animate-pulse ${formData.maintenanceStatus === 'Operational' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                                                    formData.maintenanceStatus === 'Maintenance' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-red-500'
                                                    }`} />
                                                <span className="font-black uppercase text-sm" style={{ color: textColor }}>{formData.maintenanceStatus}</span>
                                            </div>
                                        </div>
                                        <select
                                            value={formData.maintenanceStatus}
                                            onChange={e => setFormData({ ...formData, maintenanceStatus: e.target.value })}
                                            disabled={!canEdit}
                                            className="border rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider outline-none"
                                            style={{ backgroundColor: bgColor, borderColor: borderColor, color: textColor }}
                                        >
                                            <option value="Operational">Operational</option>
                                            <option value="Maintenance">Under Maintenance</option>
                                            <option value="Decommissioned">Decommissioned</option>
                                        </select>
                                    </div>

                                    {/* Financial Intel */}
                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: subTextColor }}>
                                            <DollarSign size={12} /> Financial Metrics
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative">
                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: subTextColor }} size={18} />
                                                <input
                                                    type="number"
                                                    placeholder="Unit Price"
                                                    className="w-full border-2 rounded-2xl p-4 pl-12 font-bold outline-none focus:border-blue-500/50 transition-all read-only:opacity-60"
                                                    style={inputStyle}
                                                    value={formData.unitPrice}
                                                    onChange={e => setFormData({ ...formData, unitPrice: e.target.value })}
                                                    readOnly={!canEdit}
                                                />
                                            </div>
                                            <select
                                                value={formData.pricingModel}
                                                onChange={e => setFormData({ ...formData, pricingModel: e.target.value })}
                                                disabled={!canEdit}
                                                className="w-full border-2 rounded-2xl p-4 font-bold outline-none focus:border-blue-500/50 transition-all"
                                                style={inputStyle}
                                            >
                                                <option value="Per Day">Per Day</option>
                                                <option value="Per Hour">Per Hour</option>
                                                <option value="Per Unit">Per Unit</option>
                                                <option value="Fixed Fee">Fixed Fee</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Cluster Logic: Owned vs Rented */}
                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: subTextColor }}>
                                            <Settings size={12} /> Cluster Specification
                                        </label>
                                        <div className="flex gap-4">
                                            {['Owned', 'Rented'].map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, resourceType: type })}
                                                    disabled={!canEdit}
                                                    className={`flex-1 p-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${formData.resourceType === type
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                                                        : 'hover:border-slate-200'
                                                        }`}
                                                    style={formData.resourceType !== type ? { backgroundColor: inputBg, borderColor: borderColor, color: subTextColor } : {}}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>

                                        {formData.resourceType === 'Owned' ? (
                                            <div className="animate-in fade-in slide-in-from-top-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest mb-2 block" style={{ color: subTextColor }}>Acquisition Intelligence</label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: subTextColor }} size={18} />
                                                    <input
                                                        type="date"
                                                        className="w-full border-2 rounded-2xl p-4 pl-12 font-bold outline-none focus:border-blue-500/50 transition-all read-only:opacity-60"
                                                        style={inputStyle}
                                                        value={formData.purchaseDate}
                                                        onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                                                        readOnly={!canEdit}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="animate-in fade-in slide-in-from-top-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest mb-2 block" style={{ color: subTextColor }}>Rental Logistics</label>
                                                <div className="relative">
                                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: subTextColor }} size={18} />
                                                    <input
                                                        type="text"
                                                        placeholder="Duration (e.g. 7 Days)"
                                                        className="w-full border-2 rounded-2xl p-4 pl-12 font-bold outline-none focus:border-blue-500/50 transition-all read-only:opacity-60"
                                                        style={inputStyle}
                                                        value={formData.rentalDuration}
                                                        onChange={e => setFormData({ ...formData, rentalDuration: e.target.value })}
                                                        readOnly={!canEdit}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: subTextColor }}>
                                            <Info size={12} /> Resource Context
                                        </label>
                                        <textarea
                                            placeholder="Detailed intelligence briefing..."
                                            className="w-full border-2 rounded-2xl p-4 font-medium outline-none focus:border-blue-500/50 transition-all read-only:opacity-60 min-h-[100px]"
                                            style={inputStyle}
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            readOnly={!canEdit}
                                        />
                                    </div>

                                    {/* Feedback */}
                                    {status.msg && (
                                        <div className={`flex items-center gap-3 p-5 rounded-2xl animate-in fade-in slide-in-from-top-2 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                            {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                            <span className="font-bold text-sm uppercase tracking-tight">{status.msg}</span>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="pt-8 border-t flex gap-4" style={{ borderColor: borderColor }}>
                                        {canEdit && (
                                            <button
                                                type="submit"
                                                disabled={actionLoading}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                            >
                                                {actionLoading ? <Loader2 className="animate-spin" size={18} /> : (productId ? <Save size={18} /> : <Plus size={18} />)}
                                                {productId ? 'Commit Sync' : 'Initialize Resource'}
                                            </button>
                                        )}

                                        {productId && canDelete && (
                                            <button
                                                type="button"
                                                onClick={handleDelete}
                                                disabled={actionLoading}
                                                className="border-2 text-red-500 hover:bg-red-50 p-5 rounded-2xl transition-all disabled:opacity-50"
                                                style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                            >
                                                <Trash2 size={20} />
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

export default ProductDetailView;
