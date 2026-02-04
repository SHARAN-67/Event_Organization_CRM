import React, { useState } from "react";
import { Edit2, Trash2, MoveRight, Calendar, MapPin, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

const cardStyles = {
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '0.5rem',
        padding: '1rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
    },
    cardHover: {
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transform: 'translateY(-2px)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '0.75rem',
    },
    name: {
        fontWeight: '600',
        fontSize: '0.9375rem',
        color: '#111827',
        margin: 0,
        flex: 1,
    },
    actions: {
        display: 'flex',
        gap: '0.25rem',
    },
    actionBtn: {
        padding: '0.25rem',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        borderRadius: '0.25rem',
        color: '#6b7280',
        transition: 'all 0.2s',
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.375rem',
        fontSize: '0.8125rem',
        color: '#6b7280',
    },
    detailRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    moveMenu: {
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '0.25rem',
        backgroundColor: '#ffffff',
        borderRadius: '0.375rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        padding: '0.25rem',
        zIndex: 10,
        minWidth: '120px',
    },
    moveMenuItem: {
        padding: '0.5rem 0.75rem',
        fontSize: '0.8125rem',
        cursor: 'pointer',
        borderRadius: '0.25rem',
        transition: 'background-color 0.2s',
    },
};

export function KanbanCard({ event, currentStage, stages, onEdit, onDelete, onMove, isOverlay = false }) {
    const [isHovered, setIsHovered] = useState(false);
    const [showMoveMenu, setShowMoveMenu] = useState(false);

    const otherStages = stages?.filter(s => s.id !== currentStage) || [];

    return (
        <div
            style={{
                ...cardStyles.card,
                ...(isHovered && !isOverlay ? cardStyles.cardHover : {}),
                ...(isOverlay ? { opacity: 0.9, transform: 'rotate(3deg)' } : {}),
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setShowMoveMenu(false);
            }}
        >
            <div style={cardStyles.header}>
                <h3 style={cardStyles.name}>{event.name}</h3>
                {isHovered && (
                    <div style={cardStyles.actions}>
                        <div style={{ position: 'relative' }}>
                            <button
                                style={cardStyles.actionBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMoveMenu(!showMoveMenu);
                                }}
                                title="Move to stage"
                            >
                                <MoveRight size={16} />
                            </button>
                            {showMoveMenu && (
                                <div style={cardStyles.moveMenu}>
                                    {otherStages.map(stage => (
                                        <div
                                            key={stage.id}
                                            style={cardStyles.moveMenuItem}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onMove(stage.id);
                                                setShowMoveMenu(false);
                                            }}
                                            onMouseEnter={(e) => { e.target.style.backgroundColor = '#f3f4f6'; }}
                                            onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}
                                        >
                                            {stage.title}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            style={cardStyles.actionBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                            title="Edit"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            style={{ ...cardStyles.actionBtn, color: '#ef4444' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>

            <div style={cardStyles.details}>
                {event.date && (
                    <div style={cardStyles.detailRow}>
                        <Calendar size={14} />
                        <span>{event.date}</span>
                    </div>
                )}
                {event.venue && (
                    <div style={cardStyles.detailRow}>
                        <MapPin size={14} />
                        <span>{event.venue}</span>
                    </div>
                )}
                {event.attendees > 0 && (
                    <div style={cardStyles.detailRow}>
                        <Users size={14} />
                        <span>{event.attendees} attendees</span>
                    </div>
                )}
                {event.budget && (
                    <div style={cardStyles.detailRow}>
                        <DollarSign size={14} />
                        <span>{event.budget}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
