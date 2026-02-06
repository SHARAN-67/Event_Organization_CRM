import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    Plus, Search, Filter, Package, Shield, Truck,
    TrendingUp, Boxes, ChevronRight, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeContext';
import ProductDetailView from '../../components/inventory/ProductDetailView.jsx';

const Products = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const { hasPermission, userRole } = useAuth();
    const { theme } = useTheme();

    // Theme Variables
    const isDark = theme === 'dark' || theme === 'night';
    const bgColor = theme === 'light' ? '#f8fafc' : theme === 'dark' ? '#0f172a' : '#020617';
    const cardBg = theme === 'light' ? '#ffffff' : theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(15, 23, 42, 0.5)';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const subTextColor = isDark ? '#94a3b8' : '#64748b';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0';
    const accentColor = '#3b82f6';

    const API_URL = 'http://localhost:5000/api/products';
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    const isAdmin = userRole === 'Admin';
    const canWrite = isAdmin || hasPermission('Products', 'Write');
    const canDelete = isAdmin || hasPermission('Products', 'Delete');

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await axios.get(API_URL, { headers });
            setProducts(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesTab = activeTab === 'All' || p.resourceType === activeTab;
            const matchesSearch = p.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.productCode?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesTab && matchesSearch;
        });
    }, [products, activeTab, searchQuery]);

    const stats = useMemo(() => {
        const owned = products.filter(p => p.resourceType === 'Owned').length;
        const rented = products.filter(p => p.resourceType === 'Rented').length;
        return { owned, rented, total: products.length };
    }, [products]);

    const handleProductSelect = (id) => {
        setSelectedProductId(id);
        setIsDetailOpen(true);
    };

    const handleCreateNew = () => {
        setSelectedProductId(null);
        setIsDetailOpen(true);
    };

    return (
        <div className="min-h-screen transition-colors duration-500" style={{ padding: '40px', backgroundColor: bgColor, color: textColor }}>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .page-animation { animation: fadeIn 0.4s ease-out; }
            `}</style>

            <div className="page-animation space-y-10">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div style={{ backgroundColor: accentColor, padding: '8px', borderRadius: '12px', boxShadow: `0 10px 15px -3px ${accentColor}40` }}>
                                <Boxes size={20} className="text-white" />
                            </div>
                            <span style={{ color: accentColor, fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Global Inventory Node</span>
                        </div>
                        <h1 style={{ fontSize: '48px', fontWeight: '900', color: textColor, letterSpacing: '-0.02em', lineHeight: '1', textTransform: 'uppercase' }}>Event Resources</h1>
                        <p style={{ color: subTextColor, fontSize: '18px', fontWeight: '500', marginTop: '16px', maxWidth: '600px', lineHeight: '1.6' }}>
                            Centralized intelligence for core system assets and rental clusters. Optimized for real-time operational status tracking.
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: cardBg, padding: '8px', borderRadius: '32px', border: `1px solid ${borderColor}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '16px 24px', borderRight: `1px solid ${borderColor}` }}>
                            <div>
                                <p style={{ fontSize: '10px', fontWeight: '900', color: subTextColor, textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: '1', marginBottom: '4px' }}>Total Assets</p>
                                <p style={{ color: textColor, fontWeight: '900', fontSize: '24px', letterSpacing: '-0.05em' }}>{stats.total}</p>
                            </div>
                            <TrendingUp size={24} className="text-emerald-500" />
                        </div>
                        <div className="flex gap-2 p-1">
                            {['All', 'Owned', 'Rented'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        padding: '12px 24px', borderRadius: '16px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'all 0.2s',
                                        backgroundColor: activeTab === tab ? accentColor : 'transparent',
                                        color: activeTab === tab ? 'white' : subTextColor,
                                        boxShadow: activeTab === tab ? `0 10px 15px -3px ${accentColor}40` : 'none'
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Search & Actions */}
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="relative w-full max-w-md group">
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: subTextColor }} />
                        <input
                            type="text"
                            placeholder="Search Resource Registry..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%', paddingLeft: '48px', height: '56px', borderRadius: '16px',
                                backgroundColor: cardBg, border: `1px solid ${borderColor}`, color: textColor,
                                fontSize: '14px', fontWeight: '700', outline: 'none', transition: 'all 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = accentColor}
                            onBlur={(e) => e.target.style.borderColor = borderColor}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button style={{
                            height: '56px', padding: '0 24px', borderRadius: '16px', border: `2px solid ${cardBg}`, backgroundColor: cardBg,
                            color: subTextColor, fontWeight: '900', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em',
                            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s'
                        }}>
                            <Filter size={16} /> Filter Intel
                        </button>
                        {canWrite && (
                            <button
                                onClick={handleCreateNew}
                                style={{
                                    height: '56px', padding: '0 32px', borderRadius: '16px', backgroundColor: accentColor,
                                    color: 'white', fontWeight: '900', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em',
                                    boxShadow: `0 10px 15px -3px ${accentColor}40`, display: 'flex', alignItems: 'center', gap: '12px',
                                    border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                <Plus size={18} /> Initialize Resource
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid View */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                        <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
                        <p style={{ color: subTextColor, fontWeight: '900', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Hydrating Global Registry...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                        {filteredProducts.map((product) => (
                            <div
                                key={product._id}
                                onClick={() => handleProductSelect(product._id)}
                                className="group relative transition-all duration-500 cursor-pointer overflow-hidden hover:-translate-y-2 hover:shadow-2xl"
                                style={{
                                    backgroundColor: cardBg, padding: '32px', borderRadius: '48px', border: `1px solid ${borderColor}`,
                                    borderTop: `4px solid ${product.resourceType === 'Owned' ? '#10b981' : '#3b82f6'}`
                                }}
                            >
                                {/* Background Decorative Element */}
                                <div style={{
                                    position: 'absolute', top: '-48px', right: '-48px', width: '160px', height: '160px', borderRadius: '50%',
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', transition: 'all 0.5s'
                                }} className="group-hover:bg-blue-500/10" />

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-8">
                                        <div style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', padding: '16px', borderRadius: '24px' }}>
                                            {product.resourceType === 'Owned' ? (
                                                <Shield className="text-emerald-500" size={32} />
                                            ) : (
                                                <Truck className="text-blue-500" size={32} />
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p style={{ fontSize: '10px', fontWeight: '900', color: subTextColor, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '4px' }}>Code</p>
                                            <p style={{ color: textColor, fontWeight: '900', fontSize: '14px' }}>{product.productCode || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <h3 style={{ fontSize: '20px', fontWeight: '900', color: textColor, marginBottom: '8px', transition: 'all 0.2s' }} className="group-hover:text-blue-500">
                                            {product.productName}
                                        </h3>
                                        <p style={{ color: subTextColor, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.productCategory}</p>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '32px', borderTop: `1px solid ${borderColor}` }}>
                                        <div>
                                            <p style={{ fontSize: '9px', fontWeight: '900', color: subTextColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Unit Valuation</p>
                                            <p style={{ color: textColor, fontWeight: '900', fontSize: '18px' }}>₹{product.unitPrice.toLocaleString()}</p>
                                            <p style={{ fontSize: '10px', color: subTextColor, fontWeight: '700', textTransform: 'uppercase' }}>{product.pricingModel}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '9px', fontWeight: '900', color: subTextColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Operational Qty</p>
                                            <p style={{ color: textColor, fontWeight: '900', fontSize: '18px' }}>{product.qtyInStock}</p>
                                            <div className="flex items-center gap-1">
                                                <div className={`w-1.5 h-1.5 rounded-full ${product.maintenanceStatus === 'Operational' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                <span style={{ fontSize: '10px', color: subTextColor, fontWeight: '700', textTransform: 'uppercase' }}>{product.maintenanceStatus}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex items-center justify-between">
                                        <div style={{
                                            padding: '6px 16px', borderRadius: '999px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em',
                                            backgroundColor: product.resourceType === 'Owned' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                            color: product.resourceType === 'Owned' ? '#10b981' : '#3b82f6',
                                            border: `1px solid ${product.resourceType === 'Owned' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
                                        }}>
                                            {product.resourceType} Intelligence
                                        </div>
                                        <div style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', color: subTextColor, padding: '8px', borderRadius: '12px' }} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredProducts.length === 0 && (
                            <div className="col-span-full py-32 text-center rounded-[48px] border border-dashed" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                                <Package size={64} style={{ margin: '0 auto 24px auto', color: borderColor }} />
                                <h3 style={{ fontSize: '24px', fontWeight: '900', color: subTextColor, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>No Intelligence Matches</h3>
                                <p style={{ color: subTextColor, fontWeight: '500' }}>Refine your search parameters to locate specifically classified resources.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Premium Detail Drawer */}
            <ProductDetailView
                isOpen={isDetailOpen}
                productId={selectedProductId}
                onClose={() => setIsDetailOpen(false)}
                onRefresh={fetchProducts}
                canEdit={canWrite}
                canDelete={canDelete}
                theme={theme} // Pass theme to child
            />
        </div>
    );
};

export default Products;
