import React, { useState } from 'react';
import { MoreHorizontal, Trash2, Edit, MapPin, Users, Calendar, IndianRupee } from 'lucide-react';

const STAGES = ['Prospecting', 'Processing', 'Live', 'Completed'];

const KanbanBoard = ({ events, updateEventStage, deleteEvent, onEditEvent, canWrite = true, canDelete = true }) => {
    const [activeMenu, setActiveMenu] = useState(null);

    const onDragStart = (e, id) => {
        if (!canWrite) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('eventId', id);
    };

    const onDragOver = (e) => {
        e.preventDefault();
    };

    const onDrop = (e, stage) => {
        const eventId = e.dataTransfer.getData('eventId');
        if (eventId) {
            updateEventStage(eventId, stage);
        }
    };

    const toggleMenu = (e, id) => {
        e.stopPropagation();
        setActiveMenu(activeMenu === id ? null : id);
    };

    // Close menu when clicking elsewhere handled by transparent overlay or global listener, simpler:
    const closeMenu = () => setActiveMenu(null);

    const getHeaderColor = (stage) => {
        switch (stage) {
            case 'Prospecting': return '#3b82f6';
            case 'Processing': return '#f59e0b';
            case 'Live': return '#f0e809ff';
            case 'Completed': return '#22e714ff';
            default: return 'black';
        }
    };

    return (
        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '40px', minHeight: '600px' }} onClick={closeMenu}>
            {STAGES.map(stage => (
                <div
                    key={stage}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, stage)}
                    style={{
                        flex: '1',
                        minWidth: '300px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        border: '1px solid #e2e8f0'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingBottom: '12px',
                        borderBottom: `3px solid ${getHeaderColor(stage)}`
                    }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>{stage}</h3>
                        <span style={{
                            fontSize: '0.75rem', fontWeight: '600',
                            backgroundColor: 'white',
                            padding: '2px 10px',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            color: '#64748b'
                        }}>
                            {events.filter(e => e.stage === stage).length}
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                        {events.filter(e => e.stage === stage).map(event => (
                            <div
                                key={event._id}
                                draggable
                                onDragStart={(e) => onDragStart(e, event._id)}
                                style={{
                                    backgroundColor: 'white',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    cursor: canWrite ? 'grab' : 'default',
                                    border: '1px solid #f1f5f9',
                                    position: 'relative',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 12px -3px rgba(0, 0, 0, 0.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>{event.title}</h4>

                                    {/* Action Menu Trigger */}
                                    <div style={{ position: 'relative' }}>
                                        {(canWrite || canDelete) && (
                                            <button
                                                onClick={(e) => toggleMenu(e, event._id)}
                                                style={{
                                                    background: 'none', border: 'none', cursor: 'pointer', color: '#64748b',
                                                    padding: '4px', borderRadius: '4px'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>
                                        )}

                                        {/* Dropdown Menu */}
                                        {activeMenu === event._id && (
                                            <div style={{
                                                position: 'absolute', top: '100%', right: 0, zIndex: 10,
                                                backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden', minWidth: '120px'
                                            }} onClick={(e) => e.stopPropagation()}>
                                                {canWrite && (
                                                    <button
                                                        onClick={() => { onEditEvent(event); closeMenu(); }}
                                                        style={{ ...menuItemStyle, color: '#475569' }}
                                                    >
                                                        <Edit size={14} /> Edit
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={() => { deleteEvent(event._id); closeMenu(); }}
                                                        style={{ ...menuItemStyle, color: '#ef4444' }}
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <MapPin size={14} /> {event.venue || 'No Venue'}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Users size={14} /> {event.attendees ? `${event.attendees} Attendees` : 'Attendees not set'}
                                    </div>
                                    <div style={{
                                        marginTop: '4px',
                                        fontSize: '0.9rem', fontWeight: '600', color: '#3b82f6',
                                        backgroundColor: '#eff6ff', width: 'fit-content', padding: '4px 8px', borderRadius: '6px',
                                        display: 'flex', alignItems: 'center', gap: '4px'
                                    }}>
                                        <IndianRupee size={12} /> {(event.value || 0).toLocaleString()}
                                    </div>
                                    {event.date && (
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Calendar size={12} /> {new Date(event.date).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const menuItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px 16px',
    backgroundColor: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500',
    textAlign: 'left',
    transition: 'background-color 0.2s'
};

export { KanbanBoard };
