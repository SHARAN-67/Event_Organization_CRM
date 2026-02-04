import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Plus, Search, Filter, MoreHorizontal, Download,
    Trash2, Edit, Save, X, GripVertical, ChevronDown,
    User, Calendar, FileText, MapPin, Phone, Mail, Lock,
    CreditCard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Restricted from '../../components/Restricted';
import { useTheme } from '../../theme/ThemeContext';

const Invoices = () => {
    // --- State ---
    const [view, setView] = useState('list'); // 'list' | 'form'
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
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

    // Permission checks
    const canRead = userRole === 'Admin' || hasPermission('Invoices', 'Read');
    const canWrite = userRole === 'Admin' || hasPermission('Invoices', 'Write');
    const canDelete = userRole === 'Admin' || hasPermission('Invoices', 'Delete');

    // Default Columns for List View
    const [columns, setColumns] = useState([
        { id: 'invoiceNumber', label: 'Invoice #', visible: true },
        { id: 'invoiceOwner', label: 'Owner', visible: true },
        { id: 'subject', label: 'Subject', visible: true },
        { id: 'contactName', label: 'Customer', visible: true },
        { id: 'contactPhone', label: 'Phone', visible: true },
        { id: 'contactEmail', label: 'Email', visible: true },
        { id: 'status', label: 'Status', visible: true },
        { id: 'invoiceDate', label: 'Date', visible: true },
        { id: 'grandTotal', label: 'Amount', visible: true },
    ]);

    // Form State
    const defaultForm = {
        invoiceOwner: 'CN',
        subject: '',
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        salesOrder: '',
        purchaseOrder: '',
        exciseDuty: 0,
        status: 'Created',
        salesCommission: 0,
        accountName: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        dealName: '',
        billingAddress: { country: '', street: '', city: '', state: '', zip: '', lat: '', lng: '' },
        shippingAddress: { country: '', street: '', city: '', state: '', zip: '', lat: '', lng: '' },
        items: [],
        subTotal: 0,
        discountTotal: 0,
        taxTotal: 0,
        adjustment: 0,
        grandTotal: 0,
        termsAndConditions: '',
        description: ''
    };

    const [formData, setFormData] = useState(defaultForm);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const API_URL = 'http://localhost:5000/api/invoices';

    const getAuthConfig = () => {
        const token = localStorage.getItem('token');
        return {
            headers: { Authorization: `Bearer ${token}` }
        };
    };

    useEffect(() => {
        if (canRead) {
            fetchInvoices();
        }
    }, [canRead]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const res = await axios.get(API_URL, getAuthConfig());
            setInvoices(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    // --- Drag & Drop Handlers for Columns ---
    const dragItem = useRef();
    const dragOverItem = useRef();

    const handleDragStart = (e, position) => {
        dragItem.current = position;
    };

    const handleDragEnter = (e, position) => {
        dragOverItem.current = position;
    };

    const handleDragEnd = (e) => {
        const copyListItems = [...columns];
        const dragItemContent = copyListItems[dragItem.current];
        copyListItems.splice(dragItem.current, 1);
        copyListItems.splice(dragOverItem.current, 0, dragItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setColumns(copyListItems);
    };

    // --- Form Logic ---
    const handleInputChange = (e, section = null) => {
        const { name, value } = e.target;
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section], [name]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Item Logic
    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { productName: '', description: '', quantity: 1, listPrice: 0, amount: 0, discount: 0, tax: 0, total: 0 }]
        }));
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;

        const qty = parseFloat(newItems[index].quantity) || 0;
        const price = parseFloat(newItems[index].listPrice) || 0;
        const discount = parseFloat(newItems[index].discount) || 0;
        const tax = parseFloat(newItems[index].tax) || 0;

        const amount = qty * price;
        newItems[index].amount = amount;
        newItems[index].total = amount - discount + tax;

        setFormData(prev => ({ ...prev, items: newItems }));
    };

    // Calculate Totals Effect
    useEffect(() => {
        const sub = formData.items.reduce((acc, item) => acc + (item.amount || 0), 0);
        const disc = formData.items.reduce((acc, item) => acc + (parseFloat(item.discount) || 0), 0);
        const tax = formData.items.reduce((acc, item) => acc + (parseFloat(item.tax) || 0), 0);
        const adj = parseFloat(formData.adjustment) || 0;
        const grand = sub - disc + tax + adj;

        setFormData(prev => ({
            ...prev,
            subTotal: sub,
            discountTotal: disc,
            taxTotal: tax,
            grandTotal: grand
        }));
    }, [formData.items, formData.adjustment]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canWrite) {
            alert('Access Denied: You do not have permission to save invoices.');
            return;
        }

        try {
            const payload = {
                ...formData,
                dueDate: formData.dueDate === '' ? null : formData.dueDate,
                invoiceDate: formData.invoiceDate === '' ? null : formData.invoiceDate,
                exciseDuty: parseFloat(formData.exciseDuty) || 0,
                salesCommission: parseFloat(formData.salesCommission) || 0,
                subTotal: parseFloat(formData.subTotal) || 0,
                discountTotal: parseFloat(formData.discountTotal) || 0,
                taxTotal: parseFloat(formData.taxTotal) || 0,
                adjustment: parseFloat(formData.adjustment) || 0,
                grandTotal: parseFloat(formData.grandTotal) || 0,
                items: formData.items.map(item => ({
                    ...item,
                    quantity: parseFloat(item.quantity) || 0,
                    listPrice: parseFloat(item.listPrice) || 0,
                    amount: parseFloat(item.amount) || 0,
                    discount: parseFloat(item.discount) || 0,
                    tax: parseFloat(item.tax) || 0,
                    total: parseFloat(item.total) || 0
                }))
            };

            if (isEditing) {
                await axios.put(`${API_URL}/${currentId}`, payload, getAuthConfig());
            } else {
                await axios.post(API_URL, payload, getAuthConfig());
            }
            fetchInvoices();
            setView('list');
        } catch (error) {
            console.error("Save Error:", error.response?.data || error);
            alert(`Error saving invoice: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleEdit = (invoice) => {
        if (!canWrite) {
            alert('Access Denied: You do not have permission to edit invoices.');
            return;
        }

        setFormData({
            ...defaultForm,
            ...invoice,
            invoiceDate: invoice.invoiceDate ? invoice.invoiceDate.split('T')[0] : '',
            dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : '',
        });
        setCurrentId(invoice._id);
        setIsEditing(true);
        setView('form');
    };

    const handleDelete = async (id) => {
        if (!canDelete) {
            alert('Access Denied: You do not have permission to delete invoices.');
            return;
        }

        if (!window.confirm("Delete Invoice?")) return;
        try {
            await axios.delete(`${API_URL}/${id}`, getAuthConfig());
            fetchInvoices();
        } catch (error) { console.error(error); }
    };

    const createNewInfo = () => {
        if (!canWrite) {
            alert('Access Denied: You do not have permission to create invoices.');
            return;
        }
        setFormData(defaultForm);
        setIsEditing(false);
        setView('form');
    };

    // --- STYLES ---
    const sectionStyle = {
        backgroundColor: cardBg,
        padding: '32px',
        borderRadius: '24px',
        // boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        border: `1px solid ${borderColor}`,
        marginBottom: '32px'
    };

    const sectionHeaderStyle = {
        fontSize: '18px',
        fontWeight: '800',
        color: textColor,
        marginBottom: '24px',
        borderBottom: `1px solid ${borderColor}`,
        paddingBottom: '16px',
        letterSpacing: '-0.02em'
    };

    const labelStyle = {
        fontSize: '13px',
        color: subTextColor,
        fontWeight: '700',
        marginBottom: '8px',
        display: 'block'
    };

    const inputStyle = {
        padding: '12px 16px',
        borderRadius: '12px',
        border: `1px solid ${borderColor}`,
        outline: 'none',
        fontSize: '14px',
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#fff',
        color: textColor,
        transition: 'all 0.2s'
    };

    const thStyle = {
        padding: '16px 20px',
        textAlign: 'left',
        fontSize: '11px',
        fontWeight: '900',
        color: subTextColor,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        userSelect: 'none',
        borderBottom: `1px solid ${borderColor}`
    };

    const tdStyle = {
        padding: '16px 20px',
        fontSize: '14px',
        color: textColor,
        borderBottom: `1px solid ${borderColor}`
    };

    // Show access denied if user can't read
    if (!canRead) {
        return (
            <div style={{ padding: '30px', backgroundColor: bgColor, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <Lock size={48} color={subTextColor} />
                <h2 style={{ color: textColor, marginTop: '24px', fontWeight: '800', fontSize: '24px' }}>Access Denied</h2>
                <p style={{ color: subTextColor, marginTop: '8px' }}>You don't have permission to view Invoices.</p>
            </div>
        );
    }

    if (view === 'form') {
        return (
            <div className="min-h-screen transition-colors duration-500" style={{ padding: '40px', backgroundColor: bgColor, color: textColor }}>
                <form onSubmit={handleSubmit} style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <div>
                            <h2 style={{ fontSize: '32px', fontWeight: '900', color: textColor, letterSpacing: '-0.02em', marginBottom: '8px' }}>{isEditing ? 'Edit Invoice' : 'Create New Invoice'}</h2>
                            <p style={{ color: subTextColor }}>Fill in the details below to generate a new billing document.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button type="button" onClick={() => setView('list')}
                                style={{ padding: '12px 24px', border: `1px solid ${borderColor}`, borderRadius: '12px', background: cardBg, color: textColor, fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                            <Restricted to="Invoices" action="Write">
                                <button type="submit"
                                    style={{ padding: '12px 32px', border: 'none', borderRadius: '12px', background: accentColor, color: 'white', fontWeight: '800', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Save size={18} /> Save Invoice
                                </button>
                            </Restricted>
                        </div>
                    </div>

                    {/* Section: Invoice Information */}
                    <div style={sectionStyle}>
                        <h3 style={sectionHeaderStyle}>Invoice Information</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                            {/* Left */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Invoice Owner</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <User size={16} color={subTextColor} />
                                        <input type="text" name="invoiceOwner" value={formData.invoiceOwner} onChange={handleInputChange} style={inputStyle} />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Invoice Number</label>
                                    <input type="text" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleInputChange} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Subject <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} required style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Invoice Date</label>
                                    <input type="date" name="invoiceDate" value={formData.invoiceDate} onChange={handleInputChange} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Due Date</label>
                                    <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} style={inputStyle} />
                                </div>
                            </div>
                            {/* Right */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Sales Order</label>
                                    <input type="text" name="salesOrder" value={formData.salesOrder} onChange={handleInputChange} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Purchase Order</label>
                                    <input type="text" name="purchaseOrder" value={formData.purchaseOrder} onChange={handleInputChange} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Excise Duty (₹)</label>
                                    <input type="number" name="exciseDuty" value={formData.exciseDuty} onChange={handleInputChange} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Status</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange} style={inputStyle}>
                                        <option>Created</option>
                                        <option>Approved</option>
                                        <option>Sent</option>
                                        <option>Paid</option>
                                        <option>Overdue</option>
                                        <option>Void</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Sales Commission (₹)</label>
                                    <input type="number" name="salesCommission" value={formData.salesCommission} onChange={handleInputChange} style={inputStyle} />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: `1px solid ${borderColor}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                            <div>
                                <h4 style={{ fontSize: '14px', fontWeight: '800', color: textColor, marginBottom: '16px' }}>Customer Details</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div><label style={labelStyle}>Account Name</label><input type="text" name="accountName" value={formData.accountName} onChange={handleInputChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Contact Name</label><input type="text" name="contactName" value={formData.contactName} onChange={handleInputChange} style={inputStyle} /></div>
                                </div>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '14px', fontWeight: '800', color: textColor, marginBottom: '16px' }}>Contact Info</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div><label style={labelStyle}>Phone</label><input type="text" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Email</label><input type="text" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} style={inputStyle} /></div>
                                </div>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={labelStyle}>Deal Name</label><input type="text" name="dealName" value={formData.dealName} onChange={handleInputChange} style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    {/* Section: Address Information */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                        {/* Billing */}
                        <div style={sectionStyle}>
                            <h3 style={sectionHeaderStyle}>Billing Address</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <input type="text" placeholder="Street" name="street" value={formData.billingAddress.street} onChange={(e) => handleInputChange(e, 'billingAddress')} style={inputStyle} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <input type="text" placeholder="City" name="city" value={formData.billingAddress.city} onChange={(e) => handleInputChange(e, 'billingAddress')} style={inputStyle} />
                                    <input type="text" placeholder="State" name="state" value={formData.billingAddress.state} onChange={(e) => handleInputChange(e, 'billingAddress')} style={inputStyle} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <input type="text" placeholder="Zip/Code" name="zip" value={formData.billingAddress.zip} onChange={(e) => handleInputChange(e, 'billingAddress')} style={inputStyle} />
                                    <input type="text" placeholder="Country" name="country" value={formData.billingAddress.country} onChange={(e) => handleInputChange(e, 'billingAddress')} style={inputStyle} />
                                </div>
                            </div>
                        </div>
                        {/* Shipping */}
                        <div style={sectionStyle}>
                            <h3 style={sectionHeaderStyle}>Shipping Address</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <input type="text" placeholder="Street" name="street" value={formData.shippingAddress.street} onChange={(e) => handleInputChange(e, 'shippingAddress')} style={inputStyle} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <input type="text" placeholder="City" name="city" value={formData.shippingAddress.city} onChange={(e) => handleInputChange(e, 'shippingAddress')} style={inputStyle} />
                                    <input type="text" placeholder="State" name="state" value={formData.shippingAddress.state} onChange={(e) => handleInputChange(e, 'shippingAddress')} style={inputStyle} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <input type="text" placeholder="Zip/Code" name="zip" value={formData.shippingAddress.zip} onChange={(e) => handleInputChange(e, 'shippingAddress')} style={inputStyle} />
                                    <input type="text" placeholder="Country" name="country" value={formData.shippingAddress.country} onChange={(e) => handleInputChange(e, 'shippingAddress')} style={inputStyle} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Invoiced Items */}
                    <div style={sectionStyle}>
                        <h3 style={sectionHeaderStyle}>Invoiced Items</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#f8fafc', fontSize: '12px', color: subTextColor }}>
                                        <th style={thStyle}>#</th>
                                        <th style={thStyle}>PRODUCT NAME</th>
                                        <th style={thStyle}>QTY</th>
                                        <th style={thStyle}>LIST PRICE (₹)</th>
                                        <th style={thStyle}>AMOUNT (₹)</th>
                                        <th style={thStyle}>DISCOUNT (₹)</th>
                                        <th style={thStyle}>TAX (₹)</th>
                                        <th style={thStyle}>TOTAL (₹)</th>
                                        <th style={thStyle}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.items.map((item, index) => (
                                        <tr key={index} style={{ borderBottom: `1px solid ${borderColor}` }}>
                                            <td style={tdStyle}>{index + 1}</td>
                                            <td style={tdStyle}>
                                                <input type="text" placeholder="Product Name" value={item.productName}
                                                    onChange={(e) => handleItemChange(index, 'productName', e.target.value)} style={{ ...inputStyle, padding: '8px' }} required />
                                                <textarea placeholder="Description" value={item.description}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)} style={{ ...inputStyle, padding: '8px', height: '36px', marginTop: '8px', fontSize: '12px' }} />
                                            </td>
                                            <td style={tdStyle}>
                                                <input type="number" value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} style={{ ...inputStyle, padding: '8px', width: '60px' }} />
                                            </td>
                                            <td style={tdStyle}>
                                                <input type="number" value={item.listPrice}
                                                    onChange={(e) => handleItemChange(index, 'listPrice', e.target.value)} style={{ ...inputStyle, padding: '8px', width: '100px' }} />
                                            </td>
                                            <td style={{ ...tdStyle, fontWeight: '700' }}>
                                                {item.amount.toFixed(2)}
                                            </td>
                                            <td style={tdStyle}>
                                                <input type="number" value={item.discount}
                                                    onChange={(e) => handleItemChange(index, 'discount', e.target.value)} style={{ ...inputStyle, padding: '8px', width: '80px' }} />
                                            </td>
                                            <td style={tdStyle}>
                                                <input type="number" value={item.tax}
                                                    onChange={(e) => handleItemChange(index, 'tax', e.target.value)} style={{ ...inputStyle, padding: '8px', width: '80px' }} />
                                            </td>
                                            <td style={{ ...tdStyle, fontWeight: '800', color: accentColor }}>
                                                {item.total.toFixed(2)}
                                            </td>
                                            <td style={tdStyle}>
                                                <button type="button" onClick={() => removeItem(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button type="button" onClick={addItem}
                            style={{ marginTop: '24px', color: accentColor, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '13px' }}>
                            <Plus size={18} /> Add Line Item
                        </button>

                        {/* Totals Box */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                            <div style={{ width: '320px', backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#f8fafc', padding: '24px', borderRadius: '16px', border: `1px solid ${borderColor}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: subTextColor }}>
                                    <span>Sub Total (₹)</span>
                                    <span style={{ color: textColor, fontWeight: '600' }}>{formData.subTotal.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: subTextColor }}>
                                    <span>Discount (₹)</span>
                                    <span style={{ color: textColor }}>(-) {formData.discountTotal.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: subTextColor }}>
                                    <span>Tax (₹)</span>
                                    <span style={{ color: textColor }}>(+) {formData.taxTotal.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '14px', color: subTextColor }}>
                                    <span>Adjustment (₹)</span>
                                    <input type="number" value={formData.adjustment}
                                        onChange={(e) => handleInputChange(e)} name="adjustment"
                                        style={{ ...inputStyle, width: '100px', textAlign: 'right', padding: '6px' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: `1px solid ${borderColor}`, fontSize: '16px', fontWeight: '800', color: textColor }}>
                                    <span>Grand Total (₹)</span>
                                    <span style={{ color: accentColor, fontSize: '20px' }}>{formData.grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Terms & Desc */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        <div style={sectionStyle}>
                            <h3 style={sectionHeaderStyle}>Terms and Conditions</h3>
                            <textarea name="termsAndConditions" value={formData.termsAndConditions} onChange={handleInputChange} style={{ ...inputStyle, height: '100px', resize: 'vertical' }} />
                        </div>
                        <div style={sectionStyle}>
                            <h3 style={sectionHeaderStyle}>Description Information</h3>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} style={{ ...inputStyle, height: '100px', resize: 'vertical' }} />
                        </div>
                    </div>

                </form>
            </div>
        );
    }

    // --- LIST VIEW ---
    return (
        <div className="min-h-screen transition-colors duration-500" style={{ padding: '40px', backgroundColor: bgColor, color: textColor }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '40px', maxWidth: '1400px', margin: '0 auto' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ backgroundColor: accentColor, padding: '8px', borderRadius: '12px', boxShadow: `0 10px 15px -3px ${accentColor}40` }}>
                            <FileText size={20} className="text-white" />
                        </div>
                        <span style={{ color: accentColor, fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Financial Log</span>
                    </div>
                    <h1 style={{ fontSize: '48px', fontWeight: '900', color: textColor, letterSpacing: '-0.02em', lineHeight: '1' }}>Invoices</h1>
                    <p style={{ color: subTextColor, marginTop: '16px', fontSize: '18px' }}>Manage and track all generated billing documents and their statuses.</p>
                </div>
                <Restricted to="Invoices" action="Write">
                    <button onClick={createNewInfo} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 32px', backgroundColor: accentColor, color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', fontWeight: '800', boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)', transition: 'transform 0.2s', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.05em' }}>
                        <Plus size={18} /> New Invoice
                    </button>
                </Restricted>
            </div>

            {/* List */}
            <div style={{ maxWidth: '1400px', margin: '0 auto', border: `1px solid ${borderColor}`, borderRadius: '32px', overflow: 'hidden', backgroundColor: cardBg, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                        <tr>
                            {columns.map((col, index) => col.visible && (
                                <th
                                    key={col.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragEnter={(e) => handleDragEnter(e, index)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => e.preventDefault()}
                                    style={{ ...thStyle, cursor: 'grab' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <GripVertical size={14} color={subTextColor} />
                                        {col.label}
                                    </div>
                                </th>
                            ))}
                            <th style={thStyle}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length === 0 && !loading && (
                            <tr>
                                <td colSpan={columns.length + 1} style={{ padding: '64px', textAlign: 'center', color: subTextColor }}>No invoices found in registry.</td>
                            </tr>
                        )}
                        {invoices.map(inv => (
                            <tr key={inv._id} style={{ borderBottom: `1px solid ${borderColor}`, transition: 'all 0.1s' }} className={isDark ? "hover:bg-white/5" : "hover:bg-slate-100"}>
                                {columns.map(col => col.visible && (
                                    <td key={col.id} style={tdStyle}>
                                        {col.id === 'grandTotal' && '₹'}
                                        {col.id.toLowerCase().includes('date') ? (inv[col.id] ? new Date(inv[col.id]).toLocaleDateString() : '') :
                                            col.id === 'grandTotal' ? (inv[col.id] || 0).toLocaleString() :
                                                col.id === 'status' ? (
                                                    <span style={{
                                                        padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase',
                                                        backgroundColor: inv.status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : inv.status === 'Overdue' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                        color: inv.status === 'Paid' ? '#10b981' : inv.status === 'Overdue' ? '#ef4444' : '#3b82f6'
                                                    }}>
                                                        {inv.status}
                                                    </span>
                                                ) : inv[col.id]}
                                    </td>
                                ))}
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <Restricted to="Invoices" action="Write">
                                            <button title="Edit" onClick={() => handleEdit(inv)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: subTextColor }} className="hover:text-blue-500 transition-colors"><Edit size={18} /></button>
                                        </Restricted>
                                        <Restricted to="Invoices" action="Delete">
                                            <button title="Delete" onClick={() => handleDelete(inv._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: subTextColor }} className="hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                        </Restricted>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ maxWidth: '1400px', margin: '24px auto', fontSize: '12px', color: subTextColor, fontStyle: 'italic' }}>
                Tip: Drag column headers to reorder them based on your preference.
            </div>
        </div >
    );
};

export default Invoices;
