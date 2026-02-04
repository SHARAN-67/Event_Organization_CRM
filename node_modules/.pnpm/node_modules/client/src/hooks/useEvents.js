import { useState, useCallback } from 'react';
import axios from 'axios';

export const useEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const API_URL = 'http://localhost:5000/api/deals';

    // Get auth config with token from localStorage
    const getAuthConfig = () => {
        const token = localStorage.getItem('token');
        return {
            headers: { Authorization: `Bearer ${token}` }
        };
    };

    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL, getAuthConfig());
            setEvents(response.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const createEvent = async (eventData) => {
        try {
            const response = await axios.post(API_URL, eventData, getAuthConfig());
            setEvents(prev => [response.data, ...prev]);
            return response.data;
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    };

    const updateEvent = async (id, eventData) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, eventData, getAuthConfig());
            setEvents(prev => prev.map(event => event._id === id ? response.data : event));
            return response.data;
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    };

    const updateEventStage = async (id, newStage) => {
        // Optimistic update
        setEvents(prev => prev.map(event =>
            event._id === id ? { ...event, stage: newStage } : event
        ));

        try {
            await axios.put(`${API_URL}/${id}`, { stage: newStage }, getAuthConfig());
        } catch (error) {
            console.error('Error updating event stage:', error);
            fetchEvents(); // Revert on error
        }
    };

    const deleteEvent = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`, getAuthConfig());
            setEvents(prev => prev.filter(event => event._id !== id));
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    return {
        events,
        loading,
        fetchEvents,
        createEvent,
        updateEvent,
        updateEventStage,
        deleteEvent
    };
};
