import { useState, useEffect } from "react";
import { Plus, Kanban, Layers, Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/pipeline/KanbanBoard.jsx";
import { EventFormDialog } from "@/components/pipeline/EventFormDialog.jsx";
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "../../theme/ThemeContext";

export default function Pipeline() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const { events, fetchEvents, createEvent, updateEvent, updateEventStage, deleteEvent } = useEvents();
    const { hasPermission } = useAuth();
    const { theme } = useTheme();

    const canWrite = hasPermission('Pipeline', 'Write');
    const canDelete = hasPermission('Pipeline', 'Delete');

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

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
                        <div className="w-2 h-10 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.3)]" />
                        EVENT PIPELINE
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded border border-amber-500/20 uppercase tracking-widest">Stage Control</span>
                        <p className="text-xs font-bold opacity-40 uppercase tracking-tight">Synchronization Status: Active</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    {canWrite && (
                        <button
                            onClick={handleCreateOpen}
                            className="bg-amber-500 text-slate-950 font-black px-8 py-3 rounded-2xl flex items-center gap-3 text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-amber-500/20"
                        >
                            <Plus size={16} /> New Fragment
                        </button>
                    )}
                    <button className="p-3 border rounded-2xl transition-all" style={{ backgroundColor: cardBg, borderColor: borderColor, color: subTextColor }}>
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* Kanban Hub */}
            <div className="p-8 border rounded-[3rem] transition-all shadow-2xl overflow-hidden" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                <div className="flex items-center gap-4 mb-10 text-left">
                    <Kanban size={20} className="text-amber-500" />
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] opacity-50">Operation Grid Matrix</h2>
                </div>

                <KanbanBoard
                    events={events}
                    updateEventStage={updateEventStage}
                    deleteEvent={deleteEvent}
                    onEditEvent={handleEditOpen}
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
        </div>
    );
}
