import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';

/**
 * Restricted Component
 * 
 * Conditionally renders children if the authenticated user has the required permission.
 * Can disable elements instead of hiding them entirely.
 * 
 * @param {string} to - The feature/module name (e.g., 'Leads', 'Invoices')
 * @param {string} action - The required permission (Read, Write, Delete). Default: 'Read'
 * @param {ReactNode} children - The content to show if allowed
 * @param {ReactNode} fallback - The content to show if denied (optional)
 * @param {boolean} showLock - If true, shows a lock icon/tooltip instead of hiding
 * @param {boolean} disableOnly - If true, disables interaction but keeps element visible
 */
const Restricted = ({
    to,
    action = 'Read',
    children,
    fallback = null,
    showLock = false,
    disableOnly = false
}) => {
    const { hasPermission, loading, userRole } = useAuth();

    if (loading) return null;

    // Admin override
    if (userRole === 'Admin') return <>{children}</>;

    const allowed = hasPermission(to, action);

    if (allowed) {
        return <>{children}</>;
    }

    // If disableOnly, render with disabled state
    if (disableOnly) {
        return (
            <div
                style={{
                    pointerEvents: 'none',
                    opacity: 0.5,
                    cursor: 'not-allowed',
                    userSelect: 'none'
                }}
                title={`Access Restricted: You need '${action}' permission for '${to}'`}
            >
                {children}
            </div>
        );
    }

    if (showLock) {
        return (
            <span
                title={`Access Restricted: You need '${action}' permission for '${to}'`}
                style={{
                    cursor: 'not-allowed',
                    opacity: 0.5,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    pointerEvents: 'none'
                }}
            >
                <Lock size={14} />
                {children}
            </span>
        );
    }

    return fallback;
};

/**
 * RestrictedButton Component
 * 
 * A button that is disabled if the user doesn't have permission.
 * Shows a lock icon and tooltip when disabled.
 */
export const RestrictedButton = ({
    to,
    action = 'Write',
    children,
    onClick,
    style = {},
    className = '',
    ...props
}) => {
    const { hasPermission, loading, userRole } = useAuth();

    if (loading) return null;

    const allowed = userRole === 'Admin' || hasPermission(to, action);

    return (
        <button
            onClick={allowed ? onClick : undefined}
            disabled={!allowed}
            className={className}
            style={{
                ...style,
                cursor: allowed ? 'pointer' : 'not-allowed',
                opacity: allowed ? 1 : 0.5
            }}
            title={!allowed ? `You need '${action}' permission for '${to}'` : undefined}
            {...props}
        >
            {!allowed && <Lock size={14} style={{ marginRight: '6px' }} />}
            {children}
        </button>
    );
};

/**
 * RestrictedLink Component
 * 
 * A navigation link that shows but is disabled if user doesn't have permission.
 */
export const RestrictedLink = ({
    to: featureName,
    action = 'Read',
    children,
    onClick,
    href,
    style = {},
    ...props
}) => {
    const { hasPermission, loading, userRole } = useAuth();

    if (loading) return null;

    const allowed = userRole === 'Admin' || hasPermission(featureName, action);

    if (allowed) {
        return (
            <a href={href} onClick={onClick} style={style} {...props}>
                {children}
            </a>
        );
    }

    return (
        <span
            style={{
                ...style,
                cursor: 'not-allowed',
                opacity: 0.5,
                pointerEvents: 'none'
            }}
            title={`You need '${action}' permission for '${featureName}'`}
            {...props}
        >
            <Lock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            {children}
        </span>
    );
};

export default Restricted;
