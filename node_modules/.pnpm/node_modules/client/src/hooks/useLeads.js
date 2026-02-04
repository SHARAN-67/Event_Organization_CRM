import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/leads';

export const useLeads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get auth config with token from localStorage
    const getAuthConfig = () => {
        const token = localStorage.getItem('token');
        return {
            headers: { Authorization: `Bearer ${token}` }
        };
    };

    const fetchLeads = useCallback(async (filters = {}) => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters).toString();
            const url = params ? `${API_URL}?${params}` : API_URL;
            const response = await axios.get(url, getAuthConfig());
            setLeads(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch leads');
        } finally {
            setLoading(false);
        }
    }, []);

    const addLead = async (leadData) => {
        try {
            const response = await axios.post(API_URL, leadData, getAuthConfig());
            setLeads(prev => [response.data, ...prev]);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Failed to add lead' };
        }
    };

    const updateLead = async (id, leadData) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, leadData, getAuthConfig());
            setLeads(prev => prev.map(l => l._id === id ? response.data : l));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Failed to update lead' };
        }
    };

    const updateLeadStatus = async (id, status, additionalData = {}) => {
        try {
            const response = await axios.patch(`${API_URL}/${id}/status`, { status, ...additionalData }, getAuthConfig());
            setLeads(prev => prev.map(l => l._id === id ? response.data : l));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Failed to update status' };
        }
    };

    const deleteLead = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`, getAuthConfig());
            setLeads(prev => prev.filter(l => l._id !== id));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Failed to delete lead' };
        }
    };

    return { leads, loading, error, fetchLeads, addLead, updateLead, deleteLead, updateLeadStatus };
};
