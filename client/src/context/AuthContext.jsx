import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [permissions, setPermissions] = useState([]);
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'Assistant');
    const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
    const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
    const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
    const [mustChangePassword, setMustChangePassword] = useState(localStorage.getItem('mustChangePassword') === 'true');
    const [loading, setLoading] = useState(true);

    const fetchPermissions = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const res = await axios.get(`${API_URL}/auth/access-rules`, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000 // 10 second timeout to prevent infinite loading
            });
            setPermissions(res.data);
            console.log('[RBAC] Loaded', res.data.length, 'access rules');
        } catch (err) {
            console.error("[RBAC] Fetch Failed", err);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.clear();
        setUserRole('Assistant');
        setUserName('');
        setUserEmail('');
        setUserId('');
        setPermissions([]);
        window.location.href = '/auth/login';
    };

    /**
     * Session Timeout Logic (30 minutes of inactivity)
     */
    useEffect(() => {
        let timeout;
        const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes

        const resetTimeout = () => {
            if (timeout) clearTimeout(timeout);
            if (localStorage.getItem('token')) {
                timeout = setTimeout(() => {
                    console.log("[SECURITY] Session timed out due to inactivity");
                    logout();
                }, TIMEOUT_DURATION);
            }
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => document.addEventListener(event, resetTimeout));

        resetTimeout(); // Initialize

        return () => {
            if (timeout) clearTimeout(timeout);
            events.forEach(event => document.removeEventListener(event, resetTimeout));
        };
    }, [userId]);

    useEffect(() => {
        fetchPermissions();
    }, []);

    /**
     * Check if the current user has permission for a feature/action.
     * @param {string} feature - The feature name (e.g., 'Leads', 'Products')
     * @param {string} action - The action (Read, Write, Delete). Default: 'Read'
     * @returns {boolean} - True if allowed, false if denied
     */
    const hasPermission = (feature, action = 'Read') => {
        // Admin always has full access (case insensitive)
        if (userRole && userRole.toLowerCase() === 'admin') return true;

        // Find the rule for this feature
        const rule = permissions.find(r => r.feature === feature);

        // IMPORTANT: If no rule exists for this feature, DENY access (secure by default)
        // This prevents access to features that haven't been configured
        if (!rule) {
            console.warn(`[RBAC] No rule found for feature "${feature}" - DENIED`);
            return false;
        }

        // Map user role to the correct key in the rule
        const normalizedRole = userRole ? userRole.toLowerCase() : '';
        const roleKey = normalizedRole === 'lead planner' ? 'leadPlanner' : 'assistant';

        // Check if the role has the required action permission
        const rolePermissions = rule[roleKey] || [];
        const allowed = rolePermissions.includes(action);

        if (!allowed) {
            console.log(`[RBAC] ${userRole} denied "${action}" on "${feature}"`);
        }

        return allowed;
    };

    /**
     * Refresh the user role from localStorage
     */
    const refreshUserRole = () => {
        setUserRole(localStorage.getItem('userRole') || 'Assistant');
        setUserName(localStorage.getItem('userName') || '');
        setUserEmail(localStorage.getItem('userEmail') || '');
        setUserId(localStorage.getItem('userId') || '');
        setMustChangePassword(localStorage.getItem('mustChangePassword') === 'true');
    };

    /**
     * Update user details globally
     */
    const updateUser = (userData) => {
        if (userData.name) {
            setUserName(userData.name);
            localStorage.setItem('userName', userData.name);
        }
        if (userData.email) {
            setUserEmail(userData.email);
            localStorage.setItem('userEmail', userData.email);
        }
        if (userData.role) {
            setUserRole(userData.role);
            localStorage.setItem('userRole', userData.role);
        }
        if (userData.id || userData._id) {
            const id = userData.id || userData._id;
            setUserId(id);
            localStorage.setItem('userId', id);
        }
    };

    return (
        <AuthContext.Provider value={{
            permissions,
            userRole,
            userName,
            userEmail,
            userId,
            hasPermission,
            loading,
            refreshPermissions: fetchPermissions,
            refreshUserRole,
            updateUser,
            logout,
            mustChangePassword
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
