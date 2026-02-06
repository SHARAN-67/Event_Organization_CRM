import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get auth config with token from localStorage
    const getAuthConfig = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        return {
            headers: { Authorization: `Bearer ${token}` }
        };
    };

    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${API_BASE_URL}/deals`, getAuthConfig());
            setEvents(response.data);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch events';
            setError(errorMessage);
            console.error('Error fetching events:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createEvent = async (eventData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.post(`${API_BASE_URL}/deals`, eventData, getAuthConfig());
            setEvents(prev => [response.data, ...prev]);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to create event';
            setError(errorMessage);
            console.error('Error creating event:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateEvent = async (id, eventData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.put(`${API_BASE_URL}/deals/${id}`, eventData, getAuthConfig());
            setEvents(prev => prev.map(event => event._id === id ? response.data : event));
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update event';
            setError(errorMessage);
            console.error('Error updating event:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateEventStage = async (id, newStage) => {
        // Optimistic update
        const previousEvents = [...events];
        setEvents(prev => prev.map(event =>
            event._id === id ? { ...event, stage: newStage } : event
        ));

        try {
            setError(null);
            await axios.put(`${API_BASE_URL}/deals/${id}`, { stage: newStage }, getAuthConfig());
        } catch (err) {
            // Revert on error
            setEvents(previousEvents);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update event stage';
            setError(errorMessage);
            console.error('Error updating event stage:', err);
            throw err;
        }
    };

    const deleteEvent = async (id) => {
        // Optimistic delete
        const previousEvents = [...events];
        setEvents(prev => prev.filter(event => event._id !== id));

        try {
            setError(null);
            await axios.delete(`${API_BASE_URL}/deals/${id}`, getAuthConfig());
        } catch (err) {
            // Revert on error
            setEvents(previousEvents);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to delete event';
            setError(errorMessage);
            console.error('Error deleting event:', err);
            throw err;
        }
    };

    return {
        events,
        loading,
        error,
        fetchEvents,
        createEvent,
        updateEvent,
        updateEventStage,
        deleteEvent
    };
};
