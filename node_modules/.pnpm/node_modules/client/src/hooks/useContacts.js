import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/contacts';

export function useContacts() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);

    // Get auth config with token from localStorage
    const getAuthConfig = () => {
        const token = localStorage.getItem('token');
        return {
            headers: { Authorization: `Bearer ${token}` }
        };
    };

    const fetchContacts = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setLoading(true);
        try {
            const response = await axios.get(API_URL, getAuthConfig());
            setContacts(response.data);
            setIsConnected(true);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            setIsConnected(false);
        } finally {
            setLoading(false);
        }
    }, []);

    const getContact = useCallback(async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Error fetching single contact:', error);
            throw error;
        }
    }, []);

    // Initial Fetch
    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    const createContact = async (contactData) => {
        try {
            const response = await axios.post(API_URL, contactData, getAuthConfig());
            setContacts(prev => [...prev, response.data]);
            return response.data;
        } catch (error) {
            console.error('Error creating contact:', error);
            throw error;
        }
    };

    const updateContact = async (contactId, contactData) => {
        try {
            const response = await axios.put(`${API_URL}/${contactId}`, contactData, getAuthConfig());
            setContacts(prev => prev.map(c => c._id === contactId ? response.data : c));
            return response.data;
        } catch (error) {
            console.error('Error updating contact:', error);
            throw error;
        }
    };

    const deleteContact = async (contactId) => {
        try {
            await axios.delete(`${API_URL}/${contactId}`, getAuthConfig());
            setContacts(prev => prev.filter(c => c._id !== contactId));
        } catch (error) {
            console.error('Error deleting contact:', error);
            throw error;
        }
    };

    return {
        contacts,
        loading,
        isConnected,
        createContact,
        updateContact,
        deleteContact,
        refreshContacts: fetchContacts,
        getContact
    };
}
