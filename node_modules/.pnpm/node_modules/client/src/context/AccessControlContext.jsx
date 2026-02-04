import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { POLICY } from '../security/policy';

const AccessControlContext = createContext(null);

export const AccessControlProvider = ({ children }) => {
    const { userRole } = useAuth(); // Get the role from existing AuthContext

    // Calculate permissions based on role
    const currentPermissions = useMemo(() => {
        if (!userRole) return [];
        return POLICY[userRole] || [];
    }, [userRole]);

    /**
     * Check if the user has a specific permission.
     * @param {string} permission - The permission string (e.g. 'leads:manage')
     * @returns {boolean}
     */
    const can = (permission) => {
        // Fallback for Admin superuser if policy missing/typo, though explicit policy is better
        if (userRole === 'Admin') return true;

        return currentPermissions.includes(permission);
    };

    return (
        <AccessControlContext.Provider value={{ can, permissions: currentPermissions }}>
            {children}
        </AccessControlContext.Provider>
    );
};

export const useAccessControl = () => {
    const context = useContext(AccessControlContext);
    if (!context) {
        throw new Error('useAccessControl must be used within an AccessControlProvider');
    }
    return context;
};
