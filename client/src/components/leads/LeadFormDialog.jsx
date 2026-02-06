
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { User, Building, Mail, Phone, DollarSign, Globe, FileText, PlusCircle } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';

const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost', 'Negotiation', 'Won', 'Approved', 'Rejected', 'Processing', 'Completed', 'Other'];

const LeadFormDialog = ({ open, onOpenChange, initialData = null, onSubmit, readOnly = false, assistants = [] }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || theme === 'night';
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        value: '',
        status: 'New',
        source: '',
        notes: '',
        otherStatus: '',
        owner: ''
    });

    useEffect(() => {
        if (open) {
            if (initialData) {
                const isOther = !LEAD_STATUSES.includes(initialData.status) && initialData.status;
                setFormData({
                    name: initialData.name || '',
                    company: initialData.company || '',
                    email: initialData.email || '',
                    phone_number: initialData.phone_number || '',
                    value: initialData.value || '',
                    status: isOther ? 'Other' : (initialData.status || 'New'),
                    otherStatus: isOther ? initialData.status : '',
                    source: initialData.source || '',
                    notes: initialData.notes || '',
                    owner: initialData.owner || '',
                    assignedTo: initialData.assignedTo ? (initialData.assignedTo._id || initialData.assignedTo) : ''
                });
            } else {
                setFormData({
                    name: '',
                    company: '',
                    email: '',
                    phone_number: '',
                    value: '',
                    status: 'New',
                    source: '',
                    notes: '',
                    otherStatus: '',
                    owner: '',
                    assignedTo: ''
                });
            }
        }
    }, [open, initialData]);

    const handleChange = (e) => {
        if (readOnly) return;
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value) => {
        if (readOnly) return;
        setFormData(prev => ({ ...prev, status: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!readOnly) {
            const finalData = { ...formData };
            if (formData.status === 'Other') {
                finalData.status = formData.otherStatus;
            }
            delete finalData.otherStatus;
            onSubmit(finalData);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent style={{ maxWidth: '600px' }}>
                <DialogHeader>
                    <DialogTitle>
                        {readOnly ? 'Lead Parameters' : (initialData ? 'Update Lead Record' : 'Initialize New Lead')}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <Label style={{ display: 'flex', alignItems: 'center' }}><User size={14} style={{ marginRight: '6px' }} /> Full Name</Label>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Peter Parker"
                                required
                                disabled={readOnly}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <Label style={{ display: 'flex', alignItems: 'center' }}><Building size={14} style={{ marginRight: '6px' }} /> Company</Label>
                            <Input
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                placeholder="e.g. Stark Ind."
                                required
                                disabled={readOnly}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <Label style={{ display: 'flex', alignItems: 'center' }}><Mail size={14} style={{ marginRight: '6px' }} /> Email Address</Label>
                            <Input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="peter@domain.com"
                                required
                                disabled={readOnly}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <Label style={{ display: 'flex', alignItems: 'center' }}><Phone size={14} style={{ marginRight: '6px' }} /> Phone Number</Label>
                            <Input
                                type="tel"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                placeholder="+91 00000 00000"
                                required
                                disabled={readOnly}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <Label style={{ display: 'flex', alignItems: 'center' }}><DollarSign size={14} style={{ marginRight: '6px' }} /> Lead Value</Label>
                            <Input
                                name="value"
                                value={formData.value}
                                onChange={handleChange}
                                placeholder="₹ 0.00"
                                required
                                disabled={readOnly}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <Label style={{ display: 'flex', alignItems: 'center' }}>Status</Label>
                            {readOnly ? (
                                <Input value={formData.status} disabled />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <Select value={formData.status} onValueChange={handleSelectChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Current Stage" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LEAD_STATUSES.map(status => (
                                                <SelectItem key={status} value={status}>
                                                    {status}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formData.status === 'Other' && (
                                        <div style={{ position: 'relative' }}>
                                            <PlusCircle size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                            <Input
                                                name="otherStatus"
                                                value={formData.otherStatus}
                                                onChange={handleChange}
                                                placeholder="Specify custom status..."
                                                required
                                                style={{ paddingLeft: '34px' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <Label style={{ display: 'flex', alignItems: 'center' }}><Globe size={14} style={{ marginRight: '6px' }} /> Lead Source</Label>
                            <Input
                                name="source"
                                value={formData.source}
                                onChange={handleChange}
                                placeholder="e.g. Website, Referral"
                                required
                                disabled={readOnly}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <Label style={{ display: 'flex', alignItems: 'center' }}><User size={14} style={{ marginRight: '6px' }} /> Assigned To</Label>
                            {readOnly ? (
                                <Input
                                    value={initialData?.assignedTo?.name || (assistants.find(a => a._id === formData.assignedTo)?.name) || 'Unassigned'}
                                    disabled
                                />
                            ) : (
                                <Select
                                    value={formData.assignedTo}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select User" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {assistants.map(a => (
                                            <SelectItem key={a._id} value={a._id}>
                                                {a.agId ? `[${a.agId}] ` : ''}{a.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <Label style={{ display: 'flex', alignItems: 'center' }}><FileText size={14} style={{ marginRight: '6px' }} /> Mission Notes</Label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={(e) => handleChange(e)}
                            placeholder="Additional intelligence..."
                            required
                            disabled={readOnly}
                            style={{
                                width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'}`,
                                backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                                outline: 'none', minHeight: '100px', resize: 'none',
                                boxSizing: 'border-box', color: isDark ? '#f1f5f9' : '#0f172a', fontSize: '0.925rem'
                            }}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => onOpenChange(false)}
                        >
                            {readOnly ? 'Close Station' : 'Abort'}
                        </Button>
                        {!readOnly && (
                            <Button type="submit" variant="primary">
                                {initialData ? 'Commit Record' : 'Establish Lead'}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default LeadFormDialog;
