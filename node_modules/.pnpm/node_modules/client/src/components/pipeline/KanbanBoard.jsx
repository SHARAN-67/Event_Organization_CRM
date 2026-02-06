import React, { useState } from 'react';
import { MoreHorizontal, Trash2, Edit, MapPin, Users, Calendar, IndianRupee } from 'lucide-react';
import './KanbanBoard.css';

const DEFAULT_STAGES = ['Prospecting', 'Processing', 'Live', 'Completed'];

export const KanbanBoard = ({
    events,
    updateEventStage,
    deleteEvent,
    onEditEvent,
    canWrite = true,
    canDelete = true
}) => {
    const [activeMenu, setActiveMenu] = useState(null);
    const [dragOverStage, setDragOverStage] = useState(null);

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

    const handleDragEnter = (stage) => {
        setDragOverStage(stage);
    };

    const handleDragLeave = () => {
        setDragOverStage(null);
    };

    const handleDrop = (e, stage) => {
        e.preventDefault();
        const eventId = e.dataTransfer.getData('eventId');
        if (eventId) {
            updateEventStage(eventId, stage);
        }
        setDragOverStage(null);
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
                        onDragEnter={() => handleDragEnter(stage)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, stage)}
                    >
                        <div className={`kanban-column-header ${stageClass}`}>
                            <h3 className={`kanban-column-title ${stageClass}`}>
                                {stage}
                            </h3>
                            <span className="kanban-column-count">
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
                                    >
                                        <div className="kanban-card-header">
                                            <h4 className="kanban-card-title">
                                                {event.title || 'Untitled'}
                                            </h4>

                                            <div className="kanban-card-actions">
                                                {event.stage === 'Live' && event.changeLog && event.changeLog.length > 0 && (
                                                    <span
                                                        className="kanban-warning-icon"
                                                        title="Changes detected in Live stage"
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
                                                    >
                                                        {canWrite && (
                                                            <button
                                                                className="kanban-menu-item edit"
                                                                onClick={() => handleEditClick(event)}
                                                            >
                                                                <Edit size={14} /> Edit
                                                            </button>
                                                        )}
                                                        {canDelete && (
                                                            <button
                                                                className="kanban-menu-item delete"
                                                                onClick={() => handleDeleteClick(event._id)}
                                                            >
                                                                <Trash2 size={14} /> Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="kanban-card-content">
                                            <div className="kanban-card-info">
                                                <MapPin size={14} />
                                                {event.venue || 'No Venue'}
                                            </div>

                                            <div className="kanban-card-info">
                                                <Users size={14} />
                                                {event.attendees ? `${event.attendees} Attendees` : 'Attendees not set'}
                                            </div>

                                            <div className="kanban-card-value">
                                                <IndianRupee size={12} />
                                                {formatCurrency(event.value)}
                                            </div>

                                            {event.date && (
                                                <div className="kanban-card-date">
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
