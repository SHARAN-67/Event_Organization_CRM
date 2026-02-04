import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Plus, Mail, Phone, MoreHorizontal, X, Save, Building, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeContext';

const Vendors = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Vendors');
    const [showModal, setShowModal] = useState(false);
    const { hasPermission } = useAuth();
    const { theme } = useTheme();

    // Theme Variables
    const isDark = theme === 'dark' || theme === 'night';
    const bgColor = theme === 'light' ? '#f8fafc' : theme === 'dark' ? '#0f172a' : '#020617';
    const cardBg = theme === 'light' ? '#ffffff' : theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(15, 23, 42, 0.5)';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const subTextColor = isDark ? '#94a3b8' : '#64748b';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0';
    const accentColor = '#3b82f6';

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        category: 'Catering',
        status: 'Pending',
        amountDue: 0,
        amountPaid: 0
    });

    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const API_URL = 'http://localhost:5000/api/vendors';

    const getAuthConfig = () => {
        const token = localStorage.getItem('token');
        return {
            headers: { Authorization: `Bearer ${token}` }
        };
    };

    // Stats
    const totalPaid = vendors.reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);
    const totalOutstanding = vendors.reduce((acc, curr) => acc + (curr.amountDue || 0), 0);
    const overdueCount = vendors.filter(v => v.status === 'Overdue').length;

    // Filter Logic
    const filteredVendors = vendors.filter(vendor => {
        const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'All' || vendor.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL, getAuthConfig());
            setVendors(response.data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                const response = await axios.put(`${API_URL}/${currentId}`, formData, getAuthConfig());
                setVendors(vendors.map(v => v._id === currentId ? response.data : v));
            } else {
                const response = await axios.post(API_URL, formData, getAuthConfig());
                setVendors([response.data, ...vendors]);
            }
            closeModal();
        } catch (error) {
            console.error('Error saving vendor:', error);
            alert('Failed to save vendor: ' + (error.response?.data?.message || error.message));
        }
    };

    const openEditModal = (vendor) => {
        setFormData({
            name: vendor.name,
            contactPerson: vendor.contactPerson,
            email: vendor.email || '',
            phone: vendor.phone || '',
            category: vendor.category,
            status: vendor.status,
            amountDue: vendor.amountDue || 0,
            amountPaid: vendor.amountPaid || 0
        });
        setCurrentId(vendor._id);
        setIsEditing(true);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setCurrentId(null);
        setFormData({
            name: '', status: 'Pending', category: 'Catering',
            contactPerson: '', email: '', phone: '',
            amountDue: 0, amountPaid: 0
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this vendor?')) return;
        try {
            await axios.delete(`${API_URL}/${id}`, getAuthConfig());
            setVendors(vendors.filter(v => v._id !== id));
        } catch (error) {
            console.error('Error deleting vendor:', error);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Paid': return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
            case 'Partial': return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
            case 'Overdue': return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
            default: return { color: subTextColor, bg: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' };
        }
    };

    // Styles
    const cardStyle = {
        backgroundColor: cardBg,
        borderRadius: '24px',
        padding: '32px',
        border: `1px solid ${borderColor}`,
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
    };

    const inputStyle = {
        width: '100%',
        padding: '16px',
        backgroundColor: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: '16px',
        color: textColor,
        outline: 'none',
        fontSize: '14px',
        transition: 'border-color 0.2s'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        color: subTextColor,
        fontSize: '13px',
        fontWeight: '700'
    };

    const thStyle = {
        padding: '24px',
        color: subTextColor,
        fontSize: '11px',
        fontWeight: '900',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        textAlign: 'left',
        borderBottom: `1px solid ${borderColor}`
    };

    const tdStyle = {
        padding: '24px',
        verticalAlign: 'middle',
        borderBottom: `1px solid ${borderColor}`,
        color: textColor,
        fontSize: '14px'
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

            <div className="page-animation" style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ marginBottom: '48px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ backgroundColor: accentColor, padding: '8px', borderRadius: '12px', boxShadow: `0 10px 15px -3px ${accentColor}40` }}>
                            <Building size={20} className="text-white" />
                        </div>
                        <span style={{ color: accentColor, fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Logistics Node</span>
                    </div>
                    <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '16px', color: textColor, letterSpacing: '-0.03em', lineHeight: '1' }}>Vendor Management</h1>
                    <p style={{ color: subTextColor, fontSize: '18px', maxWidth: '600px' }}>Manage secure vendor relationships, payments, and site visit schedules.</p>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '48px' }}>
                    <div style={cardStyle}>
                        <div style={{ color: subTextColor, fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Total Paid</div>
                        <div style={{ color: '#10b981', fontSize: '36px', fontWeight: '900', letterSpacing: '-0.02em' }}>
                            ₹{totalPaid.toLocaleString()}
                        </div>
                    </div>
                    <div style={cardStyle}>
                        <div style={{ color: subTextColor, fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Total Outstanding</div>
                        <div style={{ color: '#f59e0b', fontSize: '36px', fontWeight: '900', letterSpacing: '-0.02em' }}>
                            ₹{totalOutstanding.toLocaleString()}
                        </div>
                    </div>
                    <div style={cardStyle}>
                        <div style={{ color: subTextColor, fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Overdue Payments</div>
                        <div style={{ color: '#ef4444', fontSize: '36px', fontWeight: '900', letterSpacing: '-0.02em' }}>
                            {overdueCount}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '24px' }}>
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: subTextColor }} />
                        <input
                            type="text"
                            placeholder="Search vendor registry..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                ...inputStyle,
                                paddingLeft: '48px',
                                borderRadius: '16px'
                            }}
                            onFocus={(e) => e.target.style.borderColor = accentColor}
                            onBlur={(e) => e.target.style.borderColor = borderColor}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{
                                ...inputStyle,
                                width: 'auto', paddingRight: '40px', cursor: 'pointer'
                            }}
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Partial">Partial</option>
                            <option value="Overdue">Overdue</option>
                        </select>
                        <button
                            onClick={() => setShowModal(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '0 32px', backgroundColor: accentColor, border: 'none',
                                borderRadius: '16px', color: 'white', fontWeight: '800', cursor: 'pointer',
                                boxShadow: `0 10px 15px -3px ${accentColor}40`, transition: 'all 0.2s'
                            }}
                        >
                            <Plus size={18} /> Add Vendor
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div style={{ border: `1px solid ${borderColor}`, borderRadius: '32px', overflow: 'hidden', backgroundColor: cardBg, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                            <tr>
                                <th style={thStyle}>VENDOR</th>
                                <th style={thStyle}>CATEGORY</th>
                                <th style={thStyle}>PAYMENT STATUS</th>
                                <th style={thStyle}>AMOUNT DUE</th>
                                <th style={thStyle}>PAYMENT PAID</th>
                                <th style={thStyle}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '64px', textAlign: 'center' }}>
                                        <Loader2 size={32} className="animate-spin text-blue-500 mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredVendors.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '64px', textAlign: 'center', color: subTextColor }}>
                                        No vendors found in local registry.
                                    </td>
                                </tr>
                            ) : (
                                filteredVendors.map(vendor => {
                                    const statusStyle = getStatusStyle(vendor.status);
                                    return (
                                        <tr key={vendor._id} style={{ borderBottom: `1px solid ${borderColor}`, transition: 'all 0.1s' }} className={isDark ? "hover:bg-white/5" : "hover:bg-slate-100"}>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: '800', color: textColor, fontSize: '15px' }}>{vendor.name}</div>
                                                <div style={{ fontSize: '13px', color: subTextColor, marginTop: '4px' }}>{vendor.contactPerson}</div>
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{
                                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', padding: '6px 14px',
                                                    borderRadius: '20px', fontSize: '12px', color: subTextColor, fontWeight: '700'
                                                }}>
                                                    {vendor.category}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{
                                                    backgroundColor: statusStyle.bg, color: statusStyle.color,
                                                    padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
                                                    display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: '800'
                                                }}>
                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusStyle.color }}></span>
                                                    {vendor.status}
                                                </span>
                                            </td>
                                            <td style={{ ...tdStyle, color: vendor.amountDue > 0 ? '#f59e0b' : subTextColor, fontWeight: vendor.amountDue > 0 ? '800' : '500' }}>
                                                ₹{(vendor.amountDue || 0).toLocaleString()}
                                            </td>
                                            <td style={{ ...tdStyle, color: subTextColor }}>
                                                ₹{(vendor.amountPaid || 0).toLocaleString()}
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ display: 'flex', gap: '16px' }}>
                                                    <button title="Email" onClick={() => window.open(`mailto:${vendor.email}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: subTextColor }} className="hover:text-blue-500 transition-colors"><Mail size={18} /></button>
                                                    <button title="Call" onClick={() => window.open(`tel:${vendor.phone}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: subTextColor }} className="hover:text-blue-500 transition-colors"><Phone size={18} /></button>
                                                    <button title="Edit" onClick={() => openEditModal(vendor)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: subTextColor }} className="hover:text-blue-500 transition-colors"><MoreHorizontal size={18} /></button>
                                                    <button title="Delete" onClick={() => handleDelete(vendor._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} className="hover:text-red-600 transition-colors"><X size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="page-animation" style={{
                        backgroundColor: cardBg, padding: '40px', borderRadius: '32px',
                        width: '100%', maxWidth: '600px', border: `1px solid ${borderColor}`,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '900', color: textColor }}>{isEditing ? 'Edit Vendor Node' : 'Initialize New Vendor'}</h2>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', color: subTextColor, cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                    <label style={labelStyle}>Company Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Contact Person</label>
                                    <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} required style={inputStyle} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                    <label style={labelStyle}>Category</label>
                                    <select name="category" value={formData.category} onChange={handleInputChange} style={inputStyle}>
                                        <option>Catering</option>
                                        <option>Venue</option>
                                        <option>Audio/Visual</option>
                                        <option>Decorations</option>
                                        <option>Security</option>
                                        <option>Transportation</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Status</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange} style={inputStyle}>
                                        <option value="Pending">Pending</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Partial">Partial</option>
                                        <option value="Overdue">Overdue</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                    <label style={labelStyle}>Amount Paid (₹)</label>
                                    <input type="number" name="amountPaid" value={formData.amountPaid} onChange={handleInputChange} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Amount Due (₹)</label>
                                    <input type="number" name="amountDue" value={formData.amountDue} onChange={handleInputChange} style={inputStyle} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                    <label style={labelStyle}>Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Phone</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} style={inputStyle} />
                                </div>
                            </div>

                            <button type="submit" style={{
                                marginTop: '16px', padding: '16px', backgroundColor: accentColor,
                                border: 'none', borderRadius: '16px', color: 'white', fontWeight: '800', cursor: 'pointer',
                                transition: 'all 0.2s', boxShadow: `0 10px 15px -3px ${accentColor}40`, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em'
                            }}>
                                {isEditing ? 'Update Vendor Data' : 'Establish Vendor Connection'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vendors;
