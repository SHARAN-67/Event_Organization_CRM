import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from 'lucide-react';
import './Meetings.css';

const API_URL = 'http://localhost:5000/api/events';

// Helper to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

const ScheduleCalendar = () => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState(today.getDate());
    const [showModal, setShowModal] = useState(false);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({
        eventName: '',
        description: '',
        startDate: '',
        endDate: '',
        venue: '',
        status: 'Planning',
        eventType: 'Meeting',
        budget: 0,
        amountSpent: 0
    });
    const [errors, setErrors] = useState({});

    // Fetch events from MongoDB
    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await fetch(API_URL, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            setEvents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    // Navigate to previous month
    const goToPreviousMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
        setSelectedDate(null);
    };

    // Navigate to next month
    const goToNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
        setSelectedDate(null);
    };

    // Go to today
    const goToToday = () => {
        const now = new Date();
        setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
        setSelectedDate(now.getDate());
    };

    // Check if a day is today
    const isToday = (day) => {
        return (
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
        );
    };

    // Generate calendar grid
    const calendarGrid = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const grid = [];

        // Add trailing days from previous month
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            grid.push({ day: daysInPrevMonth - i, current: false, isPrev: true });
        }

        // Add current month days
        for (let i = 1; i <= daysInMonth; i++) {
            grid.push({ day: i, current: true, isPrev: false });
        }

        // Add leading days from next month to complete the grid
        const remaining = 42 - grid.length;
        for (let i = 1; i <= remaining; i++) {
            grid.push({ day: i, current: false, isPrev: false });
        }

        return grid;
    }, [currentDate]);

    // Helper to get color for event type
    const getEventTypeColor = (type) => {
        switch (type) {
            case 'Venue Visit': return '#3b82f6'; // Blue
            case 'AV Setup': return '#06b6d4';    // Teal
            case 'Meeting': return '#10b981';     // Green
            case 'Deadline': return '#ef4444';    // Red
            default: return '#64748b';
        }
    };

    // Helper to get events for a specific day in the grid
    const getEventsForDay = (day) => {
        if (!day) return [];
        const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const checkTime = dateObj.setHours(12, 0, 0, 0);

        return events.filter(event => {
            const start = new Date(event.startDate).setHours(0, 0, 0, 0);
            const end = new Date(event.endDate).setHours(23, 59, 59, 999);
            return checkTime >= start && checkTime <= end;
        });
    };

    // Get events for selected date
    const getEventsForSelectedDate = () => {
        if (!selectedDate) return [];
        const selectedDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate);
        return events.filter(event => {
            const eventStart = new Date(event.startDate);
            const eventEnd = new Date(event.endDate);
            // Format dates to compare just the day part for simpler logic if needed, 
            // but here we check if the selected date falls within the range
            // Reset hours to ensure we cover the whole day
            const startCheck = new Date(eventStart).setHours(0, 0, 0, 0);
            const endCheck = new Date(eventEnd).setHours(23, 59, 59, 999);
            const currentCheck = selectedDateObj.setHours(12, 0, 0, 0);

            return currentCheck >= startCheck && currentCheck <= endCheck;
        });
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};
        if (!formData.eventName.trim()) newErrors.eventName = 'Event name is required';
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (!formData.venue.trim()) newErrors.venue = 'Venue is required';
        if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
            newErrors.endDate = 'End date must be after start date';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submit (Create or Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const url = editingEvent ? `${API_URL}/${editingEvent._id}` : API_URL;
            const method = editingEvent ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const savedEvent = await response.json();

                if (editingEvent) {
                    // Update in list
                    setEvents(prev => prev.map(ev => ev._id === savedEvent._id ? savedEvent : ev));
                } else {
                    // Add to list
                    setEvents(prev => [...prev, savedEvent]);
                }

                setShowModal(false);
                resetForm();
            } else {
                const error = await response.json();
                alert('Error: ' + error.message);
            }
        } catch (error) {
            console.error('Error saving event:', error);
            alert('Failed to save event. Make sure the server is running.');
        }
        setLoading(false);
    };

    // Handle Delete
    const handleDelete = async () => {
        if (!editingEvent || !window.confirm('Are you sure you want to delete this event?')) return;

        setDeleteLoading(true);
        try {
            const response = await fetch(`${API_URL}/${editingEvent._id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                setEvents(prev => prev.filter(ev => ev._id !== editingEvent._id));
                setShowModal(false);
                resetForm();
            } else {
                const error = await response.json();
                alert('Error: ' + error.message);
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event.');
        }
        setDeleteLoading(false);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            eventName: '',
            description: '',
            startDate: '',
            endDate: '',
            venue: '',
            status: 'Planning',
            eventType: 'Meeting',
            budget: 0,
            amountSpent: 0
        });
        setErrors({});
        setEditingEvent(null);
    };

    // Open modal for Create
    const openCreateModal = () => {
        resetForm();
        // Pre-fill start date with selected date if available
        if (selectedDate) {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            setFormData(prev => ({ ...prev, startDate: dateStr, endDate: dateStr, eventType: 'Meeting' }));
        }
        setShowModal(true);
    };

    // Open modal for Edit
    const openEditModal = (event) => {
        setEditingEvent(event);
        setFormData({
            eventName: event.eventName,
            description: event.description || '',
            startDate: event.startDate.split('T')[0],
            endDate: event.endDate.split('T')[0],
            venue: event.venue,
            status: event.status,
            eventType: event.eventType || 'Meeting',
            budget: event.budget || 0,
            amountSpent: event.amountSpent || 0
        });
        setErrors({});
        setShowModal(true);
    };

    const selectedEvents = getEventsForSelectedDate();

    return (
        <div className="calendar-page">
            <header className="calendar-header">
                <h1>Schedule Calendar</h1>
                <p>Manage venue visits, AV setups, and important deadlines.</p>
            </header>

            <main className="calendar-layout">
                {/* Calendar Section */}
                <section className="calendar-card">
                    <div className="calendar-top">
                        <h2 className="month-title">
                            {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
                        </h2>
                        <div className="nav-controls">
                            <button className="nav-btn" onClick={goToPreviousMonth}>
                                <ChevronLeft size={18} />
                            </button>
                            <button className="today-btn" onClick={goToToday}>Today</button>
                            <button className="nav-btn" onClick={goToNextMonth}>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="weekday-row">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d =>
                            <div key={d} className="weekday">{d}</div>
                        )}
                    </div>

                    <div className="days-grid">
                        {calendarGrid.map((item, idx) =>
                            <div
                                key={idx}
                                onClick={() => item.current && setSelectedDate(item.day)}
                                className={`day-cell ${!item.current ? 'other-month' : ''} ${item.current && selectedDate === item.day ? 'selected' : ''} ${item.current && isToday(item.day) ? 'today' : ''}`}
                            >
                                {item.day}
                                {item.current && (
                                    <div className="day-events-indicator">
                                        {getEventsForDay(item.day).slice(0, 3).map((ev, i) =>
                                            <div
                                                key={i}
                                                className="event-dot"
                                                style={{ backgroundColor: getEventTypeColor(ev.eventType) }}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* Side Panel */}
                <aside className="info-panel">
                    <div className="panel-header">
                        <h2>{selectedDate ? `Events for ${currentDate.toLocaleString('default', { month: 'short' })} ${selectedDate}` : 'Select a date'}</h2>
                        <button className="add-event-btn" onClick={openCreateModal}>
                            <Plus size={16} /> Add
                        </button>
                    </div>

                    <div className="eventType-legend">
                        <h3>Event Types</h3>
                        <div className="legend-grid">
                            {[
                                { label: 'Venue Visit', color: '#3b82f6' },
                                { label: 'AV Setup', color: '#06b6d4' },
                                { label: 'Meeting', color: '#10b981' },
                                { label: 'Deadline', color: '#ef4444' }
                            ].map(type =>
                                <div key={type.label} className="legend-item">
                                    <span className="legend-dot" style={{ backgroundColor: type.color }}></span>
                                    <span>{type.label}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="events-list">
                        {selectedEvents.length === 0
                            ? <span className="no-events">No events scheduled</span>
                            : selectedEvents.map(event =>
                                <div
                                    key={event._id}
                                    className="event-item"
                                    onClick={() => openEditModal(event)}
                                    title="Click to edit"
                                >
                                    <div
                                        className="event-color-bar"
                                        style={{ backgroundColor: getEventTypeColor(event.eventType) }}
                                    ></div>
                                    <div className="event-content">
                                        <div className="event-title">
                                            {event.eventName}
                                            {event.changeLog && event.changeLog.length > 0 && event.status === 'Live' && (
                                                <span onClick={(e) => { e.stopPropagation(); openHistoryModal(event); }} style={{ marginLeft: '8px', fontSize: '12px', cursor: 'pointer' }}>⚠️</span>
                                            )}
                                        </div>
                                        <div className="event-venue">{event.venue}</div>
                                        <div className="event-meta">
                                            <div className={`event-status status-${event.status.toLowerCase().replace(' ', '-')}`}>{event.status}</div>
                                            <span className="event-type-label">{event.eventType}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </aside>
            </main>

            {/* Event Form Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form className="event-form" onSubmit={handleSubmit}>
                            {/* ... Form Content ... */}
                            <div className="form-group">
                                <label>Event Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="eventName"
                                    value={formData.eventName}
                                    onChange={handleInputChange}
                                    placeholder="Enter event name"
                                    className={errors.eventName ? 'error' : ''}
                                />
                                {errors.eventName && <span className="error-text">{errors.eventName}</span>}
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter description"
                                    rows="3"
                                ></textarea>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Date <span className="required">*</span></label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        className={errors.startDate ? 'error' : ''}
                                    />
                                    {errors.startDate && <span className="error-text">{errors.startDate}</span>}
                                </div>
                                <div className="form-group">
                                    <label>End Date <span className="required">*</span></label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        className={errors.endDate ? 'error' : ''}
                                    />
                                    {errors.endDate && <span className="error-text">{errors.endDate}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Venue <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="venue"
                                    value={formData.venue}
                                    onChange={handleInputChange}
                                    placeholder="Enter venue"
                                    className={errors.venue ? 'error' : ''}
                                />
                                {errors.venue && <span className="error-text">{errors.venue}</span>}
                            </div>

                            <div className="form-group">
                                <label>Event Type</label>
                                <select
                                    name="eventType"
                                    value={formData.eventType}
                                    onChange={handleInputChange}
                                >
                                    <option value="Meeting">Meeting</option>
                                    <option value="Venue Visit">Venue Visit</option>
                                    <option value="AV Setup">AV Setup</option>
                                    <option value="Deadline">Deadline</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="Planning">Planning</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                    {/* Make sure Live is available */}
                                    <option value="Live">Live</option>
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Budget</label>
                                    <input
                                        type="number"
                                        name="budget"
                                        value={formData.budget}
                                        onChange={handleInputChange}
                                        min={0}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Amount Spent</label>
                                    <input
                                        type="number"
                                        name="amountSpent"
                                        value={formData.amountSpent}
                                        onChange={handleInputChange}
                                        min={0}
                                    />
                                </div>
                            </div>

                            <div className="form-buttons">
                                {editingEvent && (
                                    <button
                                        type="button"
                                        className="btn-danger"
                                        onClick={handleDelete}
                                        disabled={deleteLoading || loading}
                                    >
                                        {deleteLoading ? 'Deleting...' : 'Delete Event'}
                                    </button>
                                )}
                                <div style={{ flex: 1 }}></div>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={loading || deleteLoading}
                                >
                                    {loading ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleCalendar;