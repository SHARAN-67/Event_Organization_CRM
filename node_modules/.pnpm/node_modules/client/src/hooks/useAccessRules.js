import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

/**
 * Custom hook for managing Access Rules CRUD operations.
 * Provides state management and API calls for the access control system.
 */
export const useAccessRules = () => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastModified, setLastModified] = useState({ by: 'System', at: null });

    const getAuthConfig = () => {
        const token = localStorage.getItem('token');
        return {
            headers: { Authorization: `Bearer ${token}` }
        };
    };

    /**
     * Fetch all access rules from the server
     */
    const fetchRules = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/access-rules`, getAuthConfig());
            setRules(response.data);

            // Extract last modified info from rules
            const sorted = [...response.data].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            if (sorted[0]) {
                setLastModified({ by: sorted[0].updatedBy || 'System', at: sorted[0].updatedAt });
            }

            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to fetch access rules';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Update a single access rule
     * @param {string} ruleId - The rule ID to update
     * @param {object} ruleData - The updated rule data
     */
    const updateRule = async (ruleId, ruleData) => {
        try {
            const response = await axios.put(`${API_URL}/access-rules/${ruleId}`, ruleData, getAuthConfig());
            setRules(prev => prev.map(r => r._id === ruleId ? response.data : r));
            setLastModified({ by: response.data.updatedBy || 'Admin', at: response.data.updatedAt });
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to update access rule';
            return { success: false, error: errorMessage };
        }
    };

    /**
     * Save all modified rules (bulk update)
     * @param {array} modifiedRules - Array of rules to save
     */
    const saveAllRules = async (modifiedRules) => {
        setLoading(true);
        try {
            for (const rule of modifiedRules) {
                await axios.put(`${API_URL}/access-rules/${rule._id}`, rule, getAuthConfig());
            }
            await fetchRules(); // Refresh to get updated timestamps
            return { success: true, message: 'All rules saved successfully' };
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to save access rules';
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Add a new access rule
     * @param {object} ruleData - The new rule data
     */
    const addRule = async (ruleData) => {
        try {
            const response = await axios.post(`${API_URL}/access-rules`, ruleData, getAuthConfig());
            setRules(prev => [...prev, response.data]);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to add access rule';
            return { success: false, error: errorMessage };
        }
    };

    /**
     * Delete an access rule
     * @param {string} ruleId - The rule ID to delete
     */
    const deleteRule = async (ruleId) => {
        try {
            await axios.delete(`${API_URL}/access-rules/${ruleId}`, getAuthConfig());
            setRules(prev => prev.filter(r => r._id !== ruleId));
            return { success: true, message: 'Access rule deleted' };
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to delete access rule';
            return { success: false, error: errorMessage };
        }
    };

    /**
     * Reset all access rules to factory defaults
     */
    const resetDefaults = async () => {
        setLoading(true);
        try {
            await axios.post(`${API_URL}/access-rules/reset`, {}, getAuthConfig());
            await fetchRules(); // Refresh rules after reset
            return { success: true, message: 'Access rules reset to defaults' };
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to reset access rules';
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Toggle a permission for a specific rule and role
     * @param {string} ruleId - The rule ID
     * @param {string} role - The role key (admin, leadPlanner, assistant)
     * @param {string} permission - The permission to toggle (Read, Write, Delete)
     */
    const togglePermission = (ruleId, role, permission) => {
        setRules(prev => prev.map(rule => {
            if (rule._id === ruleId) {
                const currentPerms = [...(rule[role] || [])];
                const updatedPerms = currentPerms.includes(permission)
                    ? currentPerms.filter(p => p !== permission)
                    : [...currentPerms, permission];
                return { ...rule, [role]: updatedPerms };
            }
            return rule;
        }));
    };

    /**
     * Toggle all permissions for a module (enable all or disable all)
     * @param {string} moduleName - The module name (Sales, Activities, etc.)
     * @param {string} role - The role key
     * @param {boolean} enable - Whether to enable or disable all permissions
     */
    const toggleModulePermissions = (moduleName, role, enable) => {
        setRules(prev => prev.map(rule => {
            if (rule.module === moduleName) {
                return {
                    ...rule,
                    [role]: enable ? [...rule.availablePermissions] : []
                };
            }
            return rule;
        }));
    };

    return {
        rules,
        setRules,
        loading,
        error,
        lastModified,
        fetchRules,
        updateRule,
        saveAllRules,
        addRule,
        deleteRule,
        resetDefaults,
        togglePermission,
        toggleModulePermissions
    };
};

export default useAccessRules;
