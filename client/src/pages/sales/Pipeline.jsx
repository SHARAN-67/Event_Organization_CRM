import { useState, useEffect, useMemo } from "react";
import { Plus, Kanban, Layers, Shield, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/pipeline/KanbanBoard.jsx";
import { EventFormDialog } from "@/components/pipeline/EventFormDialog.jsx";
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "../../theme/ThemeContext";
import './Pipeline.css';

export default function Pipeline() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const { events, fetchEvents, createEvent, updateEvent, updateEventStage, deleteEvent, acknowledgeChanges } = useEvents();
    const { userId, hasPermission } = useAuth();
    const { theme } = useTheme();

    // History Modal State
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedHistoryEvent, setSelectedHistoryEvent] = useState(null);

    const canWrite = hasPermission('Pipeline', 'Write');
    const canDelete = hasPermission('Pipeline', 'Delete');

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Calculate events with unread changes (Live/Processing status and has unacknowledged changeLog)
    const unreadChangesEvents = useMemo(() => {
        const auditedStages = ['Live', 'Processing'];
        return events.filter(ev => {
            if (!auditedStages.includes(ev.stage) || !ev.changeLog || ev.changeLog.length === 0) return false;
            // Check if there's any log NOT acknowledged by the current user
            return ev.changeLog.some(log => !log.acknowledgedBy || !log.acknowledgedBy.includes(userId));
        });
    }, [events, userId]);

    const openHistoryModal = (event) => {
        setSelectedHistoryEvent(event);
        setShowHistoryModal(true);
    };

    const isDark = theme === 'dark' || theme === 'night';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const subTextColor = isDark ? '#94a3b8' : '#64748b';
    const bgColor = theme === 'light' ? '#f8fafc' : theme === 'dark' ? '#0f172a' : '#020617';
    const cardBg = theme === 'light' ? '#ffffff' : theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(15, 23, 42, 0.5)';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0';

    const handleCreateOpen = () => {
        setSelectedEvent(null);
        setDialogOpen(true);
    };

    const handleEditOpen = (event) => {
        setSelectedEvent(event);
        setDialogOpen(true);
    };

    const handleSubmit = async (formData) => {
        if (selectedEvent) {
            await updateEvent(selectedEvent._id, formData);
        } else {
            await createEvent(formData);
        }
    };

    return (
        <div className="min-h-screen transition-colors duration-500 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ backgroundColor: bgColor, color: textColor }}>
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 text-left">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3" style={{ color: textColor }}>
                        <div className="w-2 h-10 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                        EVENT PIPELINE
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded border border-emerald-500/20 uppercase tracking-widest">Stage Control</span>
                        <p className="text-xs font-bold opacity-40 uppercase tracking-tight">Synchronization Status: Active</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    {canWrite && (
                        <button
                            onClick={handleCreateOpen}
                            className="bg-emerald-500 text-slate-950 font-black px-8 py-3 rounded-2xl flex items-center gap-3 text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
                        >
                            <Plus size={16} /> New Fragment
                        </button>
                    )}
                    <button
                        onClick={() => fetchEvents()}
                        className="p-3 border rounded-2xl transition-all hover:rotate-180 duration-500"
                        style={{ backgroundColor: cardBg, borderColor: borderColor, color: subTextColor }}
                        title="Refresh Pipeline Data"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* Warning Banner */}
            {unreadChangesEvents.length > 0 && (
                <div className="warning-banner" style={{ margin: '0 32px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span>⚠️ <strong>Security Audit Required:</strong> {unreadChangesEvents.length} active pipeline item(s) (Live/Processing) have been modified. Review changes to ensure protocol compliance.</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => acknowledgeChanges(unreadChangesEvents[0]._id)}
                            className="seen-button"
                        >
                            Mark as Seen
                        </button>
                        <button className="view-details-button" onClick={() => openHistoryModal(unreadChangesEvents[0])}>
                            View Details
                        </button>
                    </div>
                </div>
            )}

            {/* Kanban Hub */}
            <div className="p-8 border rounded-[3rem] transition-all shadow-2xl overflow-hidden" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                <div className="flex items-center gap-4 mb-10 text-left">
                    <Kanban size={20} className="text-emerald-500" />
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] opacity-50">Operation Grid Matrix</h2>
                </div>

                <KanbanBoard
                    events={events} // Note: events here are actually deals fetched by useEvents
                    updateEventStage={updateEventStage}
                    deleteEvent={deleteEvent}
                    onEditEvent={handleEditOpen}
                    acknowledgeChanges={acknowledgeChanges}
                    canWrite={canWrite}
                    canDelete={canDelete}
                />
            </div>

            <EventFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                initialData={selectedEvent}
                onSubmit={handleSubmit}
            />

            {/* History Modal */}
            {showHistoryModal && selectedHistoryEvent && (
                <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
                    <div className="history-modal-content" onClick={e => e.stopPropagation()} style={{ backgroundColor: theme === 'light' ? '#ffffff' : '#1e293b', border: `1px solid ${borderColor}` }}>
                        <div className="modal-header" style={{ borderBottom: `1px solid ${borderColor}` }}>
                            <h2 style={{ color: textColor }}>Change Audit Log: {selectedHistoryEvent.title || 'Untitled'}</h2>
                            <button className="modal-close" onClick={() => setShowHistoryModal(false)}>
                                <X size={20} style={{ color: subTextColor }} />
                            </button>
                        </div>
                        <div className="history-list" style={{ color: textColor }}>
                            {(!selectedHistoryEvent.changeLog || selectedHistoryEvent.changeLog.length === 0) ? (
                                <p style={{ textAlign: 'center', color: '#64748b' }}>No changes recorded.</p>
                            ) : (
                                [...selectedHistoryEvent.changeLog].reverse().map((log, idx) => (
                                    <div key={idx} className="history-item">
                                        <div className="history-meta">{new Date(log.timestamp).toLocaleString()}</div>
                                        {log.changes.map((change, cIdx) => (
                                            <div key={cIdx} className="change-detail">
                                                <span className="change-field">{change.field}</span>
                                                <span className="change-arrow">→</span>
                                                <span className="old-value">{String(change.oldValue)}</span>
                                                <span style={{ margin: '0 5px', color: '#94a3b8' }}>to</span>
                                                <span className="new-value">{String(change.newValue)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
