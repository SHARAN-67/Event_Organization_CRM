
import React, { useState, useEffect } from 'react';
import { Type, Calendar, IndianRupee, Users, MapPin, Layers, PlusCircle } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const EVENT_STAGES = ['Prospecting', 'Processing', 'Live', 'Completed', 'Other'];

const EventFormDialog = ({ open, onOpenChange, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        title: '',
        value: '',
        date: '',
        attendees: '',
        venue: '',
        stage: 'Prospecting',
        otherStage: ''
    });

    useEffect(() => {
        if (open && initialData) {
            const formattedDate = initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '';
            const isOther = !EVENT_STAGES.includes(initialData.stage) && initialData.stage;
            setFormData({
                title: initialData.title || '',
                value: initialData.value || '',
                date: formattedDate,
                attendees: initialData.attendees || '',
                venue: initialData.venue || '',
                stage: isOther ? 'Other' : (initialData.stage || 'Prospecting'),
                otherStage: isOther ? initialData.stage : ''
            });
        } else if (open) {
            setFormData({
                title: '',
                value: '',
                date: '',
                attendees: '',
                venue: '',
                stage: 'Prospecting',
                otherStage: ''
            });
        }
    }, [open, initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const finalData = { ...formData };
            if (formData.stage === 'Other') {
                finalData.stage = formData.otherStage;
            }
            delete finalData.otherStage;
            await onSubmit(finalData);
            onOpenChange(false);
        } catch (error) {
            // Error handled in hook
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (val) => {
        setFormData(prev => ({ ...prev, stage: val }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogHeader>
                <DialogTitle>
                    {initialData ? 'Update Event Matrix' : 'Initialize Mission Event'}
                </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Label style={{ display: 'flex', alignItems: 'center' }}><Type size={14} style={{ marginRight: '6px' }} /> Event Designation</Label>
                    <Input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Tech Summit 2025"
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <Label style={{ display: 'flex', alignItems: 'center' }}><Calendar size={14} style={{ marginRight: '6px' }} /> Scheduled Date</Label>
                        <Input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <Label style={{ display: 'flex', alignItems: 'center' }}><IndianRupee size={14} style={{ marginRight: '6px' }} /> Project Budget</Label>
                        <Input
                            type="number"
                            name="value"
                            value={formData.value}
                            onChange={handleChange}
                            required
                            placeholder="45,000"
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <Label style={{ display: 'flex', alignItems: 'center' }}><Users size={14} style={{ marginRight: '6px' }} /> Personnel Count</Label>
                        <Input
                            type="number"
                            name="attendees"
                            value={formData.attendees}
                            onChange={handleChange}
                            required
                            placeholder="500"
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <Label style={{ display: 'flex', alignItems: 'center' }}><MapPin size={14} style={{ marginRight: '6px' }} /> Designated Venue</Label>
                        <Input
                            type="text"
                            name="venue"
                            value={formData.venue}
                            onChange={handleChange}
                            required
                            placeholder="Convention Center"
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Label style={{ display: 'flex', alignItems: 'center' }}><Layers size={14} style={{ marginRight: '6px' }} /> Operation Stage</Label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Select
                            value={formData.stage}
                            onValueChange={handleSelectChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Prospecting" />
                            </SelectTrigger>
                            <SelectContent>
                                {EVENT_STAGES.map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {formData.stage === 'Other' && (
                            <div style={{ position: 'relative' }}>
                                <PlusCircle size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <Input
                                    name="otherStage"
                                    value={formData.otherStage}
                                    onChange={handleChange}
                                    placeholder="Specify custom stage..."
                                    required
                                    style={{ paddingLeft: '34px' }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Abort
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                    >
                        {initialData ? 'Update Matrix' : 'Launch Event'}
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    );
};

export { EventFormDialog };
