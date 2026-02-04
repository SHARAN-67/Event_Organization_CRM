import React from "react";
import { KanbanCard } from "./KanbanCard.jsx";

const columnStyles = {
    column: {
        backgroundColor: '#f9fafb',
        borderRadius: '0.5rem',
        padding: '1rem',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.5rem',
    },
    titleContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    colorDot: {
        width: '0.75rem',
        height: '0.75rem',
        borderRadius: '50%',
    },
    title: {
        fontWeight: '600',
        fontSize: '0.875rem',
        color: '#374151',
    },
    count: {
        backgroundColor: '#e5e7eb',
        color: '#6b7280',
        padding: '0.125rem 0.5rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '500',
    },
    cardList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        flex: 1,
    },
    emptyState: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        color: '#9ca3af',
        fontSize: '0.875rem',
        fontStyle: 'italic',
    },
};

export function KanbanColumn({
    id,
    title,
    color,
    count,
    events,
    stages,
    onEditEvent,
    onDeleteEvent,
    onMoveEvent
}) {
    return (
        <div style={columnStyles.column}>
            <div style={columnStyles.header}>
                <div style={columnStyles.titleContainer}>
                    <div style={{ ...columnStyles.colorDot, backgroundColor: color }} />
                    <span style={columnStyles.title}>{title}</span>
                </div>
                <span style={columnStyles.count}>{count}</span>
            </div>

            <div style={columnStyles.cardList}>
                {events.length === 0 ? (
                    <div style={columnStyles.emptyState}>No events</div>
                ) : (
                    events.map((event) => (
                        <KanbanCard
                            key={event.id}
                            event={event}
                            currentStage={id}
                            stages={stages}
                            onEdit={() => onEditEvent(event)}
                            onDelete={() => onDeleteEvent(event.id)}
                            onMove={(toStage) => onMoveEvent(event.id, id, toStage)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
