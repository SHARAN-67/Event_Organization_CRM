import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, CheckCircle2, Circle, Calendar, Flag, Edit, Users, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeContext';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newPriority, setNewPriority] = useState('medium');
    const [newDueDate, setNewDueDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [viewMode, setViewMode] = useState('personal'); // 'personal' or 'all'
    const { hasPermission, userRole } = useAuth();
    const { theme } = useTheme();
    const isAdmin = userRole === 'Admin';

    const canWrite = hasPermission('Tasks', 'Write');
    const canDelete = hasPermission('Tasks', 'Delete');

    const API_URL = 'http://localhost:5000/api/tasks';

    // Theme Variables
    const isDark = theme === 'dark' || theme === 'night';
    const bgColor = theme === 'light' ? '#f8fafc' : theme === 'dark' ? '#0f172a' : '#020617';
    const cardBg = theme === 'light' ? '#ffffff' : theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(15, 23, 42, 0.5)';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const subTextColor = isDark ? '#94a3b8' : '#64748b';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0';

    // Get authorization config with token
    const getAuthConfig = () => {
        const token = localStorage.getItem('token');
        return {
            headers: { Authorization: `Bearer ${token}` }
        };
    };

    useEffect(() => {
        fetchTasks();
    }, [viewMode]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError(null);
            const url = viewMode === 'all' && isAdmin ? `${API_URL}/all` : API_URL;
            const response = await axios.get(url, getAuthConfig());
            if (Array.isArray(response.data)) {
                setTasks(response.data);
            } else {
                console.error('Unexpected response format:', response.data);
                setTasks([]);
                setError('Received invalid data from server.');
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please login again.');
            } else {
                setError('Failed to load tasks. Please ensure the server is running.');
            }
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        try {
            if (editingTask) {
                // Update existing task
                const response = await axios.put(`${API_URL}/${editingTask._id}`, {
                    title: newTask,
                    description: newDescription,
                    priority: newPriority,
                    dueDate: newDueDate || null
                }, getAuthConfig());

                setTasks(prev => prev.map(t => t._id === editingTask._id ? response.data : t));
                alert('Task updated successfully!');
            } else {
                // Create new task
                const response = await axios.post(API_URL, {
                    title: newTask,
                    description: newDescription,
                    priority: newPriority,
                    dueDate: newDueDate || null
                }, getAuthConfig());

                setTasks(prev => [response.data, ...prev]);
            }

            // Reset form
            setEditingTask(null);
            setNewTask('');
            setNewDescription('');
            setNewPriority('medium');
            setNewDueDate('');
            setShowForm(false);
        } catch (error) {
            console.error('Error saving task:', error);
            alert(error.response?.data?.message || 'Failed to save task.');
        }
    };

    const handleEditClick = (task) => {
        setEditingTask(task);
        setNewTask(task.title);
        setNewDescription(task.description || '');
        setNewPriority(task.priority);
        setNewDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setEditingTask(null);
        setNewTask('');
        setNewDescription('');
        setNewPriority('medium');
        setNewDueDate('');
        setShowForm(false);
    };

    const handleToggleTask = async (task) => {
        try {
            const updatedTask = { ...task, isCompleted: !task.isCompleted };
            setTasks(prev => prev.map(t => t._id === task._id ? updatedTask : t));

            await axios.put(`${API_URL}/${task._id}`, {
                isCompleted: !task.isCompleted
            }, getAuthConfig());
        } catch (error) {
            console.error('Error updating task:', error);
            fetchTasks();
        }
    };

    const handleDeleteTask = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await axios.delete(`${API_URL}/${id}`, getAuthConfig());
            setTasks(prev => prev.filter(t => t._id !== id));
        } catch (error) {
            console.error('Error deleting task:', error);
            alert(error.response?.data?.message || 'Failed to delete task.');
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#22c55e';
            default: return '#64748b';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const activeTasks = Array.isArray(tasks) ? tasks.filter(task => !task.isCompleted) : [];
    const completedTasks = Array.isArray(tasks) ? tasks.filter(task => task.isCompleted) : [];

    if (loading && tasks.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen font-['Inter'] transition-colors duration-500" style={{ backgroundColor: bgColor, color: subTextColor }}>
                Loading your tasks...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen font-['Inter'] transition-colors duration-500 gap-4" style={{ backgroundColor: bgColor, color: '#ef4444' }}>
                <p>Error: {error}</p>
                <button onClick={fetchTasks} className="px-6 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all font-bold text-sm">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-['Inter'] transition-colors duration-500 p-10 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ backgroundColor: bgColor, color: textColor }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h1 style={{ color: textColor, fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>My Tasks</h1>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {isAdmin && (
                            <button
                                onClick={() => setViewMode(prev => prev === 'personal' ? 'all' : 'personal')}
                                className="transition-all hover:scale-105 active:scale-95 shadow-sm"
                                style={{
                                    padding: '10px 16px',
                                    backgroundColor: viewMode === 'all' ? '#1e293b' : cardBg,
                                    color: viewMode === 'all' ? 'white' : subTextColor,
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}
                            >
                                <Users size={16} />
                                {viewMode === 'all' ? 'All Users' : 'My Tasks'}
                            </button>
                        )}
                        {canWrite && (
                            <button
                                onClick={showForm ? handleCancelForm : () => setShowForm(true)}
                                className="transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: showForm ? '#94a3b8' : '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}
                            >
                                <Plus size={18} />
                                {showForm ? 'Cancel' : 'New Task'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Add Task Form */}
                {canWrite && showForm && (
                    <form onSubmit={handleAddTask} className="animate-in slide-in-from-top-4 duration-500" style={{
                        marginBottom: '30px',
                        padding: '32px',
                        backgroundColor: cardBg,
                        borderRadius: '24px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        border: `1px solid ${borderColor}`
                    }}>
                        <div style={{ marginBottom: '16px' }}>
                            <input
                                type="text"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                placeholder="Task title *"
                                required
                                style={{
                                    width: '100%',
                                    padding: '16px 20px',
                                    borderRadius: '16px',
                                    border: `1px solid ${borderColor}`,
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    outline: 'none',
                                    backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#f8fafc',
                                    color: textColor
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <textarea
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                placeholder="Description (optional)"
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '16px 20px',
                                    borderRadius: '16px',
                                    border: `1px solid ${borderColor}`,
                                    fontSize: '14px',
                                    outline: 'none',
                                    resize: 'vertical',
                                    backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#f8fafc',
                                    color: textColor
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '150px' }}>
                                <label style={{ display: 'block', fontSize: '10px', color: subTextColor, marginBottom: '8px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Priority</label>
                                <select
                                    value={newPriority}
                                    onChange={(e) => setNewPriority(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        border: `1px solid ${borderColor}`,
                                        fontSize: '14px',
                                        outline: 'none',
                                        backgroundColor: isDark ? 'rgba(30, 41, 59, 1)' : 'white',
                                        color: textColor
                                    }}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div style={{ flex: 1, minWidth: '150px' }}>
                                <label style={{ display: 'block', fontSize: '10px', color: subTextColor, marginBottom: '8px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Due Date</label>
                                <input
                                    type="date"
                                    value={newDueDate}
                                    onChange={(e) => setNewDueDate(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        border: `1px solid ${borderColor}`,
                                        fontSize: '14px',
                                        outline: 'none',
                                        backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'white',
                                        color: textColor
                                    }}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
                            style={{
                                padding: '14px 28px',
                                color: 'white',
                                border: 'none',
                                borderRadius: '14px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '900',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                width: '100%'
                            }}
                        >
                            {editingTask ? 'Update Task' : 'Create Task'}
                        </button>
                    </form>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {/* Active Tasks Section */}
                    <div>
                        <h2 style={{ fontSize: '14px', color: textColor, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            Active Tasks
                            <span style={{ fontSize: '10px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '2px 8px', borderRadius: '6px' }}>
                                {activeTasks.length}
                            </span>
                        </h2>

                        {activeTasks.length === 0 ? (
                            <p style={{ color: subTextColor, fontStyle: 'italic', padding: '40px', textAlign: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderRadius: '24px', border: `1px dashed ${borderColor}` }}>
                                No active tasks. Create one to get started!
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {activeTasks.map(task => (
                                    <div key={task._id} className="group hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        justifyContent: 'space-between',
                                        padding: '24px',
                                        backgroundColor: cardBg,
                                        borderRadius: '20px',
                                        border: `1px solid ${borderColor}`,
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flex: 1 }}>
                                            <button
                                                onClick={() => canWrite && handleToggleTask(task)}
                                                className="hover:scale-110 active:scale-90 transition-transform"
                                                style={{ background: 'none', border: 'none', cursor: canWrite ? 'pointer' : 'default', color: subTextColor, padding: 0, marginTop: '2px' }}
                                                title={canWrite ? "Mark as completed" : "Read-only"}
                                            >
                                                <Circle size={24} strokeWidth={1.5} />
                                            </button>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '16px', color: textColor, fontWeight: '700' }}>{task.title}</div>
                                                {task.description && (
                                                    <div style={{ fontSize: '14px', color: subTextColor, marginTop: '6px', lineHeight: '1.5' }}>{task.description}</div>
                                                )}
                                                <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: getPriorityColor(task.priority), backgroundColor: `${getPriorityColor(task.priority)}15`, padding: '4px 10px', borderRadius: '8px' }}>
                                                        <Flag size={12} fill={getPriorityColor(task.priority)} />
                                                        {task.priority}
                                                    </span>
                                                    {task.dueDate && (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '600', color: subTextColor, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', padding: '4px 10px', borderRadius: '8px' }}>
                                                            <Calendar size={12} />
                                                            {formatDate(task.dueDate)}
                                                        </span>
                                                    )}
                                                </div>
                                                {viewMode === 'all' && task.userId && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: subTextColor, marginTop: '12px', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f1f5f9', padding: '4px 8px', borderRadius: '6px', width: 'fit-content', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        <User size={10} />
                                                        {task.userId.name || 'Unknown User'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                            {canWrite && (
                                                <button
                                                    onClick={() => handleEditClick(task)}
                                                    className="p-2 hover:bg-blue-500/10 rounded-xl text-blue-500 transition-all"
                                                    title="Edit task"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDeleteTask(task._id)}
                                                    className="p-2 hover:bg-red-500/10 rounded-xl text-red-500 transition-all"
                                                    title="Delete task"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Completed Tasks Section */}
                    {completedTasks.length > 0 && (
                        <div>
                            <h2 style={{ fontSize: '14px', color: textColor, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '20px' }}>
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                Completed
                                <span style={{ fontSize: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 8px', borderRadius: '6px' }}>
                                    {completedTasks.length}
                                </span>
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {completedTasks.map(task => (
                                    <div key={task._id} style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        justifyContent: 'space-between',
                                        padding: '24px',
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                                        borderRadius: '20px',
                                        border: `1px solid ${borderColor}`,
                                        opacity: 0.7
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flex: 1 }}>
                                            <button
                                                onClick={() => canWrite && handleToggleTask(task)}
                                                className="hover:scale-110 active:scale-90 transition-transform"
                                                style={{ background: 'none', border: 'none', cursor: canWrite ? 'pointer' : 'default', color: '#10b981', padding: 0, marginTop: '2px' }}
                                                title={canWrite ? "Mark as active" : "Read-only"}
                                            >
                                                <CheckCircle2 size={24} strokeWidth={2} />
                                            </button>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '16px', color: subTextColor, textDecoration: 'line-through', fontWeight: '500' }}>{task.title}</div>
                                            </div>
                                        </div>
                                        {canDelete && (
                                            <button
                                                onClick={() => handleDeleteTask(task._id)}
                                                className="p-2 hover:bg-red-500/10 rounded-xl text-red-500 transition-all opacity-50 hover:opacity-100"
                                                title="Delete task"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tasks;
