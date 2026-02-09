import React, { useState } from 'react';
import { MoreHorizontal, Trash2, Edit, MapPin, Users, Calendar, IndianRupee, CheckCircle } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import './KanbanBoard.css';

const DEFAULT_STAGES = ['Prospecting', 'Processing', 'Live', 'Completed'];

export const KanbanBoard = ({
    events,
    updateEventStage,
    deleteEvent,
    onEditEvent,
    canWrite = true,
    canDelete = true,
    acknowledgeChanges
}) => {
    const { theme } = useTheme();
    const { userId } = useAuth();
    const [activeMenu, setActiveMenu] = useState(null);
    const [dragOverStage, setDragOverStage] = useState(null);
    const [dragCounter, setDragCounter] = useState(0);

    const isDark = theme === 'dark' || theme === 'night';
    const cardBg = theme === 'light' ? '#ffffff' : theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(15, 23, 42, 0.5)';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const subTextColor = isDark ? '#94a3b8' : '#64748b';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9';
    const iconBg = isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc';
    const columnBg = theme === 'light' ? '#f8fafc' : isDark ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.2)';

    // Dynamic stages: Defaults + any other stage found in events
    const allStages = [...new Set([...DEFAULT_STAGES, ...events.map(e => e.stage)])];

    const handleDragStart = (e, id) => {
        if (!canWrite) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('eventId', id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnter = (e, stage) => {
        e.preventDefault();
        setDragCounter(prev => prev + 1);
        setDragOverStage(stage);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragCounter(prev => {
            const newCount = prev - 1;
            if (newCount === 0) {
                setDragOverStage(null);
            }
            return newCount;
        });
    };

    const handleDrop = (e, stage) => {
        e.preventDefault();
        const eventId = e.dataTransfer.getData('eventId');
        if (eventId) {
            updateEventStage(eventId, stage);
        }
        setDragOverStage(null);
        setDragCounter(0);
    };

    const toggleMenu = (e, id) => {
        e.stopPropagation();
        setActiveMenu(activeMenu === id ? null : id);
    };

    const closeMenu = () => setActiveMenu(null);

    const handleCardClick = (e, event) => {
        if (!e.defaultPrevented && canWrite) {
            onEditEvent(event);
        }
    };

    const handleMenuButtonClick = (e, eventId) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu(e, eventId);
    };

    const handleEditClick = (event) => {
        onEditEvent(event);
        closeMenu();
    };

    const handleDeleteClick = (eventId) => {
        if (window.confirm('Are you sure you want to delete this deal?')) {
            deleteEvent(eventId);
            closeMenu();
        }
    };

    const getStageClassName = (stage) => {
        return stage.toLowerCase().replace(/\s+/g, '-');
    };

    const formatCurrency = (value) => {
        return (value || 0).toLocaleString('en-IN');
    };

    const formatDate = (date) => {
        return date ? new Date(date).toLocaleDateString('en-IN') : 'No date';
    };

    return (
        <div className="kanban-board" onClick={closeMenu}>
            {allStages.map(stage => {
                const stageEvents = events.filter(e => e.stage === stage);
                const stageClass = getStageClassName(stage);
                const isDragOver = dragOverStage === stage;

                return (
                    <div
                        key={stage}
                        className={`kanban-column ${isDragOver ? 'drag-over' : ''}`}
                        onDragOver={handleDragOver}
                        onDragEnter={(e) => handleDragEnter(e, stage)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, stage)}
                        style={{ backgroundColor: columnBg, borderColor: borderColor }}
                    >
                        <div className={`kanban-column-header ${stageClass}`} style={{ borderBottomColor: borderColor }}>
                            <h3 className={`kanban-column-title ${stageClass}`}>
                                {stage}
                            </h3>
                            <span className="kanban-column-count" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', borderColor: borderColor, color: subTextColor }}>
                                {stageEvents.length}
                            </span>
                        </div>

                        <div className="kanban-card-list">
                            {stageEvents.length === 0 ? (
                                <div className="kanban-empty-state">
                                    No items in this stage
                                </div>
                            ) : (
                                stageEvents.map(event => (
                                    <div
                                        key={event._id}
                                        draggable={canWrite}
                                        onDragStart={(e) => handleDragStart(e, event._id)}
                                        onClick={(e) => handleCardClick(e, event)}
                                        className={`kanban-card ${canWrite ? 'clickable draggable' : ''}`}
                                        style={{ backgroundColor: cardBg, borderColor: borderColor }}
                                    >
                                        <div className="kanban-card-header">
                                            <h4 className="kanban-card-title" style={{ color: textColor }}>
                                                {event.title || 'Untitled'}
                                            </h4>

                                            <div className="kanban-card-actions">
                                                {(event.stage === 'Live' || event.stage === 'Processing') &&
                                                    event.changeLog &&
                                                    event.changeLog.some(log => !log.acknowledgedBy || !log.acknowledgedBy.includes(userId)) && (
                                                        <span
                                                            className="kanban-warning-icon"
                                                            title="Unacknowledged changes detected"
                                                        >
                                                            ⚠️
                                                        </span>
                                                    )}

                                                {(canWrite || canDelete) && (
                                                    <button
                                                        className="kanban-menu-button"
                                                        onClick={(e) => handleMenuButtonClick(e, event._id)}
                                                        aria-label="Open menu"
                                                    >
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                )}

                                                {activeMenu === event._id && (
                                                    <div
                                                        className="kanban-dropdown-menu"
                                                        onClick={(e) => e.stopPropagation()}
                                                        style={{ backgroundColor: cardBg, borderColor: borderColor }}
                                                    >
                                                        {canWrite && (
                                                            <button
                                                                className="kanban-menu-item edit"
                                                                onClick={() => handleEditClick(event)}
                                                                style={{ color: textColor }}
                                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc'}
                                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                            >
                                                                <Edit size={14} /> Edit
                                                            </button>
                                                        )}
                                                        {event.changeLog?.some(log => !log.acknowledgedBy || !log.acknowledgedBy.includes(userId)) && (
                                                            <button
                                                                className="kanban-menu-item seen"
                                                                onClick={() => {
                                                                    acknowledgeChanges(event._id || event.id);
                                                                    setActiveMenu(null);
                                                                }}
                                                                style={{ color: '#10b981' }}
                                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5'}
                                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                            >
                                                                <CheckCircle size={14} /> Mark as Seen
                                                            </button>
                                                        )}
                                                        {canDelete && (
                                                            <button
                                                                className="kanban-menu-item delete"
                                                                onClick={() => handleDeleteClick(event._id)}
                                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2'}
                                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                            >
                                                                <Trash2 size={14} /> Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="kanban-card-content">
                                            <div className="kanban-card-info" style={{ color: subTextColor }}>
                                                <MapPin size={14} />
                                                {event.venue || 'No Venue'}
                                            </div>

                                            <div className="kanban-card-info" style={{ color: subTextColor }}>
                                                <Users size={14} />
                                                {event.attendees ? `${event.attendees} Attendees` : 'Attendees not set'}
                                            </div>

                                            <div className="kanban-card-value" style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5', color: '#10b981' }}>
                                                <IndianRupee size={12} />
                                                {formatCurrency(event.value)}
                                            </div>

                                            {event.date && (
                                                <div className="kanban-card-date" style={{ color: subTextColor }}>
                                                    <Calendar size={12} />
                                                    {formatDate(event.date)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
