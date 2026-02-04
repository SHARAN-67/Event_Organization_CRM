import React from 'react';
import { useAccessControl } from '../../context/AccessControlContext';
import { Lock } from 'lucide-react';

/**
 * Restricted Component
 * @param {string} to - The required permission (e.g. 'leads:manage')
 * @param {ReactNode} children - The content to render if allowed
 * @param {ReactNode} fallback - Optional content to render if denied (default: null/unmount)
 */
const Restricted = ({ to, children, fallback = null }) => {
    const { can } = useAccessControl();

    if (can(to)) {
        return <>{children}</>;
    }

    return fallback;
};

export default Restricted;
