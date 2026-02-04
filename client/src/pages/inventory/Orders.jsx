import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, X, Check, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeContext';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { hasPermission } = useAuth();
    const { theme } = useTheme();

    const isDark = theme === 'dark' || theme === 'night';
    const bgColor = theme === 'light' ? '#f8fafc' : theme === 'dark' ? '#0f172a' : '#020617';
    const cardBg = theme === 'light' ? '#ffffff' : theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(15, 23, 42, 0.5)';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const subTextColor = isDark ? '#94a3b8' : '#64748b';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0';

    const canWrite = hasPermission('Orders', 'Write');
    const canDelete = hasPermission('Orders', 'Delete');

    // Form State
    const [formData, setFormData] = useState({
        customerName: '',
        eventType: 'Wedding',
        eventDate: '',
        amount: '',
        status: 'Pending'
    });

    const [isEditing, setIsEditing] = useState(false);
    const [currentid, setCurrentId] = useState(null);

    const API_URL = 'http://localhost:5000/api/orders';

    // Helper to get auth headers
    const getAuthConfig = () => {
        const token = localStorage.getItem('token');
        return {
            headers: { Authorization: `Bearer ${token}` }
        };
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL, getAuthConfig());
            setOrders(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Failed to load orders.');
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
            // Clean data
            const payload = {
                ...formData,
                amount: parseFloat(formData.amount) || 0,
                eventDate: formData.eventDate === '' ? null : formData.eventDate
            };

            if (isEditing) {
                const response = await axios.put(`${API_URL}/${currentid}`, payload, getAuthConfig());
                setOrders(orders.map(order => order._id === currentid ? response.data : order));
                setIsEditing(false);
                setCurrentId(null);
            } else {
                const response = await axios.post(API_URL, payload, getAuthConfig());
                setOrders([response.data, ...orders]);
            }
            // Reset Form
            setFormData({
                customerName: '',
                eventType: 'Wedding',
                eventDate: '',
                amount: '',
                status: 'Pending'
            });
        } catch (error) {
            console.error('Error saving order:', error);
            alert('Failed to save order.');
        }
    };

    const handleEdit = (order) => {
        setIsEditing(true);
        setCurrentId(order._id);
        setFormData({
            customerName: order.customerName,
            eventType: order.eventType,
            eventDate: order.eventDate.split('T')[0], // Format date for input
            amount: order.amount,
            status: order.status
        });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setCurrentId(null);
        setFormData({
            customerName: '',
            eventType: 'Wedding',
            eventDate: '',
            amount: '',
            status: 'Pending'
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this order?')) return;
        try {
            await axios.delete(`${API_URL}/${id}`, getAuthConfig());
            setOrders(orders.filter(order => order._id !== id));
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Failed to delete order.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed': return '#4caf50';
            case 'Completed': return '#3b82f6';
            case 'Cancelled': return '#ef4444';
            default: return '#f59e0b'; // Pending
        }
    };

    // Derived Styles
    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        borderRadius: '8px',
        border: `1px solid ${borderColor}`,
        fontSize: '14px',
        outline: 'none',
        backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#fff',
        color: textColor,
        transition: 'border-color 0.2s'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '6px',
        fontSize: '13px',
        color: subTextColor,
        fontWeight: '600'
    };

    const thStyle = {
        padding: '16px 24px',
        fontSize: '12px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: subTextColor,
        borderBottom: `1px solid ${borderColor}`,
        textAlign: 'left'
    };

    const tdStyle = {
        padding: '16px 24px',
        fontSize: '14px',
        color: textColor,
        borderBottom: `1px solid ${borderColor}`
    };

    return (
        <div className="min-h-screen transition-colors duration-500 font-['Inter'] animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ padding: '30px', backgroundColor: bgColor, color: textColor }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '32px', color: textColor, fontSize: '32px', fontWeight: '800', letterSpacing: '-0.02em' }}>Event Orders</h1>

                {/* Order Form */}
                <div style={{ backgroundColor: cardBg, padding: '32px', borderRadius: '24px', border: `1px solid ${borderColor}`, marginBottom: '40px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <h3 style={{ marginBottom: '24px', color: textColor, fontSize: '18px', fontWeight: '700' }}>{isEditing ? 'Edit Order' : 'Create New Order'}</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', alignItems: 'end' }}>

                        <div>
                            <label style={labelStyle}>Customer Name</label>
                            <input
                                type="text"
                                name="customerName"
                                value={formData.customerName}
                                onChange={handleInputChange}
                                required
                                style={inputStyle}
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Event Type</label>
                            <select
                                name="eventType"
                                value={formData.eventType}
                                onChange={handleInputChange}
                                style={inputStyle}
                            >
                                <option value="Wedding">Wedding</option>
                                <option value="Birthday">Birthday</option>
                                <option value="Corporate">Corporate</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label style={labelStyle}>Event Date</label>
                            <input
                                type="date"
                                name="eventDate"
                                value={formData.eventDate}
                                onChange={handleInputChange}
                                required
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Amount (₹)</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleInputChange}
                                required
                                style={inputStyle}
                                placeholder="5000"
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                style={inputStyle}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            {canWrite && (
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1, padding: '12px', backgroundColor: '#3b82f6', color: 'white',
                                        border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        fontWeight: '600', transition: 'all 0.2s'
                                    }}
                                >
                                    {isEditing ? <Save size={18} /> : <Plus size={18} />}
                                    {isEditing ? 'Update' : 'Add Order'}
                                </button>
                            )}

                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    style={{
                                        flex: 1, padding: '12px', backgroundColor: isDark ? '#334155' : '#e2e8f0',
                                        color: isDark ? '#fff' : '#475569', border: 'none',
                                        borderRadius: '12px', cursor: 'pointer', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        fontWeight: '600'
                                    }}
                                >
                                    <X size={18} /> Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Orders Table */}
                <div style={{ backgroundColor: cardBg, borderRadius: '24px', border: `1px solid ${borderColor}`, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#f8fafc' }}>
                            <tr>
                                <th style={thStyle}>Date</th>
                                <th style={thStyle}>Customer</th>
                                <th style={thStyle}>Event</th>
                                <th style={thStyle}>Amount</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: subTextColor }}>
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order._id} style={{ borderBottom: `1px solid ${borderColor}`, transition: 'background-color 0.1s' }} className={isDark ? "hover:bg-white/5" : "hover:bg-slate-100"}>
                                        <td style={tdStyle}>{new Date(order.eventDate).toLocaleDateString()}</td>
                                        <td style={tdStyle}>{order.customerName}</td>
                                        <td style={tdStyle}>{order.eventType}</td>
                                        <td style={tdStyle}>₹{order.amount}</td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                backgroundColor: `${getStatusColor(order.status)}${isDark ? '20' : '20'}`,
                                                color: getStatusColor(order.status),
                                                fontWeight: '700',
                                                border: `1px solid ${getStatusColor(order.status)}30`
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                {canWrite && (
                                                    <button
                                                        onClick={() => handleEdit(order)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#3b82f6' }}
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={() => handleDelete(order._id)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#ef4444' }}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Orders;
